// Página inicial: ao clicar em um card de benefício, abre uma janela com mais informações e a fonte.

// ---------- Fontes (referências) ----------
const REF = {
  trusz: {
    cita: 'Trusz (2023)',
    texto:
      'TRUSZ, Rodrigo Augusto. A utilização do judô como ferramenta para o aprendizado de habilidades sociais na escola: uma experiência com a pesquisa-ação. Tese (Doutorado), Programa de Pós-Graduação em Ciências do Movimento Humano, Escola de Educação Física, Porto Alegre, 2023.',
    url: 'https://lume.ufrgs.br/handle/10183/253301',
  },
  silva: {
    cita: 'Silva (2020)',
    texto:
      'SILVA, Harrison Vinícius Amaral da. Efeito de um programa de intervenção estruturado com técnicas do jiu-jitsu brasileiro na atenção visual e no desempenho escolar em adolescentes: ensaio clínico randomizado. Dissertação (Mestrado em Educação Física), Universidade Federal de Pernambuco, Recife, 2020.',
    url: 'https://repositorio.ufpe.br/handle/123456789/38624',
  },
  ribeiro: {
    cita: 'Ribeiro (2025)',
    texto:
      'RIBEIRO, Aline Aparecida de Souza et al. O ensino dos esportes e das artes marciais na formação de crianças e adolescentes: uma revisão narrativa de literatura. Revista Delos, v. 18, n. 66, p. e4723, 2025.',
    url: 'https://ojs.revistadelos.com/ojs/index.php/delos/article/view/4723',
  },
  ijpe: {
    cita: 'IJPE (2020)',
    texto:
      'IJPE. Impactos das artes marciais na educação. International Journal of Physical Education, 2020.',
    url: 'https://app.periodikos.com.br/journal/ijpe/article/doi/10.51995/2675-0333.v4i1e2020034',
  },
};

// ---------- Benefícios (mesma ordem dos cards da página) ----------
const BEN = [
  {
    icone: 'brain',
    titulo: 'Melhora da Concentração',
    detalhe:
      'Cada treino exige atenção plena em cada movimento e decisões rápidas. Com a repetição, o aluno exercita a capacidade de se manter concentrado, e isso o acompanha na vida cotidiana.',
    pontos: [
      'Os treinos estimulam funções cognitivas importantes e a capacidade de pensar com clareza mesmo sob pressão (Trusz, 2023).',
      'Um ensaio clínico com adolescentes avaliou o efeito de um programa estruturado com técnicas de jiu-jitsu brasileiro na atenção visual e no desempenho escolar (Silva, 2020).',
    ],
    fontes: ['trusz', 'silva'],
  },
  {
    icone: 'shield',
    titulo: 'Desenvolvimento da Disciplina',
    detalhe:
      'Nos treinos, disciplina, respeito e autocontrole não são apenas cobrados: são vivenciados. Isso faz muita diferença para crianças e adolescentes, que estão num momento de se descobrir e se construir.',
    pontos: [
      'Valores como respeito, disciplina e autocontrole são vividos na prática do treino (Ribeiro, 2025).',
      'A disciplina construída nos treinos acompanha o praticante no dia a dia (Silva, 2020).',
    ],
    fontes: ['ribeiro', 'silva'],
  },
  {
    icone: 'heart',
    titulo: 'Controle Emocional',
    detalhe:
      'Ao exigir atenção plena e respeito às regras e aos colegas, a prática cria um ambiente de aprendizado seguro e desafiador. É nele que o aluno aprende a enfrentar suas próprias limitações, ansiedades e frustrações.',
    pontos: [
      'A resiliência diante das dificuldades e a habilidade de lidar com a frustração sem se abalar acompanham o praticante na vida cotidiana (Silva, 2020).',
      'O autocontrole faz parte dos valores desenvolvidos pelas artes marciais em crianças e adolescentes (Ribeiro, 2025).',
    ],
    fontes: ['silva', 'ribeiro'],
  },
  {
    icone: 'trend',
    titulo: 'Redução da Ansiedade',
    detalhe:
      'Pesquisas indicam que praticar artes marciais com regularidade ajuda a reduzir o estresse e a ansiedade, ao mesmo tempo em que fortalece a confiança em si mesmo.',
    pontos: [
      'A prática regular está associada à redução do estresse e da ansiedade (Silva, 2020; Trusz, 2023).',
    ],
    fontes: ['silva', 'trusz'],
  },
  {
    icone: 'star',
    titulo: 'Aumento da Autoestima',
    detalhe:
      'Há sempre um próximo passo: uma nova técnica a aprender, uma faixa a conquistar. Essa progressão contínua cria um senso de propósito e mostra ao aluno que ele evolui.',
    pontos: [
      'A prática regular fortalece a autoestima e a confiança em si mesmo (Silva, 2020; Trusz, 2023).',
      'A progressão contínua mantém as pessoas engajadas e cria senso de propósito (IJPE, 2020).',
    ],
    fontes: ['silva', 'trusz', 'ijpe'],
  },
  {
    icone: 'trophy',
    titulo: 'Melhor Desempenho Escolar',
    detalhe:
      'Ao melhorar foco, disciplina e controle emocional, espera-se que os efeitos apareçam também no comportamento e no desempenho dos alunos na escola.',
    pontos: [
      'Um ensaio clínico com adolescentes avaliou o efeito de um programa estruturado de jiu-jitsu brasileiro na atenção visual e no desempenho escolar (Silva, 2020).',
      'Nesta plataforma, o gráfico de desempenho usa dados simulados para ilustrar como os resultados serão acompanhados.',
    ],
    link: { texto: 'Ver o gráfico de desempenho', href: 'desempenho.html' },
    fontes: ['silva'],
  },
  {
    icone: 'users',
    titulo: 'Respeito e Convivência Social',
    detalhe:
      'Nos espaços de treino existe um clima de respeito e cooperação que favorece amizades genuínas e um sentimento real de pertencer a algo.',
    pontos: [
      'Quando as lutas são ensinadas com sua história e cultura, a ideia de que luta é sinônimo de violência vai sendo desconstruída, e surgem respeito, controle emocional e convivência saudável (Ribeiro, 2025).',
      'Uma pesquisa-ação com judô na escola investigou o aprendizado de habilidades sociais (Trusz, 2023).',
    ],
    fontes: ['ribeiro', 'trusz'],
  },
  {
    icone: 'target',
    titulo: 'Persistência nos Estudos',
    detalhe:
      'No tatame, o aluno aprende a não desistir diante de uma técnica difícil. Essa mentalidade de insistir e superar a frustração pode ser levada para os estudos.',
    pontos: [
      'A resiliência diante das dificuldades e a disciplina construída nos treinos acompanham o praticante no dia a dia (Silva, 2020).',
      'A progressão contínua de técnicas e faixas mantém o engajamento ao longo do tempo (IJPE, 2020).',
    ],
    fontes: ['silva', 'ijpe'],
  },
];


// ---------- Janela (dialog) ----------
const janela = document.getElementById("ben-dialog");

function abrirBeneficio(i) {
    const b = BEN[i];
    const card = document.querySelector('.card-btn[data-b="' + i + '"]');

    document.getElementById("ben-ic").innerHTML = icone(b.icone);
    document.getElementById("ben-titulo").textContent = b.titulo;
    document.getElementById("ben-resumo").textContent = card.querySelector("p").textContent;
    document.getElementById("ben-detalhe").textContent = b.detalhe;

    // lista de pontos
    let pontos = "";
    for (const texto of b.pontos) {
        pontos += "<li>" + texto + "</li>";
    }
    document.getElementById("ben-pontos").innerHTML = pontos;

    // link opcional (só alguns benefícios têm)
    const link = document.getElementById("ben-link");
    link.hidden = !b.link;
    link.innerHTML = b.link ? '<a href="pages/' + b.link.href + '">' + b.link.texto + " →</a>" : "";

    // fontes
    let fontes = "";
    for (const chave of b.fontes) {
        const r = REF[chave];
        fontes += "<li><b>" + r.cita + "</b><span>" + r.texto + '</span><a href="' + r.url + '" target="_blank" rel="noopener noreferrer">' + r.url + "</a></li>";
    }
    document.getElementById("ben-fontes").innerHTML = fontes;

    janela.showModal();
    janela.scrollTop = 0;
}

// clique nos cards
document.querySelectorAll(".card-btn").forEach(function (card) {
    card.addEventListener("click", function () {
        abrirBeneficio(Number(card.dataset.b));
    });
});

// botões "Fechar"
janela.querySelectorAll("[data-fechar]").forEach(function (botao) {
    botao.addEventListener("click", function () {
        janela.close();
    });
});

// clicar fora da janela também fecha
janela.addEventListener("click", function (e) {
    if (e.target === janela) janela.close();
});
