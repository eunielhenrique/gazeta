import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BRANDS } from './brand';
import { coverColors, fallbackCoverPath, isPlaceholderCover, renderCoverSvg, resolveCoverUrl } from './cover';

test('post sem foto (null ou placeholder legado) cai na capa da editoria', () => {
  assert.equal(isPlaceholderCover(null), true);
  assert.equal(isPlaceholderCover(undefined), true);
  assert.equal(isPlaceholderCover('https://gazetadealphaville.com.br/capa-padrao.svg'), true);
  assert.equal(isPlaceholderCover('https://gazetadealphaville.com.br/api/media/abc'), false);
  assert.equal(resolveCoverUrl(null, 'cidade'), '/api/capa/cidade');
  assert.equal(resolveCoverUrl('https://gazetadealphaville.com.br/capa-padrao.svg', 'saude'), '/api/capa/saude');
  assert.equal(resolveCoverUrl('https://x/api/media/1', 'saude'), 'https://x/api/media/1');
  assert.equal(fallbackCoverPath('cidade'), '/api/capa/cidade');
});

test('cor da capa segue a taxonomia na gazeta e a paleta da marca no aaah', () => {
  const gz = coverColors(BRANDS.gazeta, 'cidade');
  assert.equal(gz.background, '#3b89ff');
  assert.equal(gz.nome, 'Cidade');
  const aa = coverColors(BRANDS.aaah, 'cidade');
  assert.equal(aa.background, BRANDS.aaah.editoriaPalette!.colors[0]);
  assert.equal(aa.text, BRANDS.aaah.editoriaPalette!.text);
  // editoria desconhecida não quebra
  assert.equal(coverColors(BRANDS.gazeta, 'xyz').nome, 'Notícias');
});

test('svg gerado é 16:9, leva a marca e escapa caracteres', () => {
  const svg = renderCoverSvg(BRANDS.aaah, 'seguranca');
  assert.ok(svg.startsWith('<svg'));
  assert.ok(svg.includes('viewBox="0 0 1200 675"'));
  assert.ok(svg.includes('AAAH!'));
  assert.ok(svg.includes('Segurança'));
  assert.ok(!svg.includes('<script'));
  const evil = renderCoverSvg({ ...BRANDS.gazeta, name: 'a<b>&"c"' }, 'cidade');
  assert.ok(evil.includes('A&lt;B&gt;&amp;&quot;C&quot;'));
});
