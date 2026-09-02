import Image from 'next/image';

/** Banner publicitário — dimensionado pelo contêiner que o embala (ver Header). */
export default function AdBanner({ height }: { height: number }) {
  return (
    <a
      href="https://santanadeparnaiba.sp.gov.br"
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: 'block', height, flex: 1, minWidth: 0, overflow: 'hidden', borderRadius: 'var(--r-sm)' }}
    >
      <Image
        src="/assets/banners/educando-no-parque.jpg"
        alt="Prefeitura de Santana de Parnaíba — Educando no Parque, mais de 3 mil alunos atendidos"
        width={2427}
        height={303}
        style={{ height: '100%', width: '100%', objectFit: 'cover', objectPosition: 'center' }}
        priority
      />
    </a>
  );
}
