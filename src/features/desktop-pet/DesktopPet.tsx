import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';

type PetState = 'idle' | 'walk' | 'sleep' | 'happy' | 'curious' | 'dragging';
type Props = { enabled: boolean; reduceMotion: boolean; onInteract: () => void };
const greetings = ['meow ♡', 'nya~', 'happy birthday!'];

export default function DesktopPet({ enabled, reduceMotion, onInteract }: Props) {
  const host = useRef<HTMLElement | null>(null);
  const pointer = useRef<{ x: number; y: number; left: number; top: number; dragged: boolean } | null>(null);
  const justDragged = useRef(false);
  const timeouts = useRef<number[]>([]);
  const [position, setPosition] = useState({ left: Math.max(14, window.innerWidth - 240), top: Math.max(100, window.innerHeight - 190) });
  const [state, setState] = useState<PetState>('idle');
  const [greeting, setGreeting] = useState('');
  const [look, setLook] = useState(0);

  const clamp = (left: number, top: number) => {
    const bounds = host.current?.getBoundingClientRect();
    return { left: Math.max(8, Math.min((bounds?.width || innerWidth) - 112, left)), top: Math.max(76, Math.min((bounds?.height || innerHeight) - 160, top)) };
  };

  useEffect(() => {
    let timer = 0;
    let stopped = false;
    const wander = () => {
      if (stopped) return;
      const next: PetState = Math.random() < .12 ? 'sleep' : 'walk';
      setState(next);
      if (next === 'walk') setPosition((value) => clamp(value.left + (Math.random() > .5 ? 54 : -54), value.top + (Math.random() > .5 ? 16 : -12)));
      timer = window.setTimeout(() => { setState('idle'); timer = window.setTimeout(wander, 6500 + Math.random() * 5000); }, next === 'sleep' ? 2600 : 1400);
    };
    const onVisibility = () => {
      window.clearTimeout(timer);
      if (document.hidden) setState('idle');
      else if (enabled && !reduceMotion) timer = window.setTimeout(wander, 7000);
    };
    if (enabled && !reduceMotion && !document.hidden) timer = window.setTimeout(wander, 7000);
    document.addEventListener('visibilitychange', onVisibility);
    return () => { stopped = true; window.clearTimeout(timer); document.removeEventListener('visibilitychange', onVisibility); };
  }, [enabled, reduceMotion]);

  useEffect(() => {
    const onResize = () => setPosition((value) => clamp(value.left, value.top));
    window.addEventListener('resize', onResize); return () => window.removeEventListener('resize', onResize);
  }, []);
  useEffect(() => () => timeouts.current.forEach(window.clearTimeout), []);

  const onDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointer.current = { x: event.clientX, y: event.clientY, left: position.left, top: position.top, dragged: false };
  };
  const onMove = (event: PointerEvent<HTMLButtonElement>) => {
    const current = pointer.current;
    if (!current) return;
    const dx = event.clientX - current.x, dy = event.clientY - current.y;
    if (Math.abs(dx) + Math.abs(dy) < 8 && !current.dragged) return;
    current.dragged = true; setState('dragging');
    const bounds = host.current?.getBoundingClientRect();
    setPosition(clamp(current.left + dx, current.top + dy - (bounds?.top || 0)));
  };
  const onUp = () => { justDragged.current = Boolean(pointer.current?.dragged); if (justDragged.current) setState('idle'); pointer.current = null; };
  const click = () => {
    if (justDragged.current) { justDragged.current = false; return; }
    setState('happy'); setGreeting(greetings[Math.floor(Math.random() * greetings.length)]); onInteract();
    timeouts.current.push(window.setTimeout(() => { setState((value) => value === 'happy' ? 'idle' : value); setGreeting(''); }, 1600));
  };
  const focusPet = () => { setState('curious'); setLook(Math.random() > .5 ? 1 : -1); timeouts.current.push(window.setTimeout(() => setState((value) => value === 'curious' ? 'idle' : value), 1200)); };

  if (!enabled) return null;
  return <div ref={(node) => { host.current = node?.closest('.desktop') || null; }} className={`desktop-pet pet-${state} ${reduceMotion ? 'pet-still' : ''}`} style={{ left: position.left, top: position.top }}>
    <button className="pet-button" aria-label="Tap the birthday cat" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onClick={click} onMouseEnter={focusPet} style={{ ['--pet-look' as string]: look }}>
      <svg viewBox="0 0 112 90" role="img" aria-label="A white cat wearing pink headphones"><ellipse cx="55" cy="82" rx="41" ry="5" fill="#446f7a" opacity=".15"/><path className="pet-tail" d="M84 67c28 0 23-28 8-27-8 1-9 10-3 12" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round"/><path d="M25 35 29 10l22 16M58 26l24-17 2 30" fill="#fff" stroke="#dceff0" strokeWidth="2"/><path d="M32 24 33 15l11 10M67 25l11-9 1 14" fill="#ffb3d2"/><ellipse cx="55" cy="54" rx="34" ry="29" fill="#fff" stroke="#d9eded" strokeWidth="2"/><path d="M29 42c0-20 12-28 27-28s28 11 28 30" fill="none" stroke="#f080b0" strokeWidth="8" strokeLinecap="round"/><rect x="20" y="39" width="13" height="27" rx="7" fill="#b8f2f3" stroke="#f080b0" strokeWidth="3"/><rect x="78" y="39" width="13" height="27" rx="7" fill="#b8f2f3" stroke="#f080b0" strokeWidth="3"/><ellipse cx="45" cy="52" rx="2.5" ry={state === 'sleep' ? 1 : 4} fill="#54737a"/><ellipse cx="66" cy="52" rx="2.5" ry={state === 'sleep' ? 1 : 4} fill="#54737a"/><path d="M53 60q3 4 6 0M47 62l-8 1m28 0 8 1" fill="none" stroke="#8b6877" strokeWidth="1.6" strokeLinecap="round"/><circle cx="39" cy="60" r="5" fill="#ffbad6" opacity=".65"/><circle cx="72" cy="60" r="5" fill="#ffbad6" opacity=".65"/></svg>
      {state === 'sleep' && <span className="pet-zzz" aria-hidden="true">Zzz</span>}{greeting && <span className="pet-greeting" role="status">{greeting}</span>}
    </button>
  </div>;
}
