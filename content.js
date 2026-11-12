/* Conteúdo editorial e educativo. Nada aqui é estatística do projeto. */
(function () {
  const ML = (window.ML = window.ML || {});

  ML.content = {
    journeyWrong: [
      { id: 'descarte', title: 'Descarte', text: 'Uma embalagem é deixada no chão em vez de ir para a coleta adequada.' },
      { id: 'escoamento', title: 'Escoamento urbano', text: 'Chuva e vento podem empurrar o resíduo pelas ruas e calçadas.' },
      { id: 'drenagem', title: 'Drenagem', text: 'Bueiros e galerias podem levar o material para canais e córregos.' },
      { id: 'rios', title: 'Rios', text: 'Cursos d’água podem transportar resíduos por longas distâncias.' },
      { id: 'costa', title: 'Região costeira', text: 'Na foz e no litoral, o resíduo pode se acumular em praias, estuários e manguezais.' },
      { id: 'mar', title: 'Ambiente marinho', text: 'No mar, correntes e ventos podem espalhar o material e dificultar muito a remoção.' },
    ],
    journeyRight: [
      { id: 'descarte', title: 'Descarte', text: 'A embalagem é separada e levada à coleta adequada disponível na região.' },
      { id: 'coleta', title: 'Coleta', text: 'Caminhões ou pontos de entrega recolhem os resíduos sem passar pela drenagem.' },
      { id: 'triagem', title: 'Triagem', text: 'Materiais recicláveis podem ser separados por tipo (onde há coleta seletiva).' },
      { id: 'destino', title: 'Destinação', text: 'O que pode ser reaproveitado segue para reciclagem; o restante, para destinação final ambientalmente adequada.' },
    ],
    journeyNote: 'Representação ilustrativa: os caminhos reais variam conforme o local, o clima e a infraestrutura. Também existem fontes marítimas, como equipamentos de pesca perdidos.',

    quiz: [
      {
        q: 'Você terminou um refrigerante em garrafa PET na rua. Qual o melhor destino?',
        options: ['Deixar perto do bueiro, a chuva leva', 'Esvaziar e colocar na coleta seletiva, se houver na sua cidade', 'Deixar na areia da praia'],
        answer: 1,
        why: 'Resíduo na rua pode ser arrastado pela água da chuva até a drenagem e os rios. A coleta seletiva encaminha o material para triagem. Confira as regras da sua cidade.',
      },
      {
        q: 'O que fazer com pilhas e baterias usadas?',
        options: ['Jogar no lixo comum', 'Entregar em pontos de coleta (logística reversa)', 'Descartar no vaso sanitário'],
        answer: 1,
        why: 'A Política Nacional de Resíduos Sólidos prevê logística reversa para pilhas e baterias: procure pontos de entrega de comércios ou fabricantes.',
      },
      {
        q: 'Onde descartar uma bituca de cigarro?',
        options: ['No ralo, a água leva', 'Na areia, ela se decompõe', 'No lixo comum, bem apagada'],
        answer: 2,
        why: 'Filtros de cigarro costumam ser feitos de acetato de celulose, um tipo de plástico. Não pertencem a ralos, ruas nem praias.',
      },
      {
        q: 'Uma caixa de pizza com muita gordura:',
        options: ['Vai inteira para a coleta seletiva', 'Separe a parte limpa para reciclagem; a parte engordurada vai para o lixo comum', 'Deve ser queimada'],
        answer: 1,
        why: 'Em geral, a gordura contamina as fibras do papel. Separar a parte limpa ajuda; confirme o que a coleta da sua cidade aceita.',
      },
      {
        q: 'Você vê uma seringa ou vidro quebrado na praia. O que fazer?',
        options: ['Recolher com as mãos para ajudar', 'Não tocar, afastar-se e avisar um adulto responsável ou guarda-vidas', 'Enterrar na areia'],
        answer: 1,
        why: 'Objetos cortantes ou desconhecidos podem causar acidentes. Ações de limpeza devem ser organizadas e supervisionadas por adultos responsáveis.',
      },
      {
        q: 'Medicamentos vencidos devem ir para:',
        options: ['A pia ou o vaso', 'Farmácias ou pontos de coleta que recebam esse material', 'A coleta seletiva de plástico'],
        answer: 1,
        why: 'Despejar remédios na pia pode levá-los aos rios. Pergunte em farmácias e na prefeitura onde entregar na sua cidade.',
      },
    ],

    curiosities: [
      { tag: 'Microplásticos', q: 'O que é um microplástico?', a: 'Pedaços de plástico com menos de 5 milímetros de tamanho, segundo a definição usada pela NOAA.', src: 'NOAA — What is marine debris?', url: 'https://www.noaa.gov/explainers/what-is-marine-debris' },
      { tag: 'Origem', q: 'De onde vem o lixo do mar?', a: 'Uma parte vem de fontes em terra, levada por vento, chuva, drenagem e rios; outra vem de fontes marítimas, como equipamentos de pesca.', src: 'NOAA — Land-based marine debris', url: 'https://marinedebris.noaa.gov/where-does-marine-debris-come/land-based-marine-debris' },
      { tag: 'Escala', q: 'Qual a ordem de grandeza global?', a: 'O PNUMA estima que 19 a 23 milhões de toneladas de plástico entram em ecossistemas aquáticos por ano. É um dado global, não do Mar Limpo.', src: 'PNUMA / UNEP', url: 'https://www.unep.org/en/what-we-do/ocean-seas-and-coasts/ecosystem-degradation-pollution/plastic-pollution-and-marine' },
      { tag: 'Biodiversidade', q: 'Como o lixo afeta os animais?', a: 'Animais marinhos podem ficar emaranhados em resíduos ou ingeri-los. Por isso prevenir na origem é tão importante.', src: 'NOAA — Marine Debris Program', url: 'https://marinedebris.noaa.gov/' },
      { tag: 'Reciclagem', q: 'Reciclar basta?', a: 'Reciclagem depende de separar bem, ter coleta e ter quem processe. Reduzir o descartável vem antes. (Orientação educativa, não uma estatística.)', src: 'Orientação educativa do projeto', url: '' },
      { tag: 'Costa', q: 'Por que o litoral importa?', a: 'Estuários, praias e manguezais ficam onde rios e cidades encontram o mar, por isso podem receber resíduos vindos de longe. (Contexto geral, sem número.)', src: 'NOAA — Land-based marine debris', url: 'https://marinedebris.noaa.gov/where-does-marine-debris-come/land-based-marine-debris' },
    ],

    // Sugestões de iniciativa: orientações educativas, não resultados prometidos.
    initiatives: {
      'recusar-descartavel': 'Desafio de 7 dias: leve garrafa, copo e sacola reutilizáveis e anote quantas vezes você recusou um descartável.',
      'descarte-correto': 'Descubra onde ficam os pontos de coleta seletiva e de logística reversa perto de você e monte um mini guia para a sua turma ou família.',
      'informacao-confiavel': 'Escolha um dado de uma fonte oficial (como as deste site), confira o ano e compartilhe com a fonte citada.',
      'acao-organizada': 'Converse com a escola ou com um grupo comunitário sobre uma ação supervisionada por adultos. Não organize nem participe de limpezas sem autorização.',
      'aprender-descarte': 'Pesquise no site da prefeitura como funciona a coleta e a coleta seletiva e confirme o que sua cidade aceita.',
      'apoiar-preservacao': 'Conheça organizações reconhecidas que atuam com o mar e divulgue o trabalho delas. Aqui não há doações nem pagamentos.',
    },
    coastalTip: 'Este estado tem litoral: resíduos da cidade e dos rios podem chegar à costa. Prevenir na origem é o passo mais barato.',
    inlandTip: 'Este estado não tem litoral, mas rios e cidades do interior também fazem parte do caminho dos resíduos até o mar.',

    demoEvents: [
      { title: 'Roda de conversa: de onde vem o lixo da praia?', date: 'A definir', region: 'Exemplo', category: 'Educação', status: 'Exemplo de demonstração', description: 'Evento fictício que mostra como a agenda funciona. Não existe, não tem local nem data.', kind: 'demonstracao' },
      { title: 'Oficina de separação de resíduos', date: 'A definir', region: 'Exemplo', category: 'Reciclagem', status: 'Exemplo de demonstração', description: 'Evento fictício para demonstração da interface.', kind: 'demonstracao' },
      { title: 'Mutirão supervisionado (modelo)', date: 'A definir', region: 'Exemplo', category: 'Ação supervisionada', status: 'Exemplo de demonstração', description: 'Modelo de como um evento real seria apresentado: só com organização responsável, autorização e adultos supervisionando.', kind: 'demonstracao' },
    ],

    sources: [
      { name: 'IBGE — Censo Demográfico 2022: Características dos domicílios', what: 'Coleta de lixo domiciliar (Brasil e extremos por UF).', year: '2022', url: 'https://educa.ibge.gov.br/jovens/materias-especiais/22064-caracteristicas-dos-domicilios-censo-2022.html', used: true },
      { name: 'IBGE (Agência de Notícias) — Censo 2022: coleta por porte de município', what: 'Cobertura de coleta por tamanho do município.', year: '2022', url: 'https://agenciagov.ebc.gov.br/noticias/202402/censo-2022-rede-de-esgoto-alcanca-62-5-da-populacao-mas-desigualdades-regionais-e-por-cor-e-raca-persistem-1', used: true },
      { name: 'PNUMA / UNEP — Plastic Pollution and Marine Litter', what: 'Referência global de plástico em ecossistemas aquáticos.', year: '—', url: 'https://www.unep.org/en/what-we-do/ocean-seas-and-coasts/ecosystem-degradation-pollution/plastic-pollution-and-marine', used: true },
      { name: 'NOAA — Land-based Marine Debris', what: 'Como resíduos em terra podem chegar ao mar.', year: '—', url: 'https://marinedebris.noaa.gov/where-does-marine-debris-come/land-based-marine-debris', used: true },
      { name: 'NOAA — What is Marine Debris?', what: 'Definições (incluindo microplásticos).', year: '—', url: 'https://www.noaa.gov/explainers/what-is-marine-debris', used: true },
      { name: 'SINIR — Sistema Nacional de Informações sobre a Gestão dos Resíduos Sólidos', what: 'Portal para futura importação de indicadores de gestão de resíduos.', year: '—', url: 'https://sinir.gov.br/', used: false },
      { name: 'SINISA — Ministério das Cidades', what: 'Sistema de informações de saneamento (resíduos). Ainda não importado.', year: '—', url: 'https://www.gov.br/cidades/', used: false },
      { name: 'IBGE', what: 'Divisão territorial (regiões e litoral das UFs) e futura importação de dados por UF/município.', year: '—', url: 'https://www.ibge.gov.br/', used: true },
    ],
    credits: [
      'Mapa do Brasil: @svg-maps/brazil, de Victor Cazanave (licença CC BY 4.0).',
      'Fontes tipográficas: Space Grotesk, DM Sans e DM Mono (SIL Open Font License), hospedadas no próprio site.',
    ],
  };
})();
