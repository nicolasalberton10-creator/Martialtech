// Código usado por TODAS as páginas: endereço da API, ícones, menu e nome do usuário.

// endereço do backend (o Node precisa estar rodando)
const API = "http://localhost:3000";

// ---------- Ícones ----------
// Cada ícone é uma imagem da pasta image/ (ex.: image/award.svg).
// O CSS pinta a imagem com a cor do texto (veja a classe .ic em css/base.css).
const PASTA_IMAGENS = location.pathname.includes("/pages/") ? "../image/" : "image/";

// devolve o ícone pronto para colocar no HTML
function icone(nome) {
    const img = "url(" + PASTA_IMAGENS + nome + ".svg)";
    return '<span class="ic" style="-webkit-mask-image: ' + img + '; mask-image: ' + img + '"></span>';
}

// ---------- Quando a página carrega ----------
document.addEventListener("DOMContentLoaded", function () {

    // coloca o ícone em todo elemento que tem data-icon="nome"
    document.querySelectorAll("[data-icon]").forEach(function (el) {
        el.insertAdjacentHTML("afterbegin", icone(el.getAttribute("data-icon")));
    });

    // botão do menu no celular
    const botaoMenu = document.querySelector(".menu-btn");
    const menu = document.querySelector(".nav");

    botaoMenu.innerHTML = icone("menu");
    botaoMenu.addEventListener("click", function () {
        const aberto = menu.classList.toggle("open");
        botaoMenu.setAttribute("aria-expanded", aberto);
        botaoMenu.innerHTML = icone(aberto ? "close" : "menu");
    });

    // se o usuário está logado, mostra o nome dele no lugar de "Entrar"
    const nome = localStorage.getItem("usuario");
    const botaoEntrar = document.querySelector("[data-auth]");
    const botaoSair = document.querySelector("[data-logout]");

    if (nome && botaoEntrar && botaoSair) {
        botaoEntrar.textContent = "Olá, " + nome.split(" ")[0];
        botaoEntrar.href = (location.pathname.includes("/pages/") ? "" : "pages/") + "aulas.html";
        botaoSair.hidden = false;
    }

    // o link "Admin" só aparece para o administrador
    const linkAdmin = document.querySelector("[data-admin]");
    if (linkAdmin && localStorage.getItem("tipo") === "Administrador") {
        linkAdmin.hidden = false;
    }

    // botão Sair: apaga os dados do usuário e volta para o início
    if (botaoSair) {
        botaoSair.addEventListener("click", function (e) {
            e.preventDefault();
            localStorage.removeItem("usuario");
            localStorage.removeItem("id");
            localStorage.removeItem("tipo");
            window.location.href = location.pathname.includes("/pages/") ? "../index.html" : "index.html";
        });
    }
});
