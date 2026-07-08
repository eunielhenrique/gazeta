/**
 * Conteúdo real do portal — baseado em ações e entregas oficiais da
 * Prefeitura de Santana de Parnaíba (Plano de Metas 2025-2026 e obras
 * entregues). Fonte: SECOM · Prefeitura de Santana de Parnaíba.
 * Datas fixas para reprodutibilidade do seed.
 */
export type SeedItem = {
  id: string;
  editoria: string; // slug da editoria (taxonomia)
  regiao: string; // slug da região
  title: string;
  body: string;
  date: string; // ISO
  featured?: boolean;
};

export const SECOM_ALLOWLIST_DEFAULT = 'secom@santanadeparnaiba.sp.gov.br';

export const SEED_ITEMS: SeedItem[] = [
  {
    id: 'hospital-santa-ana',
    editoria: 'saude',
    regiao: 'santana-de-parnaiba',
    featured: true,
    date: '2026-07-06T12:00:00Z',
    title: 'Hospital e Maternidade Municipal Santa Ana amplia atendimento em Santana de Parnaíba',
    body: 'A Prefeitura de Santana de Parnaíba entregou à população o Hospital e Maternidade Municipal Santa Ana, um dos maiores investimentos em saúde da história do município. Com cerca de 14 mil metros quadrados e 200 leitos, a unidade conta com Pronto-Socorro Infantil, Pronto-Socorro Adulto e centros cirúrgicos, além de equipamentos como tomógrafo e aparelhos de raios-x fixos e móveis.\n\nO novo hospital amplia a capacidade de atendimento da rede municipal e oferece retaguarda às Unidades Básicas de Saúde de todos os bairros. A obra foi executada com recursos próprios e integra o conjunto de ações de saúde previstas no Plano de Metas 2025-2026.\n\nCom a entrega, moradores passam a contar com atendimento de urgência e emergência mais próximo, reduzindo a necessidade de deslocamento para outras cidades.',
  },
  {
    id: 'ubs-caps-bairro-120',
    editoria: 'saude',
    regiao: 'santana-de-parnaiba',
    date: '2026-07-02T09:00:00Z',
    title: 'Bairro 120 recebe nova UBS e CAPS Infantil para ampliar a rede de saúde',
    body: 'A Prefeitura de Santana de Parnaíba avança na ampliação da rede de saúde com a nova Unidade Básica de Saúde e o CAPS Infantil no bairro 120. Os equipamentos aproximam o atendimento da população da região e reforçam o cuidado em saúde mental de crianças e adolescentes.\n\nSegundo a secretaria de saúde, as unidades integram o Plano de Metas do município e ampliam a oferta de consultas, exames e acompanhamento especializado. A expectativa é beneficiar milhares de moradores dos bairros vizinhos.',
  },
  {
    id: 'uniparna-mackenzie',
    editoria: 'educacao',
    regiao: 'santana-de-parnaiba',
    date: '2026-06-30T10:00:00Z',
    title: 'Uniparna leva ensino superior a jovens sem que precisem sair da cidade',
    body: 'A Prefeitura de Santana de Parnaíba implantou a Universidade Virtual de Santana de Parnaíba (Uniparna), que amplia o acesso ao ensino superior sem que os jovens precisem sair do município. O projeto foi viabilizado por um protocolo de intenções com a Universidade Presbiteriana Mackenzie para a criação do polo educacional.\n\nA iniciativa integra as ações de educação do Plano de Metas e busca ampliar as oportunidades de formação e qualificação da juventude parnaibana, aproximando o ensino superior da população.',
  },
  {
    id: 'colegios-suru-jaguari',
    editoria: 'educacao',
    regiao: 'santana-de-parnaiba',
    date: '2026-06-27T11:00:00Z',
    title: 'Novos colégios do Suru e do Jaguari são entregues à população',
    body: 'A rede municipal de ensino de Santana de Parnaíba recebeu os novos colégios do Suru e do Jaguari, entregues à população. Estão em construção mais duas unidades, nos bairros Cidade São Pedro e Parque Santana, com salas modernas, áreas de recreação e playgrounds.\n\nAs novas escolas ajudam o município a caminhar para zerar a fila de creche e a ampliar o ensino integral. O Plano de Metas prevê ainda a reforma de dezenas de colégios e a expansão de programas educacionais na cidade.',
  },
  {
    id: 'recapeamento-100km',
    editoria: 'mobilidade',
    regiao: 'santana-de-parnaiba',
    date: '2026-06-24T08:30:00Z',
    title: 'Programa de recapeamento renova 100 km de vias por ano nos bairros',
    body: 'A Prefeitura de Santana de Parnaíba mantém o programa de recapeamento que renova 100 quilômetros de vias por ano em bairros de todo o município. As obras de infraestrutura viária melhoram a mobilidade, a sinalização e a segurança do trânsito.\n\nA secretaria responsável informa que o cronograma segue ao longo do ano, com equipes atuando em diferentes regiões. A ação integra o Plano de Metas 2025-2026 e é uma das mais visíveis para o cidadão no dia a dia.',
  },
  {
    id: 'duplicacoes-viarias',
    editoria: 'mobilidade',
    regiao: 'santana-de-parnaiba',
    date: '2026-06-21T14:30:00Z',
    title: 'Duplicações da Yojiro Takaoka e da Estrada dos Romeiros melhoram o trânsito',
    body: 'As obras de duplicação da Avenida Yojiro Takaoka, da Estrada dos Romeiros e da Avenida Jaguari avançam e vão melhorar o fluxo do trânsito em Santana de Parnaíba. As intervenções viárias beneficiam bairros como Parque Santana e Cidade São Pedro e integram o pacote de mobilidade do município.\n\nDurante a execução, o trânsito conta com sinalização e desvios orientados. As duplicações fazem parte das mais de 110 obras, programas e ações previstos no Plano de Metas.',
  },
  {
    id: 'sede-gcm-seguranca',
    editoria: 'seguranca',
    regiao: 'santana-de-parnaiba',
    date: '2026-06-18T13:00:00Z',
    title: 'Nova sede da Guarda Civil e complexo de segurança reforçam a proteção no município',
    body: 'A Prefeitura de Santana de Parnaíba constrói a nova sede da Guarda Civil Municipal, dentro de um complexo de segurança na Estrada dos Romeiros. O município também recebeu a Delegacia de Defesa da Mulher e mantém a Patrulha Maria da Penha, ampliando a rede de proteção.\n\nAs ações de segurança pública integram o Plano de Metas 2025-2026 e têm como objetivo reforçar o patrulhamento, o atendimento à população e a prevenção em todos os bairros.',
  },
  {
    id: 'plano-de-metas',
    editoria: 'cidade',
    regiao: 'santana-de-parnaiba',
    date: '2026-06-15T09:45:00Z',
    title: 'Prefeitura apresenta Plano de Metas com mais de 110 obras, programas e ações',
    body: 'A Prefeitura de Santana de Parnaíba apresentou o Plano de Metas 2025-2026, com mais de 110 obras, programas e ações em áreas como saúde, educação, segurança, mobilidade, habitação, cultura e esporte. Entre os destaques administrativos estão a construção do novo Fórum e da nova Câmara Municipal.\n\nO plano orienta os investimentos e os serviços ao cidadão ao longo do período e reúne metas para cada secretaria, com acompanhamento da execução ao longo dos meses.',
  },
  {
    id: 'projeto-vida-nova',
    editoria: 'cidade',
    regiao: 'santana-de-parnaiba',
    date: '2026-06-12T10:15:00Z',
    title: 'Projeto Vida Nova amplia regularização fundiária e revitalização urbana',
    body: 'A Prefeitura de Santana de Parnaíba ampliou o programa de regularização fundiária por meio do Projeto Vida Nova, que leva regularização e revitalização urbana a diferentes bairros. A iniciativa dá mais segurança jurídica às famílias e melhora a infraestrutura das regiões atendidas.\n\nO programa integra as ações de habitação e cidade do município e prevê a emissão de documentos de propriedade, além de melhorias em ruas, iluminação e paisagismo.',
  },
  {
    id: 'centro-historico-cultura',
    editoria: 'cultura',
    regiao: 'santana-de-parnaiba',
    date: '2026-06-09T16:00:00Z',
    title: 'Centro Histórico ganha calçadões e rede elétrica enterrada em novo projeto cultural',
    body: 'A Prefeitura de Santana de Parnaíba investe na revitalização do Centro Histórico, com projeto para enterrar a rede elétrica e implantar calçadões, valorizando um dos patrimônios mais importantes do estado. Entre as ações culturais também estão o novo Centro Cultural, a Biblioteca de vidro e a Feira Literária.\n\nAs iniciativas fortalecem a cultura, o lazer e o turismo no município, que já é conhecido pelo Natal de Luz e pelo conjunto arquitetônico do centro histórico tombado.',
  },
  {
    id: 'piscina-esporte',
    editoria: 'esporte',
    regiao: 'santana-de-parnaiba',
    date: '2026-06-06T15:20:00Z',
    title: 'Bairro 120 terá piscina coberta e aquecida e cidade amplia equipamentos esportivos',
    body: 'A Prefeitura de Santana de Parnaíba amplia os equipamentos esportivos com a piscina coberta e aquecida no bairro 120 e novos parques no Suru e no Cururuquara. O Campo Municipal Beira-Rio já foi inaugurado e as arquibancadas dos campos municipais receberão cobertura.\n\nAs ações de esporte e lazer integram o Plano de Metas e incluem competições como a Copa do Povo, que reúne atletas e equipes de diversos bairros ao longo do ano.',
  },
  {
    id: 'fabrica-programadores',
    editoria: 'economia',
    regiao: 'santana-de-parnaiba',
    date: '2026-06-03T11:30:00Z',
    title: 'Fábrica de Programadores qualifica jovens para o mercado de tecnologia',
    body: 'A Prefeitura de Santana de Parnaíba mantém a Fábrica de Programadores, programa que qualifica jovens do município para o mercado de trabalho em tecnologia. A iniciativa amplia oportunidades de emprego e renda e se soma à Uniparna no eixo de educação e desenvolvimento econômico.\n\nO programa faz parte das ações executadas pelo município e busca preparar a juventude para vagas em uma das áreas que mais crescem no país.',
  },
];
