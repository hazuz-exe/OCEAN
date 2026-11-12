/*
 * Definições compartilhadas entre servidor (require) e navegador (<script>).
 * Uma única fonte de verdade evita divergência entre o que o site mostra e o que a API aceita.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.ML = root.ML || {}; root.ML.shared = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Chaves antigas (v2) preservadas; duas novas adicionadas na v3.
  const ACTIONS = {
    'recusar-descartavel': { title: 'Reduzir o plástico descartável', short: 'Recusar um descartável', detail: 'Escolher uma alternativa reutilizável quando ela estiver disponível.' },
    'descarte-correto': { title: 'Separar e descartar corretamente', short: 'Fazer o descarte correto', detail: 'Separar e encaminhar resíduos conforme a coleta disponível na comunidade.' },
    'informacao-confiavel': { title: 'Compartilhar informação confiável', short: 'Compartilhar informação confiável', detail: 'Divulgar uma fonte científica ou educativa sobre o oceano.' },
    'acao-organizada': { title: 'Participar de uma iniciativa supervisionada', short: 'Participar de uma ação organizada', detail: 'Participar de uma atividade escolar ou comunitária com responsáveis adultos.' },
    'aprender-descarte': { title: 'Aprender sobre descarte correto', short: 'Aprender sobre descarte', detail: 'Pesquisar as regras de coleta e logística reversa da sua cidade.' },
    'apoiar-preservacao': { title: 'Acompanhar projetos de preservação', short: 'Apoiar projetos de preservação', detail: 'Conhecer e divulgar o trabalho de organizações reconhecidas. Não envolve dinheiro neste site.' },
  };

  // Grandes regiões e litoral: divisão territorial oficial do IBGE (17 UFs com litoral).
  const REGIONS = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];
  const UFS = {
    AC: ['Acre', 'Norte', 0], AM: ['Amazonas', 'Norte', 0], AP: ['Amapá', 'Norte', 1], PA: ['Pará', 'Norte', 1],
    RO: ['Rondônia', 'Norte', 0], RR: ['Roraima', 'Norte', 0], TO: ['Tocantins', 'Norte', 0],
    AL: ['Alagoas', 'Nordeste', 1], BA: ['Bahia', 'Nordeste', 1], CE: ['Ceará', 'Nordeste', 1], MA: ['Maranhão', 'Nordeste', 1],
    PB: ['Paraíba', 'Nordeste', 1], PE: ['Pernambuco', 'Nordeste', 1], PI: ['Piauí', 'Nordeste', 1],
    RN: ['Rio Grande do Norte', 'Nordeste', 1], SE: ['Sergipe', 'Nordeste', 1],
    DF: ['Distrito Federal', 'Centro-Oeste', 0], GO: ['Goiás', 'Centro-Oeste', 0], MS: ['Mato Grosso do Sul', 'Centro-Oeste', 0], MT: ['Mato Grosso', 'Centro-Oeste', 0],
    ES: ['Espírito Santo', 'Sudeste', 1], MG: ['Minas Gerais', 'Sudeste', 0], RJ: ['Rio de Janeiro', 'Sudeste', 1], SP: ['São Paulo', 'Sudeste', 1],
    PR: ['Paraná', 'Sul', 1], RS: ['Rio Grande do Sul', 'Sul', 1], SC: ['Santa Catarina', 'Sul', 1],
  };
  const ufList = Object.keys(UFS).map((id) => ({ id, name: UFS[id][0], region: UFS[id][1], coastal: Boolean(UFS[id][2]) }));
  const ufInfo = (id) => (UFS[id] ? { id, name: UFS[id][0], region: UFS[id][1], coastal: Boolean(UFS[id][2]) } : null);

  const ACHIEVEMENTS = [
    { id: 'primeira-mare', name: 'Primeira maré', description: 'Registrou o primeiro compromisso.' },
    { id: 'explorador-oceanico', name: 'Explorador oceânico', description: 'Registrou compromissos ligados a 2 estados diferentes.' },
    { id: 'conhecedor-ambiental', name: 'Conhecedor ambiental', description: 'Assumiu um compromisso de aprender e outro de compartilhar informação.' },
    { id: 'participante-consciente', name: 'Participante consciente', description: 'Assumiu 3 tipos diferentes de compromisso.' },
    { id: 'protetor-dos-mares', name: 'Protetor dos mares', description: 'Registrou 5 compromissos em 4 tipos diferentes.' },
  ];

  // Conquistas simbólicas calculadas a partir dos registros de UM participante.
  function computeAchievements(pledges) {
    const list = Array.isArray(pledges) ? pledges : [];
    const types = new Set(list.map((p) => p.action));
    const ufs = new Set(list.filter((p) => p.uf).map((p) => p.uf));
    const earned = new Set();
    if (list.length >= 1) earned.add('primeira-mare');
    if (ufs.size >= 2) earned.add('explorador-oceanico');
    if (types.has('aprender-descarte') && types.has('informacao-confiavel')) earned.add('conhecedor-ambiental');
    if (types.size >= 3) earned.add('participante-consciente');
    if (list.length >= 5 && types.size >= 4) earned.add('protetor-dos-mares');
    return ACHIEVEMENTS.filter((a) => earned.has(a.id)).map((a) => a.id);
  }

  const SIM_PURPOSES = {
    educacao: 'Educação ambiental',
    preservacao: 'Preservação marinha',
    reciclagem: 'Reciclagem',
    limpeza: 'Ações de limpeza',
    pesquisa: 'Pesquisa e conscientização',
  };
  const SIM_LIMITS = { min: 1, max: 1000 };

  // Distribuição ILUSTRATIVA (regra fixa de demonstração, não é prestação de contas):
  // foco = 100% no destino; principal = 60% + 10% para cada um dos outros; equilibrado = 20% cada.
  function simSplit(purpose, preset) {
    const keys = Object.keys(SIM_PURPOSES);
    const out = {};
    keys.forEach((k) => {
      if (preset === 'foco') out[k] = k === purpose ? 100 : 0;
      else if (preset === 'equilibrado') out[k] = 20;
      else out[k] = k === purpose ? 60 : 10;
    });
    return out;
  }

  return { ACTIONS, REGIONS, UFS, ufList, ufInfo, ACHIEVEMENTS, computeAchievements, SIM_PURPOSES, SIM_LIMITS, simSplit, VERSION: '3.0.0' };
});
