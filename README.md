# MartialTech

**Plataforma de apoio a projetos de artes marciais nas escolas.**

O MartialTech é um site que reúne aulas, quiz, benefícios comprovados e acompanhamento de desempenho para ajudar escolas e educadores a implementarem projetos de artes marciais (Judô, Jiu-jitsu e Muay Thai) com alunos da Educação Básica.

Projeto desenvolvido como PFI no **Instituto Federal do Paraná (IFPR) – Campus Quedas do Iguaçu**.

> **Status:** protótipo. Os dados de desempenho acadêmico exibidos no gráfico são **simulados** e não representam resultados reais de alunos.

---

## Funcionalidades

- **Início** com os benefícios das artes marciais e as fontes de cada um.
- **Cadastro e login** com senha protegida por hash (bcrypt) e mínimo de 8 caracteres.
- **Aulas** por modalidade, com filtro (Todas, Judô, Jiu-jitsu, Muay Thai) e progresso por aula.
- **Quiz** por modalidade, com correção imediata e explicação da resposta.
- **Gamificação**: XP e sistema de faixas.
- **Desempenho acadêmico**: gráfico comparativo de médias antes e depois (dados simulados).
- **Painel do administrador**: cadastrar, editar e excluir aulas e perguntas do quiz.

### Regras de XP e faixas

| Ação | XP |
|---|---|
| Avançar 10% de uma aula | 5 XP |
| Acertar uma pergunta do quiz pela primeira vez | 10 XP |
| Repetir uma pergunta já acertada | 0 XP |

A cada **100 XP** o aluno sobe de faixa (7 faixas no total).

---

## Tecnologias


|    Camada      |                               Tecnologias                             |
|----------------|-----------------------------------------------------------------------|
| Frontend       | HTML, CSS e JavaScript puro (uma página, um CSS e um script por tela) |
| Backend        | Node.js, Express 5, CORS, bcryptjs                                    |
| Banco de dados | MySQL (driver `mysql2`)                                               |
| Apoio          | Visual Studio Code, Live Server e MySQL Workbench                     |

---              

## Estrutura do projeto

```
martialtech/
├── backend/
│   ├── server.js              # liga o servidor na porta 3000
│   ├── router/rotas.js        # todas as rotas da API
│   ├── db/
│   │   ├── database.js        # conexão com o MySQL
│   │   ├── banco_martialtech.sql  # cria o banco, as tabelas e os dados iniciais
│   │   └── admin.sql          # cria o usuário administrador
│   └── package.json
├── frontend/
│   ├── index.html             # página inicial
│   ├── pages/                 # login, cadastro, aulas, quiz, desempenho, admin
│   ├── css/                   # base.css + um CSS por página
│   ├── scripts/               # comum.js + um script por página
│   └── image/                 # ícones em SVG
└── .vscode/settings.json      # porta 5501 do Live Server
```

---

## Como baixar o projeto

**Opção A: baixar o ZIP (mais simples)**

1. Abra https://github.com/nicolasalberton10-creator/Martialtech
2. Clique no botão verde **Code** e depois em **Download ZIP**.
3. Extraia o arquivo em uma pasta do seu computador.

**Opção B: clonar com o Git**

```bash
git clone https://github.com/nicolasalberton10-creator/Martialtech.git
cd Martialtech
```

---

## Como executar

### Pré-requisitos

Instale antes de começar:

- [Node.js](https://nodejs.org/) 18 ou superior (confira com `node -v`)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) e, se quiser, o [MySQL Workbench](https://dev.mysql.com/downloads/workbench/)
- [Visual Studio Code](https://code.visualstudio.com/) com a extensão **Live Server**

### 1. Criar o banco de dados

No MySQL Workbench (ou pelo terminal), execute os scripts na ordem:

1. `backend/db/banco_martialtech.sql` (cria o banco `martialtech`, as tabelas e os dados iniciais)
2. `backend/db/admin.sql` (cria o usuário administrador)

Pelo terminal:

```bash
mysql -u root -p --default-character-set=utf8mb4 < backend/db/banco_martialtech.sql
mysql -u root -p --default-character-set=utf8mb4 < backend/db/admin.sql
```

### 2. Configurar a conexão

Abra `backend/db/database.js` e coloque a **sua** senha do MySQL no campo `password`:

```js
const db = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "SUA_SENHA_AQUI",
    database: "martialtech"
});
```

> Não envie a sua senha real para o GitHub.

### 3. Iniciar o backend

```bash
cd backend
npm install
npm start
```

Se tudo estiver certo, aparece `Servidor rodando na porta 3000`.

### 4. Abrir o frontend

Abra a pasta do projeto no VS Code, clique com o botão direito em `frontend/index.html` e escolha **Open with Live Server**. O site abre em `http://127.0.0.1:5501`.

O frontend chama a API em `http://localhost:3000` (constante `API` em `frontend/scripts/comum.js`).

---

## Como testar o site

Com o backend rodando (`npm start`) e o frontend aberto no Live Server, siga o roteiro abaixo.

### Roteiro de teste do aluno

| ## | O que fazer | Resultado esperado |
|---|---|---|
| 01 | Abrir a página inicial e clicar nos cards de benefícios | Abre um pop-up com a explicação e a fonte |
| 02 | Em **Criar conta**, usar uma senha com menos de 8 caracteres | O site recusa e avisa |
| 03 | Criar uma conta com dados válidos | Conta criada; o site leva ao login |
| 04 | Fazer login com a conta criada | Entra e o menu mostra **Sair** |
| 05 | Tentar entrar com a senha errada | Mostra erro e não entra |
| 06 | Em **Aulas**, clicar nos filtros Judô, Jiu-jitsu e Muay Thai | Só aparecem as aulas da modalidade |
| 07 | Avançar o progresso de uma aula | O percentual sobe e o XP aumenta (5 XP a cada 10%) |
| 08 | Em **Quiz**, escolher uma modalidade e acertar uma pergunta | A resposta fica verde e ganha 10 XP |
| 09 | Refazer o quiz e acertar a mesma pergunta | Não ganha XP de novo |
| 10 | Chegar a 100 XP | Sobe de faixa |
| 11 | Abrir **Desempenho** | Mostra o gráfico (dados simulados) |

### Roteiro de teste do administrador

| # | O que fazer | Resultado esperado |
|---|---|---|
| 1 | Entrar com o e-mail e a senha do administrador (veja o topo de `backend/db/admin.sql`) | Aparece o link **Admin** no menu |
| 2 | Cadastrar uma aula | A aula aparece na lista e na página de Aulas |
| 3 | Editar e depois excluir essa aula | A alteração aparece e depois a aula some |
| 4 | Cadastrar uma pergunta de quiz e depois excluir | A pergunta aparece no quiz e depois some |
| 5 | Entrar com a conta de aluno e abrir `frontend/pages/admin.html` | O link Admin não aparece e a página avisa "Área exclusiva do administrador" |

### Testar a API sem o site (opcional)

```bash
curl http://localhost:3000/artes
curl http://localhost:3000/aulas
```

Se a API estiver funcionando, os dois comandos devolvem uma lista em JSON.

---

## Problemas comuns

| Mensagem ou sintoma | Causa e solução |
|---|---|
| `npm start` mostra `ENOENT ... package.json` | Você rodou na pasta errada. Entre em `backend` (`cd backend`) e rode de novo. |
| `Access denied for user 'root'@'localhost'` | A senha em `backend/db/database.js` não é a do seu MySQL. Corrija e reinicie o servidor. |
| `Unknown database 'martialtech'` | O script `banco_martialtech.sql` ainda não foi executado. |
| O site abre, mas não carrega aulas nem faz login | O backend não está rodando, ou a porta 3000 está ocupada. Confira o terminal. |
| Textos com acentos quebrados no banco | Execute os scripts com `--default-character-set=utf8mb4`. |
| Alterei o código e nada mudou | Reinicie o backend e atualize a página com Ctrl+F5. |

---

## Acesso de administrador

O administrador é criado pelo script `backend/db/admin.sql`, que mostra o e-mail e a senha iniciais no topo do arquivo. Pelo painel (`frontend/pages/admin.html`) ele gerencia aulas e perguntas do quiz.

> **Importante:** altere a senha do administrador antes de usar o sistema fora de testes.

---

## API (rotas do backend)

Base: `http://localhost:3000`

### Públicas

| Método |           Rota         |                      O que faz                     |
|--------|------------------------|----------------------------------------------------|
| POST   | `/cadastro`            | Cria um usuário (senha com hash bcrypt)            |
| POST   | `/login`               | Confere e-mail e senha                             |
| GET    | `/xp/:usuario`         | XP e faixa do usuário                              |
| GET    | `/artes`               | Lista as modalidades                               |
| GET    | `/aulas`               | Lista as aulas, com o progresso do usuário         |
| POST   | `/aulas/:id/progresso` | Registra o progresso da aula e concede XP          |
| GET    | `/quiz`                | Lista os quizzes por modalidade                    |
| GET    | `/quiz/:slug`          | Perguntas de uma modalidade (`judo`, `jj`, `mt`)   |
| POST   | `/responder`           | Confere a resposta e concede XP no primeiro acerto |
| GET    | `/desempenho`          | Dados (simulados) do gráfico de desempenho         |

### Administrador

| Método |         Rota        |               O que faz              |
|--------|---------------------|--------------------------------------|
| POST   | `/admin/aulas`      | Cadastra uma aula                    |
| PUT    | `/admin/aulas/:id`  | Edita uma aula                       |
| DELETE | `/admin/aulas/:id`  | Exclui uma aula                      |
| GET    | `/admin/quiz/:slug` | Lista as perguntas de uma modalidade |
| POST   | `/admin/quiz`       | Cadastra uma pergunta                |
| DELETE | `/admin/quiz/:id`   | Exclui uma pergunta                  |

---

## Banco de dados

10 tabelas:

|        Tabela        |                  Função                       |
|----------------------|-----------------------------------------------|
| `usuarios`           | Contas (nome, e-mail, hash da senha, tipo)    |
| `artes_marciais`     | Modalidades                                   |
| `aulas`              | Videoaulas de cada modalidade                 |
| `progresso_aulas`    | Percentual concluído de cada aula por usuário |
| `quiz_perguntas`     | Perguntas de cada modalidade                  |
| `quiz_alternativas`  | Alternativas de cada pergunta                 |
| `quiz_respostas`     | Histórico de respostas                        |
| `quiz_acertos`       | Primeiro acerto de cada pergunta (base do XP) |
| `beneficios`         | Benefícios das artes marciais, com a fonte    |
| `desempenho_escolar` | Médias simuladas antes e depois               |

---

## Limitações conhecidas

- Os dados de desempenho acadêmico são simulados.
- A plataforma ainda não foi testada com turmas reais.
- Não há autenticação por token (JWT): o backend identifica o usuário pelo id enviado pelo navegador e verifica o tipo `Administrador` no banco. Para uso real, é necessário adicionar autenticação por token.

## Próximos passos

- Validar o site em uma escola parceira e substituir os dados simulados por medições reais.
- Ampliar o painel administrativo.
- Incluir novas modalidades e conteúdos.
- Adotar autenticação por token.

---

## Autores

- Nicolas Alberton da Silva
- Deivid Sullivan Pastorio
- Marcelo de Andrade Duarte

Instituto Federal do Paraná (IFPR) – Campus Quedas do Iguaçu
