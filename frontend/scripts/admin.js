// Painel do administrador: cadastrar, editar e excluir aulas e perguntas do quiz.
const idUsuario = localStorage.getItem("id");

// só o administrador entra nesta página
if (localStorage.getItem("tipo") !== "Administrador") {
    alert("Área exclusiva do administrador.");
    window.location.href = "login.html";
}

let artes = [];            // artes marciais (judô, jiu-jitsu, muay thai)
let aulaEditando = null;   // id da aula que está sendo editada (null = nova aula)

// pequena função para chamar o backend e já tratar o erro
async function chamar(rota, metodo, corpo) {
    const separador = rota.includes("?") ? "&" : "?";
    const response = await fetch(API + rota + separador + "usuario=" + idUsuario, {
        method: metodo || "GET",
        headers: { "content-type": "application/json" },
        body: corpo ? JSON.stringify({ ...corpo, usuario: idUsuario }) : undefined
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erro.");
    }
    return data;
}

// ---------- Abas ----------
function mostrarAba(nome) {
    document.getElementById("painel-aulas").hidden = nome !== "aulas";
    document.getElementById("painel-quiz").hidden = nome !== "quiz";
    document.getElementById("aba-aulas").setAttribute("aria-pressed", nome === "aulas");
    document.getElementById("aba-quiz").setAttribute("aria-pressed", nome === "quiz");
}

document.getElementById("aba-aulas").addEventListener("click", function () { mostrarAba("aulas"); });
document.getElementById("aba-quiz").addEventListener("click", function () {
    mostrarAba("quiz");
    carregarPerguntas();
});

// ======================================================
// AULAS
// ======================================================
async function carregarAulas() {
    const response = await fetch(API + "/aulas");
    const aulas = await response.json();

    let html = "";
    for (const a of aulas) {
        html += `
            <div class="item">
                <div>
                    <b>${a.titulo}</b>
                    <small>${a.arte_nome} · ${a.professor} · ${a.duracao_min} min · ${a.nivel}</small>
                </div>
                <div class="botoes">
                    <button class="btn outline pequeno" data-editar="${a.id}">Editar</button>
                    <button class="btn perigo pequeno" data-excluir="${a.id}">Excluir</button>
                </div>
            </div>`;
    }
    document.getElementById("lista-aulas").innerHTML = html || "<p>Nenhuma aula cadastrada.</p>";

    // guarda as aulas para poder preencher o formulário ao editar
    document.getElementById("lista-aulas").aulas = aulas;
}

function limparFormAula() {
    aulaEditando = null;
    document.getElementById("form-aula").reset();
    document.getElementById("titulo-form-aula").textContent = "Nova aula";
    document.getElementById("cancelar-aula").hidden = true;
}

document.getElementById("form-aula").addEventListener("submit", async function (e) {
    e.preventDefault();

    const dados = {
        arte_id: document.getElementById("aula-arte").value,
        titulo: document.getElementById("aula-titulo").value,
        professor: document.getElementById("aula-professor").value,
        duracao_min: document.getElementById("aula-duracao").value,
        nivel: document.getElementById("aula-nivel").value
    };

    try {
        if (aulaEditando) {
            await chamar("/admin/aulas/" + aulaEditando, "PUT", dados);
        } else {
            await chamar("/admin/aulas", "POST", dados);
        }
        limparFormAula();
        carregarAulas();
    } catch (erro) {
        alert(erro.message);
    }
});

document.getElementById("cancelar-aula").addEventListener("click", limparFormAula);

document.getElementById("lista-aulas").addEventListener("click", async function (e) {
    const botaoEditar = e.target.closest("[data-editar]");
    const botaoExcluir = e.target.closest("[data-excluir]");

    // Editar: coloca os dados da aula no formulário
    if (botaoEditar) {
        const aula = this.aulas.find((a) => String(a.id) === botaoEditar.dataset.editar);
        const arte = artes.find((x) => x.slug === aula.arte);

        aulaEditando = aula.id;
        document.getElementById("aula-arte").value = arte.id;
        document.getElementById("aula-titulo").value = aula.titulo;
        document.getElementById("aula-professor").value = aula.professor;
        document.getElementById("aula-duracao").value = aula.duracao_min;
        document.getElementById("aula-nivel").value = aula.nivel;
        document.getElementById("titulo-form-aula").textContent = "Editar aula";
        document.getElementById("cancelar-aula").hidden = false;
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Excluir
    if (botaoExcluir && confirm("Excluir esta aula?")) {
        try {
            await chamar("/admin/aulas/" + botaoExcluir.dataset.excluir, "DELETE");
            carregarAulas();
        } catch (erro) {
            alert(erro.message);
        }
    }
});

// ======================================================
// QUIZ
// ======================================================

// cria os 4 campos de alternativa (cada um com uma bolinha para marcar a certa)
function criarCamposAlternativas() {
    let html = "";
    for (let i = 0; i < 4; i++) {
        html += `
            <div class="alt-linha">
                <input type="radio" name="certa" value="${i}" ${i === 0 ? "checked" : ""}>
                <input class="alt-texto" placeholder="Alternativa ${i + 1}" ${i < 2 ? "required" : ""}>
            </div>`;
    }
    document.getElementById("quiz-alts").innerHTML = html;
}

async function carregarPerguntas() {
    const arte = artes.find((x) => String(x.id) === document.getElementById("quiz-arte").value);
    document.getElementById("quiz-titulo-lista").textContent = "Perguntas de " + arte.nome;

    const perguntas = await chamar("/admin/quiz/" + arte.slug);

    let html = "";
    for (const p of perguntas) {
        let alternativas = "";
        for (const a of p.alternativas) {
            alternativas += `<li class="${a.correta ? "certa" : ""}">${a.texto}${a.correta ? " ✔" : ""}</li>`;
        }
        html += `
            <div class="item">
                <div>
                    <b>${p.enunciado}</b>
                    <ul>${alternativas}</ul>
                </div>
                <div class="botoes">
                    <button class="btn perigo pequeno" data-excluir="${p.id}">Excluir</button>
                </div>
            </div>`;
    }
    document.getElementById("lista-perguntas").innerHTML = html || "<p>Nenhuma pergunta nesta arte marcial.</p>";
}

document.getElementById("quiz-arte").addEventListener("change", carregarPerguntas);

document.getElementById("form-pergunta").addEventListener("submit", async function (e) {
    e.preventDefault();

    // monta a lista de alternativas (ignora as que ficaram em branco)
    const textos = document.querySelectorAll(".alt-texto");
    const certa = Number(document.querySelector('input[name="certa"]:checked').value);
    const alternativas = [];

    textos.forEach(function (campo, i) {
        if (campo.value.trim() !== "") {
            alternativas.push({ texto: campo.value, correta: i === certa });
        }
    });

    try {
        await chamar("/admin/quiz", "POST", {
            arte_id: document.getElementById("quiz-arte").value,
            enunciado: document.getElementById("quiz-enunciado").value,
            explicacao: document.getElementById("quiz-explicacao").value,
            alternativas: alternativas
        });
        document.getElementById("quiz-enunciado").value = "";
        document.getElementById("quiz-explicacao").value = "";
        criarCamposAlternativas();
        carregarPerguntas();
    } catch (erro) {
        alert(erro.message);
    }
});

document.getElementById("lista-perguntas").addEventListener("click", async function (e) {
    const botao = e.target.closest("[data-excluir]");

    if (botao && confirm("Excluir esta pergunta?")) {
        try {
            await chamar("/admin/quiz/" + botao.dataset.excluir, "DELETE");
            carregarPerguntas();
        } catch (erro) {
            alert(erro.message);
        }
    }
});

// ======================================================
// Início
// ======================================================
async function iniciar() {
    try {
        const response = await fetch(API + "/artes");
        artes = await response.json();

        // preenche os campos de escolha da arte marcial
        let opcoes = "";
        for (const a of artes) {
            opcoes += `<option value="${a.id}">${a.nome}</option>`;
        }
        document.getElementById("aula-arte").innerHTML = opcoes;
        document.getElementById("quiz-arte").innerHTML = opcoes;

        criarCamposAlternativas();
        carregarAulas();
    } catch (erro) {
        alert("Erro de conexão com a API");
    }
}

if (localStorage.getItem("tipo") === "Administrador") iniciar();
