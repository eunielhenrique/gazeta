import Image from 'next/image';

/**
 * Banner publicitário do masthead — ocupa a linha (flex:1) até `height`,
 * sempre com object-fit:contain: nunca corta nem distorce a proporção
 * real da imagem, sobre qual formato de caixa o flex acabar dando.
 */
export default function AdBanner({ height }: { height: number }) {
  return (
    <a
      href="https://santanadeparnaiba.sp.gov.br"
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: 'block', flex: 1, minWidth: 0, height, overflow: 'hidden', borderRadius: 'var(--r-sm)' }}
    >
      <Image
        src="/assets/banners/educando-no-parque.jpg"
        alt="Prefeitura de Santana de Parnaíba — Educando no Parque, mais de 3 mil alunos atendidos"
        width={2427}
        height={303}
        style={{ height: '100%', width: '100%', objectFit: 'contain', objectPosition: 'left center' }}
        priority
      />
    </a>
  );
}
