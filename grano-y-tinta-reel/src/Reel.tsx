import React from 'react';
import {
  AbsoluteFill, Sequence, OffthreadVideo, Img, Freeze, staticFile, Audio,
  useCurrentFrame, useVideoConfig, spring, interpolate, Easing,
} from 'remotion';
import '@fontsource/lilita-one/400.css';
import '@fontsource/kaushan-script/400.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';

const BLUE = '#3F4FF0';
const DEEP = '#1B1FA8';
const CREAM = '#F3E3C9';
const ORANGE = '#F5A623';
const HANDLE = '@granoytintamx';

// Duración (frames) de cada clip real, ya recortado a 30 fps
const CLIPS = [
  {id: 'a', dur: 75},
  {id: 'b', dur: 109},
  {id: 'c', dur: 88},
  {id: 'd', dur: 121},
  {id: 'e', dur: 92},
  {id: 'f', dur: 109, hold: 30},
];
const PHONE_START = 60;
const starts: number[] = [];
{
  let t = 66;
  CLIPS.forEach((c) => { starts.push(t); t += c.dur + (c.hold ?? 0); });
}
const PHONE_END = starts[5] + CLIPS[5].dur + 30; // 690
const OUTRO = PHONE_END;
export const TOTAL = OUTRO + 90;

const LABELS = [
  {n: null, t: 'Entra al menú', s: 'de Grano & Tinta'},
  {n: '1', t: 'Elige tu bebida', s: ''},
  {n: '2', t: 'Revisa tu pedido', s: ''},
  {n: '3', t: 'Pon tus datos', s: ''},
  {n: '4', t: 'Recoge o pide a domicilio', s: ''},
  {n: '5', t: 'Envía tu pedido por WhatsApp', s: ''},
];

const titleStyle = (size: number): React.CSSProperties => ({
  fontFamily: "'Lilita One', sans-serif",
  fontSize: size,
  lineHeight: 1,
  color: '#fff',
  WebkitTextStroke: `${Math.round(size * 0.09)}px ${BLUE}`,
  paintOrder: 'stroke fill',
  textShadow: `${Math.round(size * 0.04)}px ${Math.round(size * 0.07)}px 0 ${DEEP}`,
  textAlign: 'center',
  letterSpacing: 1,
});

/* ---------- Doodles dibujados a mano (trazo blanco) ---------- */
const Star: React.FC<{x: number; y: number; s: number; ph: number}> = ({x, y, s, ph}) => {
  const f = useCurrentFrame();
  const sc = s * (1 + 0.15 * Math.sin(f / 9 + ph));
  return (
    <svg style={{position: 'absolute', left: x, top: y, overflow: 'visible'}} width={1} height={1}>
      <g transform={`translate(0,0) scale(${sc}) rotate(${Math.sin(f / 20 + ph) * 8})`}>
        <path d="M0,-30 L6,-6 L30,0 L6,6 L0,30 L-6,6 L-30,0 L-6,-6Z" fill="none" stroke="#fff" strokeWidth={4} strokeLinejoin="round" />
      </g>
    </svg>
  );
};
const Bubble: React.FC<{x: number; y: number; r: number; ph: number}> = ({x, y, r, ph}) => {
  const f = useCurrentFrame();
  const dy = Math.sin(f / 18 + ph) * 14;
  return (
    <svg style={{position: 'absolute', left: x - r, top: y - r + dy, overflow: 'visible'}} width={r * 2} height={r * 2}>
      <circle cx={r} cy={r} r={r - 3} fill="rgba(255,255,255,.12)" stroke="#fff" strokeWidth={4} />
      <path d={`M${r * 0.55},${r * 0.9} A${r * 0.5},${r * 0.5} 0 0 1 ${r * 0.9},${r * 0.55}`} fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" />
    </svg>
  );
};
const Cloud: React.FC<{x: number; y: number; s: number; ph: number; flip?: boolean}> = ({x, y, s, ph, flip}) => {
  const f = useCurrentFrame();
  const dx = Math.sin(f / 25 + ph) * 18;
  return (
    <svg style={{position: 'absolute', left: x + dx, top: y, overflow: 'visible', transform: `scale(${flip ? -s : s}, ${s})`}} width={1} height={1}>
      <path d="M0,40 C-25,40 -25,10 0,12 C2,-20 45,-22 52,6 C80,0 84,40 56,40 Z M-20,40 L90,40 C110,40 120,48 130,48" fill="none" stroke="#fff" strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const Doodles: React.FC = () => (
  <AbsoluteFill>
    <Cloud x={20} y={470} s={1.2} ph={0} />
    <Cloud x={1010} y={900} s={1.1} ph={2} flip />
    <Cloud x={30} y={1340} s={1} ph={4} />
    <Star x={100} y={760} s={1} ph={0} />
    <Star x={985} y={560} s={1.1} ph={1} />
    <Star x={130} y={1130} s={0.7} ph={2} />
    <Star x={960} y={1480} s={0.9} ph={3} />
    <Bubble x={92} y={980} r={34} ph={0} />
    <Bubble x={150} y={1060} r={20} ph={1} />
    <Bubble x={990} y={1200} r={30} ph={2} />
    <Bubble x={945} y={1290} r={16} ph={3} />
  </AbsoluteFill>
);

/* ---------- Insignia (logo real recortado del vasito) ---------- */
const Badge: React.FC<{size: number}> = ({size}) => (
  <div style={{
    width: size, height: size, borderRadius: '50%', overflow: 'hidden', background: CREAM,
    border: `${Math.round(size * 0.035)}px solid #fff`, boxShadow: `0 ${size * 0.05}px 0 ${DEEP}`,
  }}>
    <Img src={staticFile('img/logo.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.08)'}} />
  </div>
);

/* ---------- Etiquetas de paso ---------- */
const Label: React.FC<{n: string | null; t: string; s: string; dur: number}> = ({n, t, s, dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: f, fps, config: {damping: 11, stiffness: 140}});
  const out = interpolate(f, [dur - 7, dur - 1], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const long = t.length > 18;
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, top: 120, height: 230, display: 'flex', alignItems: 'center',
      justifyContent: 'center', gap: 28, opacity: out, transform: `translateY(${(1 - p) * -70}px) scale(${0.6 + 0.4 * p})`,
    }}>
      {n && (
        <div style={{
          width: 150, height: 150, borderRadius: '50%', background: '#fff', border: `8px solid ${DEEP}`, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 0 ${DEEP}`,
        }}>
          <span style={{fontFamily: "'Lilita One'", fontSize: 110, color: BLUE, lineHeight: 1}}>{n}</span>
        </div>
      )}
      <div style={{maxWidth: n ? 700 : 900}}>
        <div style={titleStyle(long ? 78 : 96)}>{t}</div>
        {s && <div style={{fontFamily: "'Kaushan Script'", fontSize: 64, color: '#fff', textAlign: 'center', marginTop: 8}}>{s}</div>}
      </div>
    </div>
  );
};

/* ---------- Anillo de resalte (coordenadas nativas de la pantalla 590x1144) ---------- */
const Ring: React.FC<{from: number; to: number; x: number; y: number; w: number; h: number}> = ({from, to, x, y, w, h}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f < from || f > to) return null;
  const p = spring({frame: f - from, fps, config: {damping: 12, stiffness: 160}});
  const pulse = 1 + 0.025 * Math.sin((f - from) / 4);
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 28,
      border: `7px solid ${ORANGE}`, boxShadow: `0 0 0 4px #fff, 0 0 30px ${ORANGE}`,
      opacity: p, transform: `scale(${(0.85 + 0.15 * p) * pulse})`, pointerEvents: 'none',
    }} />
  );
};

/* ---------- Celular con la grabación real ---------- */
const SCREEN_W = 680;
const SC = SCREEN_W / 590;
const SCREEN_H = 1144 * SC;

const Phone: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame: f - PHONE_START, fps, config: {damping: 14, stiffness: 90}});
  const exit = interpolate(f, [PHONE_END - 22, PHONE_END + 6], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic),
  });
  const ty = (1 - enter) * 1900 + exit * 2000;
  const rot = (1 - enter) * 6;
  const fB = starts[1], fC = starts[2], fF = starts[5];
  return (
    <div style={{
      position: 'absolute', left: (1080 - SCREEN_W - 36) / 2, top: 400, width: SCREEN_W + 36, height: SCREEN_H + 36,
      borderRadius: 74, background: '#0D0F33', padding: 18, boxShadow: `0 18px 0 ${DEEP}, 0 40px 70px rgba(0,0,40,.45)`,
      transform: `translateY(${ty}px) rotate(${rot}deg)`,
    }}>
      <div style={{width: SCREEN_W, height: SCREEN_H, borderRadius: 58, overflow: 'hidden', position: 'relative', background: '#fff'}}>
        <div style={{width: 590, height: 1144, transform: `scale(${SC})`, transformOrigin: 'top left', position: 'absolute', left: 0, top: 0}}>
          {CLIPS.map((c, i) => (
            <Sequence key={c.id} from={starts[i]} durationInFrames={c.dur + (c.hold ?? 0)}>
              {c.hold ? (
                <>
                  <Sequence durationInFrames={c.dur - 1}>
                    <OffthreadVideo src={staticFile(`clips/${c.id}.mp4`)} muted style={{width: 590, height: 1144}} />
                  </Sequence>
                  <Sequence from={c.dur - 1}>
                    <Freeze frame={c.dur - 2}>
                      <OffthreadVideo src={staticFile(`clips/${c.id}.mp4`)} muted style={{width: 590, height: 1144}} />
                    </Freeze>
                  </Sequence>
                </>
              ) : (
                <OffthreadVideo src={staticFile(`clips/${c.id}.mp4`)} muted style={{width: 590, height: 1144}} />
              )}
            </Sequence>
          ))}
          <Ring from={fB + 12} to={fB + CLIPS[1].dur} x={8} y={1028} w={574} h={106} />
          <Ring from={fC + 14} to={fC + CLIPS[2].dur} x={34} y={898} w={522} h={74} />
          <Ring from={fF + 88} to={fF + CLIPS[5].dur + 30} x={14} y={934} w={562} h={104} />
        </div>
      </div>
    </div>
  );
};

/* ---------- Escena 1: gancho ---------- */
const Card: React.FC<{src: string; w: number; rot: number; delay: number; x: number; y: number}> = ({src, w, rot, delay, x, y}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: f - delay, fps, config: {damping: 12, stiffness: 120}});
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: w, height: w * 1.25, borderRadius: 26, overflow: 'hidden',
      border: '10px solid #fff', boxShadow: `0 14px 0 ${DEEP}, 0 30px 50px rgba(0,0,40,.35)`,
      transform: `rotate(${rot * p}deg) scale(${p}) translateY(${(1 - p) * 300}px)`, background: '#fff',
    }}>
      <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </div>
  );
};

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const word = (txt: string, d: number) => {
    const p = spring({frame: f - d, fps, config: {damping: 8, stiffness: 150}});
    return <div style={{...titleStyle(124), transform: `scale(${p}) rotate(${(1 - p) * -8}deg)`}}>{txt}</div>;
  };
  const out = interpolate(f, [52, 70], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
  const bp = spring({frame: f - 22, fps, config: {damping: 9}});
  return (
    <AbsoluteFill style={{transform: `translateY(${-out * 2100}px)`}}>
      <div style={{position: 'absolute', top: 120, left: 0, right: 0}}>
        {word('¿SE TE ANTOJÓ', 0)}
        <div style={{height: 14}} />
        {word('UN PALMAR?', 6)}
      </div>
      <Card src="img/palmar.jpg" w={700} rot={-4} delay={8} x={190} y={520} />
      <div style={{position: 'absolute', right: 70, top: 1320, transform: `scale(${bp}) rotate(${(1 - bp) * 30 + Math.sin(f / 6) * 4}deg)`}}>
        <Badge size={250} />
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Cierre ---------- */
const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = spring({frame: f, fps, config: {damping: 10}});
  const bp = spring({frame: f - 28, fps, config: {damping: 8, stiffness: 120}});
  const hp = spring({frame: f - 40, fps, config: {damping: 12}});
  const W = 430;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 110, left: 0, right: 0, transform: `scale(${t})`}}>
        <div style={titleStyle(104)}>BEBIDAS DE</div>
        <div style={titleStyle(104)}>TEMPORADA</div>
      </div>
      <Card src="img/palmar.jpg" w={W} rot={-5} delay={4} x={80} y={390} />
      <Card src="img/ofrenda.jpg" w={W} rot={4} delay={10} x={570} y={410} />
      <Card src="img/rubi.jpg" w={W} rot={4} delay={16} x={90} y={960} />
      <Card src="img/catrin.jpg" w={W} rot={-4} delay={22} x={560} y={950} />
      <div style={{position: 'absolute', left: 390, top: 780, transform: `scale(${bp}) rotate(${(1 - bp) * 40}deg)`}}>
        <Badge size={300} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, transform: `translateY(${(1 - hp) * 200}px) scale(${0.7 + 0.3 * hp})`, opacity: hp}}>
        <div style={{fontFamily: "'Kaushan Script'", fontSize: 72, color: '#fff'}}>Pide desde tu celular</div>
        <div style={{background: '#fff', borderRadius: 60, padding: '18px 56px', border: `7px solid ${DEEP}`, boxShadow: `0 10px 0 ${DEEP}`}}>
          <span style={{fontFamily: 'Poppins', fontWeight: 700, fontSize: 64, color: BLUE}}>{HANDLE}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Composición ---------- */
export const Reel: React.FC = () => {
  const f = useCurrentFrame();
  const drift = Math.sin(f / 60) * 40;
  return (
    <AbsoluteFill style={{background: BLUE}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at ${50 + drift / 10}% 38%, #5B6BFF 0%, ${BLUE} 45%, ${DEEP} 100%)`}} />
      <Doodles />
      <Sequence durationInFrames={72}><Hook /></Sequence>
      <Phone />
      {CLIPS.map((c, i) => (
        <Sequence key={c.id} from={starts[i]} durationInFrames={c.dur + (c.hold ?? 0)}>
          <Label n={LABELS[i].n} t={LABELS[i].t} s={LABELS[i].s} dur={c.dur + (c.hold ?? 0)} />
        </Sequence>
      ))}
      <Sequence from={OUTRO} durationInFrames={90}><Outro /></Sequence>
      <Sequence from={6}><Audio src={staticFile('audio/v1.mp3')} /></Sequence>
      <Sequence from={69}><Audio src={staticFile('audio/v2.mp3')} /></Sequence>
      <Sequence from={144}><Audio src={staticFile('audio/v3.mp3')} /></Sequence>
      <Sequence from={253}><Audio src={staticFile('audio/v4.mp3')} /></Sequence>
      <Sequence from={343}><Audio src={staticFile('audio/v5.mp3')} /></Sequence>
      <Sequence from={462}><Audio src={staticFile('audio/v6.mp3')} /></Sequence>
      <Sequence from={556}><Audio src={staticFile('audio/v7.mp3')} /></Sequence>
      <Sequence from={702}><Audio src={staticFile('audio/v8.mp3')} /></Sequence>
    </AbsoluteFill>
  );
};
