import { ImageResponse } from 'next/og';
export const alt = 'AlgoVerse — visual computer science learning';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        background: '#f6f8ef',
        padding: 80,
        color: '#20271a',
      }}
    >
      <div style={{ fontSize: 36, color: '#52672c' }}>AlgoVerse</div>
      <div style={{ fontSize: 86, fontWeight: 700, marginTop: 32 }}>
        Big ideas. Made visible.
      </div>
      <div style={{ fontSize: 30, marginTop: 35 }}>
        Algorithms · System design · Databases · Cloud
      </div>
      <div style={{ fontSize: 24, marginTop: 35 }}>
        See it. Try it. Understand it.
      </div>
    </div>,
    size,
  );
}
