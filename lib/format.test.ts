import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanEmailBody, cleanSubject, excerptFrom } from './format';

test('cleanSubject tira jargão de assessoria além de prefixos de encaminhamento', () => {
  assert.equal(cleanSubject('Sugestão de pauta: Santana entrega 700 escrituras'), 'Santana entrega 700 escrituras');
  assert.equal(cleanSubject('SUGESTÃO DE PAUTA - Feira acontece sábado'), 'Feira acontece sábado');
  assert.equal(cleanSubject('Enc: Release: Fatec celebra formatura'), 'Fatec celebra formatura');
  assert.equal(cleanSubject('Nota de imprensa: Obra é entregue'), 'Obra é entregue');
  // "Nota de adiamento" é assunto real, não prefixo — fica.
  assert.equal(cleanSubject('Nota de adiamento - Feira da Mulher Empreendedora'), 'Nota de adiamento - Feira da Mulher Empreendedora');
  // já limpo passa intacto
  assert.equal(cleanSubject('Santana de Parnaíba é vice-campeã dos Jogos Regionais'), 'Santana de Parnaíba é vice-campeã dos Jogos Regionais');
});

test('cleanEmailBody remove cabeçalho institucional, título repetido e assinatura da SECOM', () => {
  const title = 'Santana de Parnaíba entrega cerca de 700 escrituras';
  const raw = [
    'SUGESTÃO DE PAUTA',
    'PREFEITURA DE SANTANA DE PARNAÍBA',
    'Santana de Parnaíba entrega cerca de 700\nescrituras',
    'Nova etapa do programa acontece neste sábado',
    'Mais de 2,8 mil famílias estão prestes a receber a escritura.',
    'Serviço\nEntrega de escrituras\n\nDia: 5 de setembro (sábado)\n\nEndereço: Centro de Convenções',
    '*Imprensa: Prefeitura de Santana de Parnaíba*\nAv. Mal. Mascarenhas, 1283\nSecretaria de Comunicação - SECOM. Jornalista Responsável: X\nContatos: (11) 99501-1087\nOutras informações: secom.imprensa@santanadeparnaiba.sp.gov.br',
  ].join('\n\n');
  const out = cleanEmailBody(raw, title);
  assert.ok(out.startsWith('Nova etapa do programa'), out);
  assert.ok(out.includes('Endereço: Centro de Convenções'), 'bloco Serviço é conteúdo e fica');
  assert.ok(!/imprensa:|secom|@/i.test(out), out);
});

test('cleanEmailBody corta "Texto: SECOM" e o cabeçalho de nota', () => {
  const a = cleanEmailBody('Corpo da matéria.\n\nTexto: SECOM - Santana de Parnaíba');
  assert.equal(a, 'Corpo da matéria.');
  const b = cleanEmailBody('NOTA DE ADIAMENTO\n\nPREFEITURA DE SANTANA DE PARNAÍBA\n\n\nA Prefeitura informa que a feira foi adiada.\n\nEm breve nova data.');
  assert.equal(b, 'A Prefeitura informa que a feira foi adiada.\n\nEm breve nova data.');
  // corpo limpo passa intacto (idempotente)
  assert.equal(cleanEmailBody(b), b);
});

test('excerptFrom não emenda linha-fina sem ponto na frase seguinte', () => {
  const body = 'Nova etapa do programa acontece neste sábado\n\nMais de 2,8 mil famílias estão prestes a receber a escritura. Segunda frase.';
  const ex = excerptFrom(body, 120);
  assert.ok(ex.startsWith('Nova etapa do programa acontece neste sábado. Mais de 2,8 mil'), ex);
});

test('cleanEmailBody: cabeçalho em linhas coladas (formato Marcha) e frase que começa com Prefeitura', () => {
  const title = 'Marcha para Jesus reúne fé em Santana de Parnaíba';
  const raw = 'SUGESTÃO DE PAUTA\nPREFEITURA DE SANTANA DE PARNAÍBA\n\nMarcha para Jesus reúne fé em\nSantana de Parnaíba\n\nRenascer Praise está entre as atrações\n\nSantana de Parnaíba será palco da Marcha.';
  const out = cleanEmailBody(raw, title);
  assert.ok(out.startsWith('Renascer Praise'), out);
  // frase normal começando com "Prefeitura de ..." não é cabeçalho
  const frase = 'Prefeitura de Santana de Parnaíba inaugura novo espaço para os idosos da cidade\n\nSegundo parágrafo.';
  assert.equal(cleanEmailBody(frase), frase);
});
