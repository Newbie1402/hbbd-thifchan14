import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import type { MemoryPhoto } from '@/types/memories';
import { isPuzzleSolved, shufflePositions, swapPositions } from '@/features/games/engine';

type Difficulty = 'easy' | 'medium';
type Status = 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'solved' | 'error';
type Props = { photos: MemoryPhoto[]; active: boolean; onSolved: (imageId: string, difficulty: Difficulty) => void; onViewMemory: (imageId: string) => void; onOpenMemories: () => void; onRefresh: () => Promise<void> };

export default function MemoryPuzzleApp({ photos, active, onSolved, onViewMemory, onOpenMemories, onRefresh }: Props) {
  const [photo, setPhoto] = useState<MemoryPhoto | null>(null);
  const [status, setStatus] = useState<Status>(photos.length ? 'ready' : 'idle');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError] = useState('');
  const dragged = useRef<number | null>(null);
  const completed = useRef(false);
  const grid = difficulty === 'easy' ? 3 : 4;
  const total = grid * grid;

  const choosePhoto = useCallback(async (excludeId?: string) => {
    const candidates = photos.filter((item) => item.id !== excludeId && item.src);
    if (!candidates.length) { setPhoto(null); setStatus('idle'); return; }
    const candidate = candidates[Math.floor(Math.random() * candidates.length)];
    setStatus('loading'); setError('');
    const image = new Image();
    image.onload = () => { setPhoto(candidate); setStatus('ready'); };
    image.onerror = async () => {
      try { await onRefresh(); } catch { /* The error state below offers an explicit retry. */ }
      setPhoto(null); setStatus('error'); setError('Ảnh chưa tải được. Hãy thử lại hoặc mở Memories.');
    };
    image.src = candidate.src;
  }, [photos, onRefresh]);

  useEffect(() => { if (!photo && photos.length && status === 'idle') void choosePhoto(); }, [photos, photo, status, choosePhoto]);
  useEffect(() => { if (status !== 'playing' || !active || document.hidden) return; const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000); return () => window.clearInterval(timer); }, [status, active]);
  useEffect(() => { const pause = () => { if (document.hidden && status === 'playing') setStatus('paused'); }; document.addEventListener('visibilitychange', pause); return () => document.removeEventListener('visibilitychange', pause); }, [status]);
  useEffect(() => { if (!active && status === 'playing') setStatus('paused'); }, [active, status]);

  const start = () => {
    if (!photo) return;
    completed.current = false; setTiles(shufflePositions(total)); setMoves(0); setSeconds(0); setSelected(null); setStatus('playing');
  };
  const exchange = (first: number, second: number) => {
    if (status !== 'playing' || first === second) return;
    const next = swapPositions(tiles, first, second);
    setTiles(next); setSelected(null); setMoves((value) => value + 1);
    if (isPuzzleSolved(next) && !completed.current) { completed.current = true; setStatus('solved'); onSolved(photo!.id, difficulty); }
  };
  const chooseTile = (index: number) => {
    if (selected === null) setSelected(index);
    else exchange(selected, index);
  };
  const retry = () => { setPhoto(null); setStatus('idle'); setError(''); void choosePhoto(); };
  const tileStyle = (value: number) => {
    const row = Math.floor(value / grid), column = value % grid;
    return { backgroundImage: `url("${photo?.src || ''}")`, backgroundSize: `${grid * 100}% ${grid * 100}%`, backgroundPosition: `${column * 100 / (grid - 1)}% ${row * 100 / (grid - 1)}%` };
  };

  return <div className="game-app puzzle-app">
    <header className="game-heading"><span className="game-kicker">MEMORY RESTORER · PUZZLE.EXE</span><h2>Piece together a memory ♡</h2><p>Đổi hai mảnh để ghép lại kỷ niệm.</p></header>
    {!photos.length ? <div className="game-empty"><p>Chưa có ảnh kỷ niệm để ghép.</p><button className="secondary-button" onClick={onOpenMemories}>Mở Memories</button></div> : <>
      <div className="puzzle-options"><label>Độ khó<select value={difficulty} disabled={status === 'playing'} onChange={(event) => setDifficulty(event.target.value as Difficulty)}><option value="easy">Easy · 3 × 3</option><option value="medium">Medium · 4 × 4</option></select></label><button className="secondary-button" disabled={photos.length < 2 || status === 'loading'} onClick={() => void choosePhoto(photo?.id)}>New photo</button></div>
      {photo && <div className="puzzle-content"><div className={`puzzle-board ${status === 'solved' ? 'solved' : ''}`} role="group" aria-label={`${grid} by ${grid} memory puzzle`}>
        {(tiles.length ? tiles : Array.from({ length: total }, (_, index) => index)).map((value, index) => <button key={`${index}-${value}`} className={`puzzle-tile ${selected === index ? 'selected' : ''}`} aria-label={`Piece ${index + 1}${selected === index ? ', selected' : ''}`} aria-pressed={selected === index} style={tileStyle(value)} disabled={status !== 'playing'} onClick={() => chooseTile(index)} draggable={status === 'playing'} onDragStart={() => { dragged.current = index; }} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (dragged.current !== null) exchange(dragged.current, index); dragged.current = null; }} />)}
      </div><figure className="puzzle-preview"><img src={photo.src} alt={photo.alt} /><figcaption>{photo.caption || photo.alt}</figcaption></figure></div>}
      <div className="puzzle-status" role="status" aria-live="polite">{status === 'loading' ? 'Loading a memory…' : status === 'error' ? error : status === 'solved' ? `Memory restored in ${moves} moves · ${seconds}s ✨` : status === 'playing' ? `Moves ${moves} · ${seconds}s · ${selected === null ? 'Chọn mảnh đầu tiên' : 'Chọn mảnh thứ hai để đổi chỗ'}` : status === 'paused' ? 'Paused · tiến độ được giữ nguyên.' : 'Chọn độ khó rồi bắt đầu khi sẵn sàng.'}</div>
      <div className="game-actions">{status === 'playing' ? <button className="secondary-button" onClick={start}>Shuffle again</button> : status === 'solved' ? <button className="secondary-button" onClick={() => photo && onViewMemory(photo.id)}>View in Memories</button> : <button className="primary-button" disabled={!photo || status === 'loading'} onClick={start}>Start puzzle</button>}{status === 'solved' ? <button className="primary-button" onClick={start}>Play again</button> : status === 'error' ? <button className="primary-button" onClick={retry}>Try again</button> : status === 'playing' ? <button className="primary-button" onClick={() => setStatus('paused')}>Pause</button> : status === 'paused' ? <button className="primary-button" onClick={() => setStatus('playing')}>Resume</button> : status === 'ready' ? <button className="secondary-button" disabled={!photo} onClick={start}>Restart</button> : null}</div>
      {status === 'solved' && <motion.div className="puzzle-sparkle" initial={{ scale: 0 }} animate={{ scale: 1 }} aria-hidden="true">✦</motion.div>}
    </>}
  </div>;
}
