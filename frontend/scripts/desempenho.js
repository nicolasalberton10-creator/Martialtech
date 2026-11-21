// Página de desempenho: busca as médias no banco e desenha o gráfico de barras.
const grafico = document.getElementById("chart");

function desenharGrafico(dados) {
    const largura = 560, altura = 300;
    const margemEsq = 36, margemBaixo = 44, margemTopo = 16, margemDir = 10;
    const alturaUtil = altura - margemBaixo - margemTopo;

    // converte uma nota (0 a 10) na posição vertical do gráfico
    function y(nota) {
        return margemTopo + alturaUtil - (nota / 10) * alturaUtil;
    }

    let svg = "";

    // linhas horizontais com as notas 0, 2, 4, 6, 8, 10
    for (let nota = 0; nota <= 10; nota += 2) {
        svg += `<line x1="${margemEsq}" x2="${largura - margemDir}" y1="${y(nota)}" y2="${y(nota)}" stroke="var(--border)"/>`;
        svg += `<text x="${margemEsq - 8}" y="${y(nota) + 4}" font-size="12" text-anchor="end" fill="var(--muted)">${nota}</text>`;
    }

    // duas barras por disciplina: antes (cinza) e depois (vermelha)
    const larguraGrupo = (largura - margemEsq - margemDir) / dados.length;
    const larguraBarra = 26;

    dados.forEach(function (d, i) {
        const centro = margemEsq + larguraGrupo * i + larguraGrupo / 2;

        svg += `<rect x="${centro - larguraBarra - 2}" y="${y(d.antes)}" width="${larguraBarra}" height="${margemTopo + alturaUtil - y(d.antes)}" rx="3" fill="var(--muted)" opacity=".55"/>`;
        svg += `<rect x="${centro + 2}" y="${y(d.depois)}" width="${larguraBarra}" height="${margemTopo + alturaUtil - y(d.depois)}" rx="3" fill="var(--accent)"/>`;

        svg += `<text x="${centro - larguraBarra / 2 - 2}" y="${y(d.antes) - 5}" font-size="11" text-anchor="middle" fill="var(--muted)">${d.antes.toFixed(1)}</text>`;
        svg += `<text x="${centro + larguraBarra / 2 + 2}" y="${y(d.depois) - 5}" font-size="11" text-anchor="middle" fill="var(--fg)">${d.depois.toFixed(1)}</text>`;
        svg += `<text x="${centro}" y="${altura - 16}" font-size="12.5" text-anchor="middle" fill="var(--fg)">${d.disciplina}</text>`;
    });

    grafico.innerHTML = svg;
}

async function carregarDesempenho() {
    try {
        const response = await fetch(API + "/desempenho");
        const data = await response.json();

        desenharGrafico(data.dados);
        document.getElementById("avg").textContent = "+" + data.melhoria + "%";
    } catch (erro) {
        alert("Erro de conexão com a API");
    }
}

carregarDesempenho();
