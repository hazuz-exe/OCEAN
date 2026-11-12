/*
 * DADOS OFICIAIS importados — cada número tem fonte, ano e link.
 * Regra do projeto: nada aqui é estimado pelo Mar Limpo. UF sem valor = "não importado".
 * Para ampliar: acrescente valores em `ufs` copiando-os da fonte (IBGE/SIDRA, SINISA, SINIR) e atualize `year`/`note`.
 * ATENÇÃO: coleta de lixo domiciliar NÃO é medição de lixo no mar.
 */
(function () {
  const ML = (window.ML = window.ML || {});
  ML.indicators = {
    coleta: {
      id: 'coleta',
      label: 'Coleta de lixo domiciliar (direta ou indireta)',
      short: 'Coleta de lixo',
      unit: '% da população em domicílios com coleta',
      year: 2022,
      source: 'IBGE — Censo Demográfico 2022, Características dos domicílios',
      url: 'https://educa.ibge.gov.br/jovens/materias-especiais/22064-caracteristicas-dos-domicilios-censo-2022.html',
      national: { 2000: 76.4, 2010: 85.8, 2022: 90.9 },
      ufs: { SP: 99.0, MA: 69.8 },
      delta: { MA: { from: 2010, pp: 16.3 } },
      bySize: [
        { label: 'Municípios com menos de 5 mil hab.', value: 78.9 },
        { label: 'Municípios com mais de 500 mil hab.', value: 98.9 },
      ],
      sizeSource: 'IBGE (Agência de Notícias) — Censo 2022',
      sizeUrl: 'https://agenciagov.ebc.gov.br/noticias/202402/censo-2022-rede-de-esgoto-alcanca-62-5-da-populacao-mas-desigualdades-regionais-e-por-cor-e-raca-persistem-1',
      note: 'Valores por UF importados até agora: São Paulo (maior valor entre as UFs) e Maranhão (menor). As demais UFs ainda não foram importadas.',
    },
  };

  ML.global = {
    label: 'Plástico que entra em ecossistemas aquáticos por ano',
    value: '19–23 milhões de toneladas',
    source: 'PNUMA / UNEP — Plastic Pollution and Marine Litter',
    url: 'https://www.unep.org/en/what-we-do/ocean-seas-and-coasts/ecosystem-degradation-pollution/plastic-pollution-and-marine',
  };
})();
