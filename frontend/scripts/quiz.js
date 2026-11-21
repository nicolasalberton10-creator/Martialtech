// Página do quiz: escolhe a arte marcial, mostra as perguntas e dá XP por acerto.
const idUsuario = localStorage.getItem("id");

// se não estiver logado, vai para o login
if (!idUsuario) {
    alert("Faça login para jogar o quiz.");
    window.location.href = "login.html";
}

const LETRAS = ["A", "B", "C", "D", "E"];

const telaMenu = document.getElementById("menu");     // escolha da arte marcial
const telaJogo = document.getElementById("play");     // pergunta atual
const telaFim = document.getElementById("fim");       // resultado

let quiz = null;        // arte marcial e perguntas
let atual = 0;          // número da pergunta atual
let acertos = 0;
let xpDaRodada = 0;
let respondeu = false;

// mostra só uma das três telas
function mostrarTela(nome) {
    telaMenu.hidden = nome !== "menu";
    telaJogo.hidden = nome !== "play";
    telaFim.hidden = nome !== "fim";
}

// atualiza a barra de XP
function mostrarXp(xp) {
    document.getElementById("nivel").textContent = xp.faixa;
    document.getElementById("xp-txt").textContent = xp.total + " XP";
    document.getElementById("xp-fill").style.width = xp.pct + "%";
}

// ---------- Tela 1: escolher a arte marcial ----------
async function carregarMenu() {
    mostrarTela("menu");

    try {
        const response = await fetch(API + "/quiz?usuario=" + idUsuario);
        const artes = await response.json();

        let html = "";
        for (const arte of artes) {
            const pct = Math.round((arte.acertos / arte.total) * 100);
            html += `
                <article class="art">
                    <div class="thumb ${arte.slug}">${arte.nome}</div>
                    <div class="art-body">
                        <p>${arte.descricao}</p>
                        <div>
                            <div class="bar"><i style="width:${pct}%"></i></div>
                            <div class="art-stat">
                                <span>${arte.acertos} de ${arte.total} acertos conquistados</span>
                                <span>${arte.acertos * 10} XP</span>
                            </div>
                        </div>
                        <button class="btn" data-k="${arte.slug}">${arte.acertos > 0 ? "Jogar de novo" : "Começar quiz"}</button>
                    </div>
                </article>`;
        }
        telaMenu.innerHTML = html;

        const r = await fetch(API + "/xp/" + idUsuario);
        mostrarXp(await r.json());
    } catch (erro) {
        alert("Erro de conexão com a API");
    }
}

// ---------- Tela 2: perguntas ----------
async function iniciarQuiz(slug) {
    try {
        const response = await fetch(API + "/quiz/" + slug);
        quiz = await response.json();
    } catch (erro) {
        alert("Erro de conexão com a API");
        return;
    }

    atual = 0;
    acertos = 0;
    xpDaRodada = 0;
    mostrarTela("play");
    mostrarPergunta();
}

function mostrarPergunta() {
    const pergunta = quiz.perguntas[atual];
    const total = quiz.perguntas.length;

    respondeu = false;

    document.getElementById("contagem").textContent = quiz.arte.nome + " · Pergunta " + (atual + 1) + " de " + total;
    document.getElementById("prog").firstElementChild.style.width = (atual / total) * 100 + "%";
    document.getElementById("pergunta").textContent = pergunta.enunciado;

    let html = "";
    pergunta.alternativas.forEach(function (alt, i) {
        html += `<button class="opt" data-id="${alt.id}"><span class="k">${LETRAS[i]}</span><span>${alt.texto}</span></button>`;
    });
    document.getElementById("opcoes").innerHTML = html;

    document.getElementById("feedback").hidden = true;
    document.getElementById("proxima").hidden = true;
}

// clique em uma alternativa
async function responder(botao) {
    if (respondeu) return;
    respondeu = true;

    const botoes = document.querySelectorAll("#opcoes .opt");
    botoes.forEach(function (b) { b.disabled = true; });

    try {
        const response = await fetch(API + "/responder", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ usuario: idUsuario, alternativa: botao.dataset.id })
        });
        const data = await response.json();

        // pinta de verde a certa e de vermelho a errada
        botoes.forEach(function (b) {
            if (Number(b.dataset.id) === data.corretaId) b.classList.add("right");
            else if (b === botao) b.classList.add("wrong");
        });

        if (data.correta) {
            acertos++;
            xpDaRodada += data.xpGanho;
        }

        let textoXp = "";
        if (data.xpGanho > 0) textoXp = `<span class="xpgain">${icone("zap")}+${data.xpGanho} XP</span>`;
        else if (data.jaGanho) textoXp = `<span class="xpgain">Você já ganhou o XP desta pergunta antes.</span>`;

        const feedback = document.getElementById("feedback");
        feedback.className = "feedback " + (data.correta ? "ok" : "no");
        feedback.innerHTML = `<b>${data.correta ? "Resposta certa!" : "Não foi dessa vez."}</b>${textoXp}<p>${data.explicacao}</p>`;
        feedback.hidden = false;

        mostrarXp(data.xp);

        const proxima = document.getElementById("proxima");
        proxima.textContent = atual + 1 < quiz.perguntas.length ? "Próxima pergunta" : "Ver resultado";
        proxima.hidden = false;
    } catch (erro) {
        respondeu = false;
        botoes.forEach(function (b) { b.disabled = false; });
        alert("Erro de conexão com a API");
    }
}

// ---------- Tela 3: resultado ----------
function mostrarResultado() {
    const total = quiz.perguntas.length;

    mostrarTela("fim");
    document.getElementById("fim-titulo").textContent = acertos + " de " + total + " acertos em " + quiz.arte.nome;

    let texto = xpDaRodada > 0
        ? "Você ganhou " + xpDaRodada + " XP nesta rodada."
        : "Nenhum XP novo desta vez. O XP de cada pergunta é dado só na primeira vez que você acerta.";
    texto += acertos === total ? " Gabarito completo, parabéns!" : " Refaça o quiz para acertar as que faltam.";

    document.getElementById("fim-txt").textContent = texto;
}

// ---------- Cliques ----------
telaMenu.addEventListener("click", function (e) {
    const botao = e.target.closest("button[data-k]");
    if (botao) iniciarQuiz(botao.dataset.k);
});

document.getElementById("opcoes").addEventListener("click", function (e) {
    const botao = e.target.closest(".opt");
    if (botao) responder(botao);
});

document.getElementById("proxima").addEventListener("click", function () {
    if (atual + 1 < quiz.perguntas.length) {
        atual++;
        mostrarPergunta();
    } else {
        mostrarResultado();
    }
});

document.getElementById("voltar").addEventListener("click", carregarMenu);
document.getElementById("outra").addEventListener("click", carregarMenu);
document.getElementById("repetir").addEventListener("click", function () {
    iniciarQuiz(quiz.arte.slug);
});

if (idUsuario) carregarMenu();
