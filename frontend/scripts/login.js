// Página de login: envia e-mail e senha para o backend.
const form = document.getElementById("form-login");

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    try {
        const response = await fetch(API + "/login", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (response.ok) {
            // guarda quem entrou para usar nas outras páginas
            localStorage.setItem("usuario", data.username);
            localStorage.setItem("id", data.id);
            localStorage.setItem("tipo", data.tipo);

            // o administrador vai para o painel; os alunos para as aulas
            window.location.href = data.tipo === "Administrador" ? "admin.html" : "aulas.html";
        } else {
            alert(data.message || "Erro ao entrar.");
        }
    } catch (erro) {
        alert("Erro de conexão com a API");
    }
});
