import React from 'react';

type Props = {
  children?: React.ReactNode;
  id?: string;
};

export default function Animationfill({ children, id = 'box-2' }: Props) {
  return (
    <section
      id={id}
      style={{
        width: '45vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
        background: 'linear-gradient(180deg, #ffffff, #eef2ff)',
        overflow: 'hidden',
        padding: 24,
      }}
    >
      <div style={{ textAlign: 'center', width: '100%' }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Caja 2</h2>
        <div style={{ marginTop: 12 }}>{children ?? null}</div>
      </div>
    </section>
  );
}
