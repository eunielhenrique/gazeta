import { IcoClock } from './icons';

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 'var(--r-full)',
        flexShrink: 0,
        background: 'var(--ink)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.4,
        fontWeight: 600,
        letterSpacing: 0,
      }}
    >
      {initials}
    </div>
  );
}

export type BadgeEditoria = { nome: string; cor: string; texto_sobre_cor: string };

export function CatBadge({ editoria }: { editoria: BadgeEditoria }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        alignSelf: 'flex-start',
        padding: '5px 9px',
        fontSize: 12.8,
        fontWeight: 600,
        lineHeight: 1,
        borderRadius: 'var(--r-sm)',
        color: editoria.texto_sobre_cor,
        background: editoria.cor,
        flexShrink: 0,
      }}
    >
      {editoria.nome}
    </span>
  );
}

export function ReadTime({ min, muted }: { min: number; muted?: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 14,
        color: muted ? 'rgba(255,255,255,.72)' : 'var(--mute)',
      }}
    >
      <IcoClock />
      {min} min de leitura
    </span>
  );
}

export function Eyebrow({ children, color = 'var(--body-mid)' }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      style={{
        display: 'block',
        fontSize: 15,
        fontWeight: 500,
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        color,
        marginBottom: 14,
      }}
    >
      {children}
    </span>
  );
}
