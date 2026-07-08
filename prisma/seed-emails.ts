/**
 * E-mails simulados da SECOM. O seed roda cada um pelo MESMO pipeline de
 * produção (ingestEmail) — então o banco inicial é resultado real do
 * classificador, não dados chumbados. Datas fixas para reprodutibilidade.
 */
export type SeedEmail = {
  messageId: string;
  subject: string;
  body: string;
  receivedAt: string;
  featured?: boolean;
};

export const SECOM_ALLOWLIST_DEFAULT = 'secom@santanadeparnaiba.sp.gov.br';

export const SEED_EMAILS: SeedEmail[] = [
  {
    messageId: 'seed-hero@secom',
    featured: true,
    receivedAt: '2026-06-21T12:00:00Z',
    subject:
      '[SECOM] Prefeitura anuncia novo complexo de saúde no centro com investimento de R$ 42 milhões',
    body: 'A Prefeitura de Santana de Parnaíba anuncia a construção de um novo complexo de saúde no centro, com investimento de R$ 42 milhões. A unidade vai integrar pronto-atendimento 24h, centro de especialidades e laboratório municipal, beneficiando mais de 130 mil moradores. As obras começam em agosto e a secretaria de saúde coordenará a operação. O hospital e as UBS da região terão retaguarda no novo equipamento, com atendimento ampliado à população.',
  },
  {
    messageId: 'seed-01@secom',
    receivedAt: '2026-06-20T09:00:00Z',
    subject: 'Recapeamento da Avenida Henriqueta Mendes Guerra entra na fase final',
    body: 'A obra de recapeamento da Avenida Henriqueta Mendes Guerra entra na fase final. O recapeamento e a nova sinalização viária melhoram o trânsito na região. A interdição parcial será mantida até o fim da pavimentação. A secretaria de mobilidade informa que o asfalto novo cobre toda a extensão da via em Barueri.',
  },
  {
    messageId: 'seed-02@secom',
    receivedAt: '2026-06-19T14:30:00Z',
    subject: 'GCM amplia videomonitoramento com 60 novas câmeras inteligentes',
    body: 'A Guarda Civil Municipal amplia o videomonitoramento com 60 novas câmeras inteligentes integradas ao Detecta. A operação de segurança pública em Alphaville reforça o patrulhamento e a prevenção. O boletim de ocorrência aponta queda de furto e roubo na área monitorada pela GCM e pela polícia militar.',
  },
  {
    messageId: 'seed-03@secom',
    receivedAt: '2026-06-18T10:00:00Z',
    subject: 'Campanha de vacinação contra a gripe atinge 78% do público-alvo',
    body: 'A campanha de vacinação contra a gripe atinge 78% do público-alvo em Santana de Parnaíba. A secretaria de saúde prorroga a campanha até o fim do mês em todas as UBS e postos de saúde do município. Idosos e gestantes têm prioridade no atendimento. A vacina está disponível na unidade básica de cada bairro.',
  },
  {
    messageId: 'seed-04@secom',
    receivedAt: '2026-06-17T11:00:00Z',
    subject: 'Prefeitura abre 1.200 novas vagas em creches para o segundo semestre',
    body: 'A Prefeitura abre 1.200 novas vagas em creches da rede municipal de ensino para o segundo semestre em Barueri. A matrícula vai até 30 de junho pelo portal do cidadão. As novas unidades de creche atendem bairros da zona norte, com professor e merenda garantidos para cada aluno.',
  },
  {
    messageId: 'seed-05@secom',
    receivedAt: '2026-06-16T16:00:00Z',
    subject: 'Festival de Inverno terá shows gratuitos no parque por três fins de semana',
    body: 'O Festival de Inverno terá shows gratuitos no parque de Alphaville por três fins de semana. A programação cultural inclui música, teatro, exposição e gastronomia, além de feira de artesãos. O evento de cultura e lazer reúne atrações no patrimônio histórico da cidade.',
  },
  {
    messageId: 'seed-06@secom',
    receivedAt: '2026-06-15T08:30:00Z',
    subject: 'PAT divulga 540 vagas de emprego abertas nesta semana na região',
    body: 'O PAT, Posto de Atendimento ao Trabalhador, divulga 540 vagas de emprego abertas nesta semana em Barueri e região. As oportunidades de emprego são no comércio, logística e serviços. Interessados devem comparecer com documentos e currículo. O programa apoia o MEI e o empreendedor local com capacitação profissional.',
  },
  {
    messageId: 'seed-07@secom',
    receivedAt: '2026-06-14T13:00:00Z',
    subject: 'Operação integrada reduz em 22% os furtos no centro em seis meses',
    body: 'Uma operação integrada da Guarda Civil reduz em 22% os furtos no centro de Santana de Parnaíba em seis meses. O balanço da segurança pública aponta queda após reforço no patrulhamento e integração com o Detecta estadual. A polícia e a GCM mantêm a operação com videomonitoramento.',
  },
  {
    messageId: 'seed-08@secom',
    receivedAt: '2026-06-13T09:45:00Z',
    subject: 'Nova linha de ônibus vai ligar Alphaville ao terminal de Barueri',
    body: 'Uma nova linha de ônibus vai ligar Alphaville ao terminal de Barueri. O trajeto reduz em 25 minutos o tempo de viagem e começa a operar em julho, com integração tarifária no terminal. A secretaria de mobilidade informa que a linha atende o corredor viário da região.',
  },
  {
    messageId: 'seed-09@secom',
    receivedAt: '2026-06-12T15:20:00Z',
    subject: 'Ginásio municipal recebe etapa estadual de vôlei no próximo mês',
    body: 'O ginásio municipal de Barueri recebe a etapa estadual de vôlei no próximo mês. A competição reúne 16 equipes e tem entrada gratuita. Atletas da base local disputam vaga na final do campeonato. O torneio movimenta a quadra e a modalidade na cidade.',
  },
  {
    messageId: 'seed-10@secom',
    receivedAt: '2026-06-11T10:15:00Z',
    subject: 'Câmara aprova programa de regularização fundiária para 3 mil famílias',
    body: 'A Câmara Municipal aprova o programa de regularização fundiária para 3 mil famílias em Santana de Parnaíba. O projeto beneficia moradores de sete bairros e prevê emissão de títulos de propriedade ainda neste ano. O decreto da prefeitura e a secretaria de habitação coordenam a regularização.',
  },
  {
    messageId: 'seed-11@secom',
    receivedAt: '2026-06-10T14:00:00Z',
    subject: 'Mutirão de especialidades zera fila de espera por consultas oftalmológicas',
    body: 'Um mutirão de especialidades zera a fila de espera por consultas oftalmológicas em Alphaville. A ação de saúde realizou 900 atendimentos e encaminhou 120 cirurgias eletivas. A secretaria de saúde e o hospital municipal coordenaram a consulta e o atendimento no SUS.',
  },
  {
    messageId: 'seed-12@secom',
    receivedAt: '2026-06-09T11:30:00Z',
    subject: 'Feira do Empreendedor reúne 200 expositores no fim de semana',
    body: 'A Feira do Empreendedor reúne 200 expositores no fim de semana na região. O evento gratuito oferece capacitação, microcrédito e rodadas de negócios para MEIs. O comércio e o desenvolvimento econômico local ganham espaço, com investimento e renda para o empreendedor.',
  },
  {
    messageId: 'seed-13@secom',
    receivedAt: '2026-06-08T09:00:00Z',
    subject: 'Escolas da rede municipal recebem laboratórios de robótica',
    body: 'As escolas da rede municipal de ensino recebem laboratórios de robótica em Santana de Parnaíba. O programa de educação contempla 18 unidades e vai atender cerca de 6 mil alunos do ensino fundamental. O professor e a escola ganham novo recurso pedagógico com a robótica.',
  },
  {
    messageId: 'seed-14@secom',
    receivedAt: '2026-06-07T16:40:00Z',
    subject: 'Obras de drenagem no Jardim Belval devem acabar com alagamentos',
    body: 'As obras de drenagem no Jardim Belval, em Barueri, devem acabar com os alagamentos. A intervenção viária de R$ 8 milhões inclui novas galerias e recuperação do córrego. A obra terá desvios de trânsito durante a pavimentação, informa a secretaria de mobilidade.',
  },
];
