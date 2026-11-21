// Página de cadastro: cria a conta no backend.
const form = document.getElementById("form-cadastro");

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const senha2 = document.getElementById("senha2").value;

    if (senha.length < 8) {
        alert("A senha precisa ter no mínimo 8 caracteres.");
        return;
    }
    if (senha !== senha2) {
        alert("As senhas não conferem.");
        return;
    }

    try {
        const response = await fetch(API + "/cadastro", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ nome, email, senha })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("usuario", data.username);
            localStorage.setItem("id", data.id);
            localStorage.setItem("tipo", data.tipo);
            alert("Conta criada com sucesso!");
            window.location.href = "aulas.html";
        } else {
            alert(data.message || "Não foi possível criar a conta.");
        }
    } catch (erro) {
        alert("Erro de conexão com a API");
    }
});
