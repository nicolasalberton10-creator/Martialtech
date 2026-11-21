import express from "express";
import bcrypt from "bcryptjs";
import db from "../db/database.js";

const router = express.Router();

const FAIXAS = ["Faixa branca", "Faixa amarela", "Faixa laranja", "Faixa verde", "Faixa azul", "Faixa marrom", "Faixa preta"];

async function calcularXp(usuarioId) {
    const [aulas] = await db.query(
        "SELECT COALESCE(SUM(FLOOR(percentual / 10) * 5), 0) AS xp FROM progresso_aulas WHERE usuario_id = ?",
        [usuarioId]
    );
    const [quiz] = await db.query(
        "SELECT COALESCE(SUM(xp), 0) AS xp FROM quiz_acertos WHERE usuario_id = ?",
        [usuarioId]
    );

    const total = Number(aulas[0].xp) + Number(quiz[0].xp);
    const nivel = Math.min(Math.floor(total / 100), FAIXAS.length - 1);

    return {
        total: total,
        faixa: FAIXAS[nivel],
        pct: nivel === FAIXAS.length - 1 ? 100 : total % 100
    };
}

router.post("/cadastro", async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ message: "Preencha todos os campos." });
    }

    try {
        const [existe] = await db.query("SELECT id FROM usuarios WHERE email = ?", [email]);
        if (existe.length > 0) {
            return res.status(409).json({ message: "Este e-mail já está cadastrado." });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const [resultado] = await db.query(
            "INSERT INTO usuarios (nome, email, senha_hash, tipo) VALUES (?, ?, ?, ?)",
            [nome, email, senhaCriptografada, "Aluno"]   // quem se cadastra pelo site é sempre Aluno
        );

        res.status(201).json({ id: resultado.insertId, username: nome, tipo: "Aluno" });
    } catch (erro) {
        console.log(erro);
        res.status(500).json({ message: "Erro no servidor." });
    }
});

router.post("/login", async (req, res) => {
    const { email, senha } = req.body;

    try {
        const [usuarios] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);
        if (usuarios.length === 0 || !(await bcrypt.compare(senha, usuarios[0].senha_hash))) {
            return res.status(401).json({ message: "E-mail ou senha incorretos." });
        }

        res.json({ id: usuarios[0].id, username: usuarios[0].nome, tipo: usuarios[0].tipo });
    } catch (erro) {
        console.log(erro);
        res.status(500).json({ message: "Erro no servidor." });
    }
});

router.get("/xp/:usuario", async (req, res) => {
    res.json(await calcularXp(req.params.usuario));
});

router.get("/aulas", async (req, res) => {
    const usuario = req.query.usuario || 0;

    const [aulas] = await db.query(
        `SELECT a.id, a.titulo, a.professor, a.duracao_min, a.nivel,
                m.slug AS arte, m.nome AS arte_nome,
                COALESCE(p.percentual, 0) AS percentual
           FROM aulas a
           JOIN artes_marciais m ON m.id = a.arte_id
           LEFT JOIN progresso_aulas p ON p.aula_id = a.id AND p.usuario_id = ?
          ORDER BY a.id`,
        [usuario]
    );

    res.json(aulas);
});

router.post("/aulas/:id/progresso", async (req, res) => {
    const aula = req.params.id;
    const usuario = req.body.usuario;

    await db.query(
        `INSERT INTO progresso_aulas (usuario_id, aula_id, percentual) VALUES (?, ?, 20)
         ON DUPLICATE KEY UPDATE percentual = LEAST(percentual + 20, 100)`,
        [usuario, aula]
    );

    const [linha] = await db.query(
        "SELECT percentual FROM progresso_aulas WHERE usuario_id = ? AND aula_id = ?",
        [usuario, aula]
    );

    res.json({ percentual: linha[0].percentual, xp: await calcularXp(usuario) });
});

router.get("/quiz", async (req, res) => {
    const usuario = req.query.usuario || 0;

    const [artes] = await db.query(
        `SELECT m.slug, m.nome, m.descricao,
                COUNT(DISTINCT q.id) AS total,
                COUNT(DISTINCT ac.pergunta_id) AS acertos
           FROM artes_marciais m
           JOIN quiz_perguntas q ON q.arte_id = m.id
           LEFT JOIN quiz_acertos ac ON ac.pergunta_id = q.id AND ac.usuario_id = ?
          GROUP BY m.id
          ORDER BY m.id`,
        [usuario]
    );

    res.json(artes);
});

router.get("/quiz/:slug", async (req, res) => {
    const [artes] = await db.query("SELECT id, slug, nome FROM artes_marciais WHERE slug = ?", [req.params.slug]);
    if (artes.length === 0) {
        return res.status(404).json({ message: "Arte marcial não encontrada." });
    }

    const [perguntas] = await db.query(
        "SELECT id, enunciado FROM quiz_perguntas WHERE arte_id = ? ORDER BY id",
        [artes[0].id]
    );

    for (const pergunta of perguntas) {
        const [alternativas] = await db.query(
            "SELECT id, texto FROM quiz_alternativas WHERE pergunta_id = ? ORDER BY RAND()",
            [pergunta.id]
        );
        pergunta.alternativas = alternativas;
    }

    res.json({ arte: artes[0], perguntas: perguntas });
});

router.post("/responder", async (req, res) => {
    const { usuario, alternativa } = req.body;

    const [alt] = await db.query(
        `SELECT a.id, a.pergunta_id, a.correta, q.explicacao
           FROM quiz_alternativas a
           JOIN quiz_perguntas q ON q.id = a.pergunta_id
          WHERE a.id = ?`,
        [alternativa]
    );
    if (alt.length === 0) {
        return res.status(404).json({ message: "Alternativa não encontrada." });
    }

    const correta = alt[0].correta === 1;

    await db.query(
        "INSERT INTO quiz_respostas (usuario_id, pergunta_id, alternativa_id, correta) VALUES (?, ?, ?, ?)",
        [usuario, alt[0].pergunta_id, alt[0].id, correta]
    );

    let xpGanho = 0;
    let jaGanho = false;

    if (correta) {
        const [r] = await db.query(
            "INSERT IGNORE INTO quiz_acertos (usuario_id, pergunta_id, xp) VALUES (?, ?, 10)",
            [usuario, alt[0].pergunta_id]
        );
        if (r.affectedRows > 0) {
            xpGanho = 10;
        } else {
            jaGanho = true;
        }
    }

    const [certa] = await db.query(
        "SELECT id FROM quiz_alternativas WHERE pergunta_id = ? AND correta = TRUE",
        [alt[0].pergunta_id]
    );

    res.json({
        correta: correta,
        corretaId: certa[0].id,
        explicacao: alt[0].explicacao,
        xpGanho: xpGanho,
        jaGanho: jaGanho,
        xp: await calcularXp(usuario)
    });
});

async function soAdmin(req, res, next) {
    const id = (req.body && req.body.usuario) || req.query.usuario || 0;
    const [linhas] = await db.query("SELECT id FROM usuarios WHERE id = ? AND tipo = 'Administrador'", [id]);

    if (linhas.length === 0) {
        return res.status(403).json({ message: "Apenas o administrador pode fazer isso." });
    }
    next();
}

router.get("/artes", async (req, res) => {
    const [artes] = await db.query("SELECT id, slug, nome FROM artes_marciais ORDER BY id");
    res.json(artes);
});

router.post("/admin/aulas", soAdmin, async (req, res) => {
    const { arte_id, titulo, professor, duracao_min, nivel } = req.body;

    await db.query(
        "INSERT INTO aulas (arte_id, titulo, professor, duracao_min, nivel) VALUES (?, ?, ?, ?, ?)",
        [arte_id, titulo, professor, duracao_min, nivel]
    );
    res.status(201).json({ message: "Aula criada." });
});

router.put("/admin/aulas/:id", soAdmin, async (req, res) => {
    const { arte_id, titulo, professor, duracao_min, nivel } = req.body;

    await db.query(
        "UPDATE aulas SET arte_id = ?, titulo = ?, professor = ?, duracao_min = ?, nivel = ? WHERE id = ?",
        [arte_id, titulo, professor, duracao_min, nivel, req.params.id]
    );
    res.json({ message: "Aula atualizada." });
});

router.delete("/admin/aulas/:id", soAdmin, async (req, res) => {
    await db.query("DELETE FROM aulas WHERE id = ?", [req.params.id]);
    res.json({ message: "Aula excluída." });
});

router.get("/admin/quiz/:slug", soAdmin, async (req, res) => {
    const [perguntas] = await db.query(
        `SELECT q.id, q.enunciado, q.explicacao
           FROM quiz_perguntas q
           JOIN artes_marciais m ON m.id = q.arte_id
          WHERE m.slug = ?
          ORDER BY q.id`,
        [req.params.slug]
    );

    for (const pergunta of perguntas) {
        const [alternativas] = await db.query(
            "SELECT id, texto, correta FROM quiz_alternativas WHERE pergunta_id = ? ORDER BY id",
            [pergunta.id]
        );
        pergunta.alternativas = alternativas;
    }

    res.json(perguntas);
});

router.post("/admin/quiz", soAdmin, async (req, res) => {
    const { arte_id, enunciado, explicacao, alternativas } = req.body;

    const certas = alternativas.filter((a) => a.correta).length;
    if (!enunciado || alternativas.length < 2 || certas !== 1) {
        return res.status(400).json({ message: "Informe a pergunta, ao menos 2 alternativas e marque 1 certa." });
    }

    const [r] = await db.query(
        "INSERT INTO quiz_perguntas (arte_id, enunciado, explicacao) VALUES (?, ?, ?)",
        [arte_id, enunciado, explicacao || ""]
    );

    for (const alt of alternativas) {
        await db.query(
            "INSERT INTO quiz_alternativas (pergunta_id, texto, correta) VALUES (?, ?, ?)",
            [r.insertId, alt.texto, alt.correta]
        );
    }

    res.status(201).json({ message: "Pergunta criada." });
});

router.delete("/admin/quiz/:id", soAdmin, async (req, res) => {
    await db.query("DELETE FROM quiz_perguntas WHERE id = ?", [req.params.id]);
    res.json({ message: "Pergunta excluída." });
});

router.get("/desempenho", async (req, res) => {
    const [linhas] = await db.query("SELECT disciplina, media_antes, media_depois FROM desempenho_escolar ORDER BY id");

    const dados = linhas.map((l) => ({
        disciplina: l.disciplina,
        antes: Number(l.media_antes),
        depois: Number(l.media_depois)
    }));

    const somaAntes = dados.reduce((soma, d) => soma + d.antes, 0);
    const somaDepois = dados.reduce((soma, d) => soma + d.depois, 0);

    res.json({ dados: dados, melhoria: Math.round((somaDepois / somaAntes - 1) * 100) });
});

export default router;
