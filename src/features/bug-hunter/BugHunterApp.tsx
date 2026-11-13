import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { bugHuntWon } from '@/features/games/engine';

type Phase = 'ready' | 'playing' | 'paused' | 'won' | 'lost';
type Props = { active: boolean; reduceMotion: boolean; onWin: (durationMs: number) => void };
const bugs = ['🐛', '💻', '👾', '🐞', '✨', '🪲', '🦠', '⌁'];

export default function BugHunterApp({ active, reduceMotion, onWin }: Props) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [caught, setCaught] = useState<number[]>([]);
  const [remainingMs, setRemainingMs] = useState(20_000);
  const deadline = useRef(0);
  const remaining = useRef(20_000);
  const pausedByWindow = useRef(false);

  useEffect(() => {
    if (!active && phase === 'playing') {
      remaining.current = Math.max(0, deadline.current - performance.now()); setRemainingMs(remaining.current); pausedByWindow.current = true; setPhase('paused');
    } else if (active && phase === 'paused' && pausedByWindow.current) {
      deadline.current = performance.now() + remaining.current; pausedByWindow.current = false; setPhase('playing');
    }
  }, [active, phase]);

  useEffect(() => {
    if (phase !== 'playing' || !active || document.hidden) return;
    const timer = window.setInterval(() => {
      const left = Math.max(0, deadline.current - performance.now());
      remaining.current = left; setRemainingMs(left);
      if (!left) setPhase('lost');
    }, 100);
    return () => window.clearInterval(timer);
  }, [phase, active]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && phase === 'playing') {
        remaining.current = Math.max(0, deadline.current - performance.now()); setRemainingMs(remaining.current); pausedByWindow.current = true; setPhase('paused');
      } else if (!document.hidden && phase === 'paused' && pausedByWindow.current) {
        deadline.current = performance.now() + remaining.current; pausedByWindow.current = false; setPhase('playing');
      }
    };
    document.addEventListener('visibilitychange', onVisibility); return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [phase]);

  const start = () => { remaining.current = 20_000; setRemainingMs(20_000); setCaught([]); deadline.current = performance.now() + 20_000; pausedByWindow.current = false; setPhase('playing'); };
  const catchBug = (id: number) => {
    if (phase !== 'playing' || performance.now() >= deadline.current || caught.includes(id)) return;
    const next = [...caught, id]; setCaught(next);
    if (next.length === 8 && bugHuntWon(8, 20_000 - Math.max(0, deadline.current - performance.now()))) {
      const duration = Math.min(19_999, Math.max(0, 20_000 - Math.max(0, deadline.current - performance.now())));
      setPhase('won'); onWin(duration);
      if (!reduceMotion) confetti({ particleCount: 38, spread: 60, startVelocity: 24, colors: ['#CCFFFF', '#66FFFF', '#FFCCCC', '#fff'] });
    }
  };

  return <div className="game-app bug-hunter-app">
    <header className="game-heading"><span className="game-kicker">DEBUG CONSOLE · 8 OBJECTS FOUND</span><h2>WARNING: 8 happiness bugs detected! 🐛</h2><p>Bắt đủ bug trong arena trong vòng 20 giây.</p></header>
    {phase === 'ready' ? <div className="bug-intro"><p>Chạm hoặc bấm vào từng bug. Có thể dùng Tab rồi Enter để bắt.</p><button className="primary-button" onClick={start}>Start debugging</button></div> : <>
      <div className="bug-score"><b>{caught.length}/8 caught</b><span className={remainingMs < 5000 ? 'time-warning' : ''}>{Math.ceil(remainingMs / 1000)}s</span></div>
      <div className={`bug-arena ${reduceMotion ? 'still' : ''}`} role="group" aria-label="Bug Hunter arena">
        {bugs.map((bug, id) => caught.includes(id) ? null : <button key={id} className={`pixel-bug bug-${id}`} style={{ animationPlayState: phase === 'playing' && !reduceMotion ? 'running' : 'paused' }} aria-label={`Catch bug ${id + 1}`} onClick={() => catchBug(id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); catchBug(id); } }} disabled={phase !== 'playing'}>{bug}</button>)}
        {caught.map((id) => <span className={`caught-heart caught-${id}`} key={id} aria-hidden="true">♡</span>)}
      </div>
      <p className="bug-feedback" role="status" aria-live="polite">{phase === 'won' ? 'No Bugs, Just Wishes ♡ · Happiness deployed successfully ✨' : phase === 'lost' ? 'Some bugs escaped... but happiness is still compiling ♡' : phase === 'paused' ? 'Paused · tiến độ được giữ nguyên.' : caught.length ? 'caught! · còn lại sẽ không trốn lâu đâu ✦' : 'Ready, set, debug!'}</p>
      <div className="game-actions">{phase === 'playing' ? <button className="secondary-button" onClick={() => { remaining.current = Math.max(0, deadline.current - performance.now()); setRemainingMs(remaining.current); pausedByWindow.current = false; setPhase('paused'); }}>Pause</button> : phase === 'paused' ? <button className="secondary-button" onClick={() => { deadline.current = performance.now() + remaining.current; setPhase('playing'); }}>Resume</button> : null}{phase !== 'won' && <button className="primary-button" onClick={start}>Retry</button>}</div>
    </>}
  </div>;
}
