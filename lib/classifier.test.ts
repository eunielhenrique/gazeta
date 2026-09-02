import test from 'node:test';
import assert from 'node:assert/strict';
import { classify } from './classifier';

test('região do título vence uma citação de passagem no corpo (bug real: Barueri por causa da ordem do array)', () => {
  const r = classify({
    subject: 'Santana de Parnaíba conquista pódio completo na etapa regional da Olimpíada de Robótica',
    body:
      'Santana de Parnaíba conquistou o pódio completo da etapa regional da Olimpíada Brasileira de Robótica Artística, realizada no sábado (22/8), na Secretaria Municipal de Educação (SME). Uma aluna de Barueri também disputou a etapa, fora da classificação.',
  });
  assert.equal(r.regiao, 'santana-de-parnaiba');
});

test('região do título vence quando é outro município', () => {
  const r = classify({
    subject: 'Barueri inaugura nova unidade de saúde no Jardim Silveira',
    body: 'A prefeitura de Barueri entregou nesta semana uma nova UBS no bairro.',
  });
  assert.equal(r.regiao, 'barueri');
});

test('sem menção a nenhum município, cai na região padrão', () => {
  const r = classify({
    subject: 'Secretaria de Educação lança programa de reforço escolar',
    body: 'O programa vai atender alunos da rede municipal a partir do próximo mês.',
  });
  assert.equal(r.regiao, 'santana-de-parnaiba');
});
