import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveBrand, BRANDS, DEFAULT_BRAND_ID } from './brand';

test('resolve pelo domínio exato', () => {
  assert.equal(resolveBrand('aaah.com.br').id, 'aaah');
  assert.equal(resolveBrand('gazetadealphaville.com.br').id, 'gazeta');
});

test('ignora www. e porta, e é case-insensitive', () => {
  assert.equal(resolveBrand('www.aaah.com.br').id, 'aaah');
  assert.equal(resolveBrand('AAAH.COM.BR').id, 'aaah');
  assert.equal(resolveBrand('aaah.com.br:3000').id, 'aaah');
});

test('host desconhecido (preview, localhost) cai na marca padrão', () => {
  assert.equal(resolveBrand('localhost').id, DEFAULT_BRAND_ID);
  assert.equal(resolveBrand('gazeta-preview.ondigitalocean.app').id, DEFAULT_BRAND_ID);
  assert.equal(resolveBrand(null).id, DEFAULT_BRAND_ID);
  assert.equal(resolveBrand(undefined).id, DEFAULT_BRAND_ID);
});

test('toda marca cadastrada expõe os campos que a UI depende', () => {
  for (const brand of Object.values(BRANDS)) {
    assert.ok(brand.name, `${brand.id}: name`);
    assert.ok(brand.shortName, `${brand.id}: shortName`);
    assert.ok(brand.domain, `${brand.id}: domain`);
    assert.ok(brand.regionList, `${brand.id}: regionList`);
    assert.ok(brand.regionLabel, `${brand.id}: regionLabel`);
    assert.match(brand.accentColor, /^#[0-9a-f]{6}$/i, `${brand.id}: accentColor hex válido`);
    assert.match(brand.accentTextColor, /^#[0-9a-f]{6}$/i, `${brand.id}: accentTextColor hex válido`);
    assert.ok(brand.footer.background, `${brand.id}: footer.background`);
    assert.equal(typeof brand.footer.onDark, 'boolean', `${brand.id}: footer.onDark`);
  }
});

test('cada marca tem rodapé próprio, não compartilhado', () => {
  assert.notEqual(BRANDS.gazeta.footer.background, BRANDS.aaah.footer.background);
});
