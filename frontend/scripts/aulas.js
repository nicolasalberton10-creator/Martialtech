// Página de aulas: mostra as aulas, o progresso e o XP.
const idUsuario = localStorage.getItem("id");   // vazio se não estiver logado
const caixa = document.getElementById("cards");

let aulas = [];          // lista de aulas vinda do banco
let filtro = "todas";    // filtro escolhido (todas, judo, jj, mt)

// atualiza a barra de XP
function mostrarXp(xp) {
    document.getElementById("nivel").textContent = xp.faixa;
    document.getElementById("xp-txt").textContent = xp.total + " XP (aulas + quiz)";
    document.getElementById("xp-fill").style.width = xp.pct + "%";
}

// desenha os cards das aulas na tela
function mostrarAulas() {
    let html = "";

    for (const a of aulas) {
        if (filtro !== "todas" && a.arte !== filtro) continue;

        const concluida = a.percentual >= 100;
        let textoBotao = "Começar aula";
        if (concluida) textoBotao = "Concluída";
        else if (a.percentual > 0) textoBotao = "Continuar aula";

        html += `
            <article class="aula">
                <div class="thumb ${a.arte}"><span>${a.arte_nome}</span>${icone("play")}</div>
                <div class="aula-body">
                    <h3>${a.titulo}</h3>
                    <div class="meta">
                        <span>${icone("users")}${a.professor}</span>
                        <span>${icone("clock")}${a.duracao_min} min</span>
                        <span class="lvl">${a.nivel}</span>
                    </div>
                    <div>
                        <div class="bar"><i style="width:${a.percentual}%"></i></div>
                        <div class="pct"><span>Progresso</span><span>${a.percentual}%</span></div>
                    </div>
                    <button class="btn ${concluida ? "done" : ""}" data-id="${a.id}" ${concluida ? "disabled" : ""}>${textoBotao}</button>
                </div>
            </article>`;
    }

    caixa.innerHTML = html;
}

// busca as aulas no backend
async function carregarAulas() {
    try {
        const response = await fetch(API + "/aulas?usuario=" + (idUsuario || 0));
        aulas = await response.json();
        mostrarAulas();

        if (idUsuario) {
            const r = await fetch(API + "/xp/" + idUsuario);
            mostrarXp(await r.json());
        } else {
            document.getElementById("xp-txt").textContent = "Entre para guardar seu XP";
        }
    } catch (erro) {
        alert("Erro de conexão com a API");
    }
}

// clique nos botões de filtro
document.querySelectorAll(".chip").forEach(function (botao) {
    botao.addEventListener("click", function () {
        document.querySelectorAll(".chip").forEach(function (b) {
            b.setAttribute("aria-pressed", "false");
        });
        botao.setAttribute("aria-pressed", "true");
        filtro = botao.dataset.f;
        mostrarAulas();
    });
});

// clique em "Começar aula": avança 20% e salva no banco
caixa.addEventListener("click", async function (e) {
    const botao = e.target.closest("button[data-id]");
    if (!botao) return;

    if (!idUsuario) {
        alert("Faça login para salvar seu progresso.");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(API + "/aulas/" + botao.dataset.id + "/progresso", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ usuario: idUsuario })
        });
        const data = await response.json();

        // atualiza a aula na lista e desenha de novo
        for (const a of aulas) {
            if (String(a.id) === botao.dataset.id) a.percentual = Number(data.percentual);
        }
        mostrarAulas();
        mostrarXp(data.xp);
    } catch (erro) {
        alert("Erro de conexão com a API");
    }
});

carregarAulas();
