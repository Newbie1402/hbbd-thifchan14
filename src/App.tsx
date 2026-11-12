import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useDragControls, useReducedMotion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Cake, Camera, ChevronLeft, ChevronRight, Check, Code2, Command, Gift, Heart, Home, Image as ImageIcon, Mail, Maximize2, Minus, Settings, Share2, Sparkles, Terminal, X, Star } from 'lucide-react';
import { RowsPhotoAlbum } from 'react-photo-album';
import 'react-photo-album/rows.css';
import AdminSetup from '@/AdminSetup';
import { birthday } from '@/config/birthday';
import { fetchMemories, memoriesApiConfigured } from '@/services/memories';
import type { MemoryPhoto, MemoriesSource } from '@/types/memories';
import { completeQuest, questCount, readQuest, resetQuest, type QuestId, type QuestState } from '@/quest';

const PhotoLightbox=lazy(()=>import('@/PhotoLightbox'));

type AppId = 'note' | 'gallery' | 'cake' | 'surprise' | 'settings' | 'terminal' | 'help' | 'final';
type SurpriseStage = 'idle' | 'anticipation' | 'explosion' | 'reveal' | 'afterglow' | 'completed';
type LocalPhoto = (typeof birthday.photos)[number];
const photoUrl = (photo: LocalPhoto, size = 960) => `/assets/photos/${photo.src}-${size}.webp`;
const photoSrcSet = (photo: LocalPhoto) => [480, 960, ...(photo.id === 'selfie' ? [1440] : [])].map((width) => `${photoUrl(photo, width)} ${width}w`).join(', ');
const localMemories: MemoryPhoto[] = birthday.photos.map((photo, index) => ({ id: photo.id, order: index + 1, src: photoUrl(photo), thumbnailSrc: photoUrl(photo, 480), caption: photo.caption, alt: photo.alt, objectPosition: photo.objectPosition }));
const nav: { id: AppId; label: string; icon: typeof Heart; hint: string }[] = [
  { id: 'note', label: 'Secret Note', icon: Mail, hint: 'birthday_note.md' },
  { id: 'gallery', label: 'Gallery', icon: Camera, hint: 'little_memories' },
  { id: 'cake', label: 'Birthday Cake', icon: Cake, hint: 'make_a_wish' },
  { id: 'surprise', label: 'Surprise', icon: Gift, hint: 'for_you' },
  { id: 'settings', label: 'Settings', icon: Settings, hint: 'personalize' },
  { id: 'terminal', label: 'Terminal', icon: Terminal, hint: 'replay_boot' },
];

export default function App() { return window.location.pathname === '/admin-setup-img' ? <AdminSetup/> : <BirthdayDesktop/>; }

function BirthdayDesktop() {
  const [boot, setBoot] = useState(!sessionStorage.getItem('birthday-booted'));
  const [app, setApp] = useState<AppId | null>(null);
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [spotlight, setSpotlight] = useState(false);
  const [spotlightQuery, setSpotlightQuery] = useState('');
  const [selectedPhotoId, setSelectedPhotoId] = useState<string|null>(null);
  const apiConfigured = memoriesApiConfigured();
  const [memories, setMemories] = useState<MemoryPhoto[]>(apiConfigured ? [] : localMemories);
  const [memoriesState, setMemoriesState] = useState<'loading' | 'ready' | 'error'>(apiConfigured ? 'loading' : 'ready');
  const [memoriesError, setMemoriesError] = useState('');
  const [memoriesSource, setMemoriesSource] = useState<MemoriesSource>(apiConfigured ? 'minio' : 'local');
  const photoIndex=selectedPhotoId===null?null:memories.findIndex(photo=>photo.id===selectedPhotoId);
  const selectPhotoIndex=(index:number)=>setSelectedPhotoId(memories[index]?.id||null);
  const [liked, setLiked] = useState(0);
  const [lit, setLit] = useState(true);
  const [giftOpen, setGiftOpen] = useState(false);
  const [surpriseStage, setSurpriseStage] = useState<SurpriseStage>('idle');
  const [reduceMotion, setReduceMotion] = useState(localStorage.getItem('birthday-reduced') === 'true');
  const [sparkles, setSparkles] = useState(localStorage.getItem('birthday-sparkles') !== 'false');
  const [hero, setHero] = useState((localStorage.getItem('birthday-hero') as typeof birthday.heroPresentation) || birthday.heroPresentation);
  const [sound, setSound] = useState(localStorage.getItem('birthday-sound') === 'true');
  const [helpTip, setHelpTip] = useState(false);
  const [copied, setCopied] = useState(false);
  const [noteEnvelopeOpened, setNoteEnvelopeOpened] = useState(false);
  const [quest, setQuest] = useState<QuestState>(() => readQuest(localStorage));
  const [toast, setToast] = useState('');
  const [shareOpen, setShareOpen] = useState(false);
  const [questOpen, setQuestOpen] = useState(false);
  const [qrData, setQrData] = useState('');
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const shouldReduce = useReducedMotion() || reduceMotion;
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const windowHostRef = useRef<HTMLDivElement>(null);
  const giftRef = useRef<HTMLDivElement>(null);
  const cakeRef = useRef<HTMLDivElement>(null);
  const surpriseTimers = useRef<number[]>([]);
  const dragControls = useDragControls();

  const refreshMemories = useCallback(async (force = false) => {
    if (!apiConfigured) { setMemories(localMemories); setMemoriesState('ready'); return; }
    setMemoriesState('loading'); setMemoriesError('');
    try { const response = await fetchMemories(force); setMemories(response.photos); setMemoriesSource('minio'); setMemoriesState('ready'); }
    catch (error) { setMemoriesError(error instanceof Error ? error.message : 'Memories are temporarily unavailable.'); setMemoriesState('error'); }
  }, [apiConfigured]);
  const finishBoot = () => { sessionStorage.setItem('birthday-booted', '1'); setBoot(false); };
  const openApp = useCallback((id: AppId) => { if (!app) previousFocus.current = document.activeElement as HTMLElement; if(id==='note')setNoteEnvelopeOpened(false);setApp(id); setMinimized(false); setMaximized(false); setSelectedPhotoId(null); }, [app]);
  const closeApp = useCallback(() => { surpriseTimers.current.forEach(window.clearTimeout);surpriseTimers.current=[];setSurpriseStage('idle');setGiftOpen(false);setApp(null); setMinimized(false); setMaximized(false); setSelectedPhotoId(null); window.setTimeout(() => previousFocus.current?.focus(), 0); }, []);
  const chime = () => { if (!sound) return; const AudioContextClass = window.AudioContext; if (!AudioContextClass) return; const context = new AudioContextClass(); const oscillator = context.createOscillator(); const gain = context.createGain(); oscillator.frequency.value = 880; gain.gain.setValueAtTime(.045, context.currentTime); gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .18); oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + .18); oscillator.onended = () => void context.close(); };
  const burst = () => { chime(); if (!shouldReduce) confetti({ particleCount: 75, spread: 62, startVelocity: 32, origin: { y: .66 }, colors: ['#CCFFFF', '#99FFFF', '#66FFFF', '#FFCCCC', '#ffffff'] }); };

  useEffect(() => { if (apiConfigured) void refreshMemories(); }, [apiConfigured, refreshMemories]);
  useEffect(() => { void fetch('/api/public/site-config').then(r=>r.ok?r.json():null).then((v:{shareUrl?:string;shareReady?:boolean}|null)=>setShareUrl(v?.shareReady?v.shareUrl||null:null)).catch(()=>setShareUrl(null)); }, []);
  useEffect(() => () => surpriseTimers.current.forEach(window.clearTimeout), []);
  useEffect(() => {
    if (!boot) return;
    if (shouldReduce) return;
    const timer = window.setTimeout(finishBoot, 3400);
    return () => window.clearTimeout(timer);
  }, [boot, shouldReduce]);
  useEffect(() => {
    if (boot) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { if (spotlight) setSpotlight(false); else if (photoIndex !== null) setSelectedPhotoId(null); else if (app) closeApp(); setHelpTip(false); }
      if (app && event.key === 'Tab' && dialogRef.current) {
        const items = dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex="0"]');
        const first = items[0], last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setSpotlight(true); setSpotlightQuery(''); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [boot, app, photoIndex, spotlight, closeApp, openApp]);
  useEffect(() => {
    if (app) { closeRef.current?.focus(); }
  }, [app]);
  useEffect(() => {
    if (!sparkles || shouldReduce) return;
    const move = (event: PointerEvent) => {
      document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`);
      document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [sparkles, shouldReduce]);

  const celebrateLike = () => { chime(); setLiked((n) => n + 1); if (!shouldReduce) confetti({ particleCount: 18, spread: 45, startVelocity: 20, origin: { y: .55 }, colors: ['#FF8DB5', '#FFCCCC', '#ffffff'] }); };
  const markQuest = (id: QuestId) => { const result=completeQuest(localStorage,id); if(!result.changed)return; setQuest(result.state);setToast(`${questCount(result.state)}/4 birthday wishes discovered ♡`);window.setTimeout(()=>setToast(''),2600);if(!shouldReduce)confetti({particleCount:18,spread:38,startVelocity:18,origin:{y:.18},colors:['#CCFFFF','#99FFFF','#FFCCCC','#ffffff']}); };
  const openSurprise = () => {
    surpriseTimers.current.forEach(window.clearTimeout);
    surpriseTimers.current = [];
    setSurpriseStage('anticipation');
    const reveal = () => {
      setSurpriseStage('explosion'); chime();
      const bounds = giftRef.current?.getBoundingClientRect();
      if (!shouldReduce) confetti({ particleCount: innerWidth<620?48:100, spread: 76, startVelocity: 36, gravity:.8, origin: bounds ? { x: (bounds.left + bounds.width / 2) / innerWidth, y: (bounds.top + bounds.height / 2) / innerHeight } : { x: .5, y: .48 }, colors: ['#CCFFFF', '#99FFFF','#66FFFF','#33FFFF', '#FFCCCC','#ffe59a', '#ffffff'] });
      surpriseTimers.current.push(window.setTimeout(() => {setSurpriseStage('reveal');setGiftOpen(true);}, shouldReduce?0:850));
      surpriseTimers.current.push(window.setTimeout(() => setSurpriseStage('afterglow'), shouldReduce?80:1900));
      surpriseTimers.current.push(window.setTimeout(() => {setSurpriseStage('completed');markQuest('open_surprise');}, shouldReduce?150:3100));
    };
    surpriseTimers.current.push(window.setTimeout(reveal, shouldReduce ? 0 : 520));
  };
  const replaySurprise = () => { surpriseTimers.current.forEach(window.clearTimeout); surpriseTimers.current = []; setGiftOpen(false); setSurpriseStage('idle'); };
  const toggleCandles = () => {
    const bounds = cakeRef.current?.getBoundingClientRect();
    if (lit) {
      chime();
      if (!shouldReduce) confetti({ particleCount: innerWidth<620?22:48, spread: 56, origin: bounds ? { x: (bounds.left + bounds.width / 2) / innerWidth, y: bounds.top / innerHeight + .4 } : { x: .5, y: .6 }, colors: ['#FFCCCC', '#CCFFFF', '#ffffff'] });
      markQuest('blow_candles');
    } else chime();
    setLit(!lit);
  };
  const copyMessage = async () => { const copied=await copyText(`${birthday.noteTitle}\n\n${birthday.noteParagraphs.map(stripMarkdown).join('\n\n')}`);setCopied(copied);if(!copied)setToast('Không thể truy cập clipboard trên trình duyệt này.');window.setTimeout(() => setCopied(false), 1600); };
  const copyShareLink = async () => { if(await copyText(shareUrl||''))setToast('Đã sao chép link chia sẻ.');else setToast('Không thể sao chép link trên trình duyệt này.'); };
  const shareBirthday = async () => { if(!shareUrl)return;try{if(navigator.share)await navigator.share({title:'Birthday OS — Thuỳ Trang',url:shareUrl});else await copyShareLink();}catch(error){if(error instanceof Error&&error.name!=='AbortError')setToast('Không thể mở bảng chia sẻ.');} };
  const showQr = async () => { if(!shareUrl)return;const QRCode=await import('qrcode');setQrData(await QRCode.toDataURL(shareUrl,{errorCorrectionLevel:'H',margin:4,width:320})); };

  if (boot) return <BootScene onSkip={finishBoot} reduced={shouldReduce} />;
  return <main className={`desktop ${shouldReduce ? 'reduced' : ''} ${sparkles ? '' : 'sparkles-off'}`}>
    <div className="wallpaper" aria-hidden="true"><span className="orb orb-a"/><span className="orb orb-b"/><span className="orb orb-c"/><div className="grid-glow"/><div className="float-code code-a">{'{ }'}</div><div className="float-code code-b">&lt;/&gt;</div><div className="float-code code-c">♡</div><div className="sparkle s1">✦</div><div className="sparkle s2">✧</div><div className="sparkle s3">✦</div></div>
    <header className="menubar">
      <button className="brand" onClick={() => { closeApp(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} aria-label="Birthday OS home"><Heart size={18} fill="currentColor"/><b>Birthday OS</b><span>v3.1</span></button>
      <nav className="top-links"><button onClick={() => { closeApp(); }}>Home</button><button onClick={() => openApp('gallery')}>Memories</button><button onClick={() => setHelpTip(!helpTip)}>Help</button></nav>
      <div className="system-status"><button className="quest-trigger" aria-label={`Birthday Quest ${questCount(quest)} trên 4`} title="Birthday Quest" aria-expanded={questOpen} onClick={()=>setQuestOpen(!questOpen)}><span className="quest-stars">{Object.values(quest).map((done,index)=><Star key={index} size={12} fill={done?'currentColor':'none'} aria-hidden="true"/>)}</span>{questCount(quest)}/4</button><button className="icon-plain share-trigger" aria-label="Chia sẻ birthday website" title="Chia sẻ" onClick={()=>setShareOpen(!shareOpen)}><Share2 size={16}/></button><span className="clock">{new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date())}</span><button className="icon-plain" aria-label="Keyboard shortcuts" onClick={() => setHelpTip(!helpTip)}><Command size={16}/></button></div>
    </header>
    {questOpen&&<div className="quest-popover" role="dialog" aria-label="Birthday Quest progress"><b>Birthday Quest · {questCount(quest)}/4</b>{([['open_memories','Mở một kỷ niệm'],['read_secret_note','Đọc lời nhắn'],['blow_candles','Thổi nến'],['open_surprise','Mở món quà']] as const).map(([id,label])=><span key={id} className={quest[id]?'quest-done':''}><Star size={14} fill={quest[id]?'currentColor':'none'}/>{label}</span>)}<small>Không có nhiệm vụ nào bắt buộc để xem nội dung.</small></div>}
    {shareOpen&&<div className="share-popover" role="dialog" aria-label="Chia sẻ birthday website"><button className="share-close" aria-label="Close sharing" onClick={()=>setShareOpen(false)}><X size={15}/></button><b>Chia sẻ món quà ♡</b>{shareUrl?<><button onClick={()=>void copyShareLink()}>Sao chép link</button><button onClick={()=>void shareBirthday()}>Chia sẻ…</button><button onClick={()=>void showQr()}>Xem QR</button>{qrData&&<img className="share-qr" src={qrData} alt="Mã QR mở Birthday OS"/>}<a download="birthday-os-qr.png" href={qrData||undefined} onClick={event=>{if(!qrData){event.preventDefault();void showQr();}}}>Tải QR PNG</a><small>Gửi link qua Zalo để tạo preview; việc hiển thị phụ thuộc Zalo.</small></>:<p>Chưa cấu hình link chia sẻ. Quản trị viên cần thêm domain HTTPS trong trang cấu hình.</p>}</div>}
    {questCount(quest)===4&&<button className="final-wish-shortcut" onClick={()=>openApp('final')}><Sparkles size={16}/> final_wish.md</button>}
    {toast&&<div className="birthday-toast" role="status">{toast}</div>}
    {helpTip && <div className="help-tip"><b>Quick guide</b><span>Open Secret Note for your message, visit Gallery for photos, then make a wish at the cake.</span><small>Shortcut: ⌘ / Ctrl + K opens Terminal</small><button onClick={() => setHelpTip(false)} aria-label="Close help"><X size={14}/></button></div>}
    <aside className="dock" aria-label="Birthday apps">
      <button className="dock-home" onClick={() => closeApp()} aria-label="Home"><Home size={22}/></button>
      {nav.map(({ id, label, icon: Icon }) => <button key={id} className={`dock-item ${app === id ? 'active' : ''}`} onClick={() => app === id && minimized ? setMinimized(false) : openApp(id)} title={label} aria-label={label}><span className="dock-icon"><Icon size={20}/></span><span>{label}</span></button>)}
      <div className="dock-divider"/><button className="dock-heart" onClick={celebrateLike} aria-label="Send a heart"><Heart size={22} fill={liked ? 'currentColor' : 'none'}/><i>{liked || ''}</i></button>
    </aside>
    <section className="home-content">
      <motion.div className="hero-copy" initial={shouldReduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: .12 }}>
        <span className="handle-pill"><span className="online-dot"/>@{birthday.recipientHandle}<span className="pill-divider"/>birthday build <Sparkles size={13}/></span>
        <h1><span>Happy Birthday,</span><strong>{birthday.recipientName}<em>♡</em></strong></h1>
        <p className="hero-sub">A little corner of the internet, made just for you.</p>
        <div className="build-chip"><Code2 size={15}/> another year of wonderful you <span>✦</span></div>
        <div className="hero-actions"><button className="primary-button" onClick={() => openApp('note')}><Mail size={17}/> Open Secret_Note.md <Heart size={15}/></button><button className="secondary-button" onClick={() => openApp('gallery')}><ImageIcon size={17}/> Explore memories</button></div>
      </motion.div>
      <motion.div className={`hero-art ${hero === 'photo' ? 'photo-mode' : ''}`} initial={shouldReduce ? false : { opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .8, delay: .3 }}>
        {hero !== 'photo' && <img className="illustration" src="/assets/illustrations/hero-desk-illustration-1122.webp" alt="Pastel illustration of a developer, laptop, cat and matcha"/>}
        {hero === 'photo' && <img className="hero-photo" src={photoUrl(birthday.photos[2])} srcSet={photoSrcSet(birthday.photos[2])} sizes="30vw" alt={birthday.photos[2].alt}/>}
        <span className="art-note"><Code2 size={14}/> made with ♡</span>
      </motion.div>
      <motion.div className="polaroid-cluster" initial={shouldReduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65, delay: .48 }}>
        {(memoriesSource==='minio'?[3,4,5].map(order=>memories.find(photo=>photo.filenameIndex===order)).filter((photo):photo is MemoryPhoto=>Boolean(photo)):memories.slice(2,5)).map((photo, index) => <button key={photo.id} className={`polaroid polaroid-${index + 1}`} onClick={() => { openApp('gallery'); setSelectedPhotoId(photo.id); }} aria-label={`Open ${photo.caption}`}><span className="tape"/><img src={photo.thumbnailSrc || photo.src} srcSet={memoriesSource === 'local' ? photoSrcSet(birthday.photos[photo.order - 1]) : undefined} sizes="(max-width: 620px) 28vw, 14vw" alt={photo.alt} style={{ objectPosition: photo.objectPosition }}/><span className="polaroid-caption">{photo.caption} <i>♡</i></span></button>)}
      </motion.div>
      <div className="ambient-label label-left"><span/> STATUS: READY</div><div className="ambient-label label-right"><span>✦</span> a soft place to celebrate</div>
    </section>
    <footer className="desktop-footer"><span>crafted for {birthday.recipientHandle}</span><span>no bugs, only birthday wishes <Heart size={12} fill="currentColor"/></span></footer>

    <AnimatePresence>{spotlight && <motion.div className="spotlight-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setSpotlight(false); }}><motion.section className="spotlight-panel" role="dialog" aria-modal="true" aria-label="Spotlight app search" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}><div className="spotlight-search"><Command size={18}/><input autoFocus aria-label="Search birthday apps" placeholder="Search apps…" value={spotlightQuery} onChange={(event) => setSpotlightQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Escape') setSpotlight(false); if (event.key === 'Enter') { const match = nav.find(({ label, hint }) => `${label} ${hint}`.toLowerCase().includes(spotlightQuery.toLowerCase())); if (match) { setSpotlight(false); openApp(match.id); } } }}/><kbd>ESC</kbd></div><div className="spotlight-results">{nav.filter(({ label, hint }) => `${label} ${hint}`.toLowerCase().includes(spotlightQuery.toLowerCase())).map(({ id, label, icon: Icon, hint }) => <button key={id} onClick={() => { setSpotlight(false); openApp(id); }}><Icon size={18}/><span>{label}<small>{hint}</small></span><ChevronRight size={15}/></button>)}</div><small className="spotlight-hint">Select an app · press Enter to open</small></motion.section></motion.div>}</AnimatePresence>

    <AnimatePresence>
      {app && !minimized && <motion.div ref={windowHostRef} className="window-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) closeApp(); }}>
        <motion.section ref={dialogRef} className={`app-window app-${app} ${maximized ? 'maximized' : ''}`} drag={!maximized} dragListener={false} dragControls={dragControls} dragConstraints={windowHostRef} dragMomentum={false} role="dialog" aria-modal="true" aria-labelledby="window-title" initial={shouldReduce ? false : { opacity: 0, scale: .96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .98, y: 8 }} transition={{ type: 'spring', stiffness: 280, damping: 27 }}>
          <header className="window-header" onPointerDown={(event) => { if (window.innerWidth > 620 && !maximized && !(event.target as HTMLElement).closest('button')) dragControls.start(event); }}><div className="window-dots"><i/><i/><i/></div><span className="window-title" id="window-title">{windowTitle(app)}</span><div className="window-controls"><button ref={closeRef} className="window-control" onClick={() => setMinimized(true)} aria-label="Minimize window"><Minus size={15}/></button><button className="window-control" onClick={() => setMaximized(!maximized)} aria-label={maximized ? 'Restore window' : 'Maximize window'}><Maximize2 size={14}/></button><button className="window-close" onClick={closeApp} aria-label="Close window"><X size={17}/></button></div></header>
          {app === 'note' && (noteEnvelopeOpened ? <div className="note-body" onScroll={event=>{const node=event.currentTarget;if(node.scrollTop>24&&node.scrollTop+node.clientHeight>=node.scrollHeight-24)markQuest('read_secret_note');}}><div className="private-tag"><Mail size={14}/> PRIVATE MESSAGE <span>for {birthday.recipientHandle}</span></div><h2>{birthday.noteTitle}</h2><div className="note-rule"/>{birthday.noteParagraphs.map((paragraph, index) => <p key={index}>{renderNote(paragraph)}</p>)}<div className="note-actions"><button className="pill-action pink" onClick={celebrateLike}><Heart size={16} fill="currentColor"/> Thả tim <span>{liked || ''}</span></button><button className="pill-action cyan" onClick={() => setApp('cake')}><Cake size={16}/> Thổi nến</button><button className="pill-action" onClick={() => setApp('gallery')}><Camera size={16}/> Kỷ niệm</button><button className="pill-action" onClick={()=>markQuest('read_secret_note')}><Check size={15}/> Đã đọc</button><button className="pill-action copy-action" onClick={()=>void copyMessage()}>{copied ? 'Đã chép!' : 'Chép lời chúc'}</button></div></div> : <div className="letter-intro"><div className="letter-envelope" aria-hidden="true"><div className="letter-paper"><Mail size={30}/></div><div className="letter-flap"/><Heart className="letter-heart" size={24} fill="currentColor"/></div><h2>Một lá thư dành riêng cho Trang</h2><p>Em có một lời nhắn nhỏ đang chờ bên trong ♡</p><button className="primary-button" onClick={()=>{if(shouldReduce)setNoteEnvelopeOpened(true);else window.setTimeout(()=>setNoteEnvelopeOpened(true),760);document.querySelector('.letter-envelope')?.classList.add('opening');}}>Mở thư</button></div>)}
          {app === 'gallery' && <Gallery photos={memories} source={memoriesSource} state={memoriesState} error={memoriesError} onRefresh={() => void refreshMemories(true)} selected={photoIndex ?? 0} setSelected={selectPhotoIndex} onViewed={()=>markQuest('open_memories')}/>}
          {app === 'cake' && <div className="cake-body"><div ref={cakeRef} className={`cake-graphic ${lit ? '' : 'unlit'}`}><div className="candles"><i/><i/><i/></div><div className="cake-top"/><div className="cake-layer cake-layer-top"/><div className="cake-layer cake-layer-bottom"/><div className="cake-plate"/></div><h2>{lit ? 'Make a wish, Trang!' : 'Wish sent into the universe ✨'}</h2><p>{lit ? 'Nghĩ một điều ước thật xinh rồi thổi nến nhé.' : 'Một tuổi mới thật dịu dàng đang chờ cậu.'}</p><button className="primary-button" onClick={toggleCandles}>{lit ? 'Thổi nến ✨' : 'Thắp lại nến 🕯️'}</button></div>}
          {app === 'surprise' && <div className={`surprise-body surprise-${surpriseStage}`}><div ref={giftRef} className={`gift-box ${giftOpen ? 'opened' : ''}`}><div className="gift-lid"><span/></div><div className="gift-base"><i/></div><div className="gift-spark">✦</div></div>{giftOpen ? <><h2>A tiny happiness deploy ✨</h2><pre>{birthday.surpriseMessage}</pre><button className="secondary-button replay-surprise" onClick={replaySurprise}>Replay surprise</button></> : <><h2>A little surprise for you</h2><p>There might be a tiny happiness release inside.</p><button className="primary-button" onClick={openSurprise} disabled={surpriseStage === 'anticipation'}>Open gift 🎁</button></>}</div>}
          {app === 'settings' && <div className="settings-body"><div className="settings-heading"><Settings size={20}/><div><h2>Make it yours</h2><p>Small preferences for this birthday space.</p></div></div><Setting label="Sound effects" detail="Soft chime on celebration" value={sound} toggle={() => { const next = !sound; setSound(next); localStorage.setItem('birthday-sound', String(next)); }}/><Setting label="Reduce motion" detail="Keep transitions calm" value={reduceMotion} toggle={() => { const next = !reduceMotion; setReduceMotion(next); localStorage.setItem('birthday-reduced', String(next)); }}/><Setting label="Cursor sparkles" detail="A little shimmer while browsing" value={sparkles} toggle={() => { const next = !sparkles; setSparkles(next); localStorage.setItem('birthday-sparkles', String(next)); }}/><div className="hero-choice"><div><b>Hero presentation</b><small>Choose the main portrait style</small></div><select value={hero} onChange={(e) => { const value = e.target.value as typeof hero; setHero(value); localStorage.setItem('birthday-hero', value); }} aria-label="Hero presentation"><option value="hybrid">Hybrid</option><option value="illustrated">Illustration</option><option value="photo">Real photo</option></select></div><div className="settings-buttons"><button className="secondary-button settings-replay" onClick={() => { closeApp(); sessionStorage.removeItem('birthday-booted'); setBoot(true); }}>Replay intro</button><button className="reset-button" onClick={() => { resetQuest(localStorage);setQuest(readQuest(localStorage));setLit(true); setGiftOpen(false); setLiked(0); }}>Reset celebration</button></div><p className="about-line">Birthday OS · built with a little extra sparkle ♡</p></div>}
          {app === 'final' && <div className="final-wish-body"><Sparkles size={28}/><h2>Một điều ước dịu dàng</h2><p>Mong những ngày tới sẽ mang đến cho em thật nhiều niềm vui, và mong em luôn tự hào về con đường mình đã chọn.</p><b>Happy Birthday, Trang ♡</b></div>}
          {app === 'terminal' && <div className="terminal-body"><div className="terminal-line">&gt; <span>birthday_os --status</span></div><p>system: <b>celebration ready</b></p><p>recipient: <b>{birthday.recipientName}</b></p><p>current branch: <b>birthday/wishes</b></p><p>all checks passed <span className="terminal-ok">✓</span></p><div className="terminal-line command-line">&gt; <input aria-label="Terminal command" placeholder="type birthday and press enter" onKeyDown={(e) => { if (e.key === 'Enter' && e.currentTarget.value.toLowerCase().includes('birthday')) { burst(); e.currentTarget.value = ''; } }}/></div><small>Try <code>birthday</code> for a tiny easter egg.</small></div>}
          {app === 'help' && <div className="help-body"><h2>Welcome to Birthday OS</h2><p>Open the note for a private birthday message, browse real photos in Gallery, then visit Birthday Cake to make a wish.</p><p>The dock stays available whenever you need it. Press <kbd>Esc</kbd> to close any app, or <kbd>⌘ K</kbd> to open Spotlight.</p></div>}
          {photoIndex !== null && photoIndex>=0 && app === 'gallery' && memories[photoIndex] && <Suspense fallback={<div className="lightbox-loading" role="status">Opening photo…</div>}><PhotoLightbox photos={memories} index={photoIndex} onClose={() => setSelectedPhotoId(null)} onStep={selectPhotoIndex}/></Suspense>}
        </motion.section>
      </motion.div>}
    </AnimatePresence>
  </main>;
}

function windowTitle(app: AppId) { return ({ note: 'secret_note.md', gallery: 'little_memories.gallery', cake: 'birthday_cake.app', surprise: 'a_little_surprise.zip', settings: 'system_preferences', terminal: 'birthday_terminal', help: 'welcome_to_birthday_os', final:'final_wish.md' })[app]; }
function BootScene({ onSkip, reduced }: { onSkip: () => void; reduced: boolean }) {
  const lines = ['> booting_birthday_system...', '> loading: birthday_memories...', '> mounting: secret_note.md...', '> checking: happiness_level... 100%', '> welcome to Birthday OS ♡'];
  const [progress, setProgress] = useState(reduced ? 100 : 0);
  useEffect(() => { if (reduced) return; const timer = window.setInterval(() => setProgress((value) => Math.min(100, value + 2)), 68); return () => window.clearInterval(timer); }, [reduced]);
  return <div className="boot-screen"><div className="boot-orb one"/><div className="boot-orb two"/><section className="boot-panel"><div className="boot-title"><span/><span/><span/><b>Birthday OS v3.1</b></div><div className="boot-heart">♡</div><div className="boot-lines">{lines.map((line, i) => <div key={line} className={progress > i * 19 ? 'visible' : ''}>{line}</div>)}</div><div className="boot-footer"><div className="progress-row"><div className="progress-track"><span style={{ width: `${progress}%` }}/></div><b>{progress}%</b></div><button className="skip-button" onClick={onSkip}>{reduced ? 'Enter birthday space' : 'Skip intro'}</button></div></section><span className="boot-caption">a tiny celebration is loading ✦</span></div>;
}
function Gallery({ photos, source, state, error, onRefresh, selected, setSelected, onViewed }: { photos: MemoryPhoto[]; source: MemoriesSource; state: 'loading' | 'ready' | 'error'; error: string; onRefresh: () => void; selected: number; setSelected: (index: number) => void; onViewed:()=>void }) {
  const [tab, setTab] = useState<'library' | 'film' | 'scrapbook'>('library');
  const [filmIndex, setFilmIndex] = useState(selected);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);
  const [loop, setLoop] = useState(true);
  const [page, setPage] = useState(0);
  const safeIndex = photos.length ? ((filmIndex % photos.length) + photos.length) % photos.length : 0;
  const current=photos[safeIndex];
  const albumPhotos=useMemo(()=>photos.map(photo=>({src:photo.src,key:photo.id,alt:photo.alt,label:`Open ${photo.caption||`Memory ${photo.order}`}`,width:photo.width||1200,height:photo.height||900})),[photos]);
  useEffect(()=>{if(selected<photos.length&&!playing)setFilmIndex(selected);},[selected,photos.length,playing]);
  useEffect(() => {
    if (!playing || photos.length < 2) return;
    const timer = window.setInterval(() => setFilmIndex(value => { if (!loop && value >= photos.length - 1) { setPlaying(false); return value; } return loop ? (value+1)%photos.length : Math.min(photos.length - 1, value + 1); }), speed * 1000);
    return () => window.clearInterval(timer);
  }, [playing, speed, photos.length, loop]);
  useEffect(()=>{if(tab!=='film'||!current)return;const image=new Image();image.src=photos[(safeIndex+1)%photos.length]?.src||'';},[tab,photos,safeIndex,current]);
  useEffect(()=>{const strip=document.querySelector('.filmstrip .current');if(strip&&typeof strip.scrollIntoView==='function')strip.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'});},[safeIndex,tab]);
  useEffect(()=>{const pause=()=>{if(document.hidden)setPlaying(false);};document.addEventListener('visibilitychange',pause);return()=>document.removeEventListener('visibilitychange',pause);},[]);
  const step = useCallback((delta: number) => {setPlaying(false);setFilmIndex(value => loop ? (value + delta + photos.length) % photos.length : Math.max(0, Math.min(photos.length - 1, value + delta)));},[loop,photos.length]);
  const openPhoto = (index: number) => { setPlaying(false);setSelected(index);onViewed(); };
  useEffect(()=>{const keys=(event:KeyboardEvent)=>{if(tab!=='film')return;if(event.key==='ArrowLeft')step(-1);if(event.key==='ArrowRight')step(1);if(event.code==='Space'&&event.target===document.body){event.preventDefault();setPlaying(value=>!value);}};window.addEventListener('keydown',keys);return()=>window.removeEventListener('keydown',keys);},[tab,step]);
  return <div className="gallery-body">
    <div className="gallery-intro"><div><h2>Memories</h2><p>{source === 'minio' ? 'Freshly discovered birthday photos.' : 'Six snapshots, a little warmth to keep.'} · {photos.length} ảnh</p></div><button className="refresh-memories" onClick={onRefresh} disabled={state === 'loading'}>↻ Refresh memories</button></div>
    <div className="memory-tabs" role="tablist" aria-label="Memories views">{(['library', 'film', 'scrapbook'] as const).map((id) => <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'selected' : ''} onClick={() => setTab(id)}>{id === 'library' ? 'Library' : id === 'film' ? 'Memory Film' : 'Scrapbook'}</button>)}</div>
    {state === 'loading' ? <div className="memories-message" role="status">Finding your memories…</div> : state === 'error' ? <div className="memories-message error-state"><b>Memories could not be loaded</b><span>{error}</span><button className="secondary-button" onClick={onRefresh}>Try again</button></div> : photos.length === 0 ? <div className="memories-message">No numbered photos found in the configured MinIO prefix yet.</div> : <>
      {tab === 'library' && <RowsPhotoAlbum photos={albumPhotos} targetRowHeight={180} rowConstraints={{singleRowMaxHeight:260}} onClick={({index})=>openPhoto(index)}/>}
      {tab === 'film' && current && <section className="film-view" aria-label="Cinematic memory film"><div className="film-stage" data-active-photo={current.id} style={{backgroundImage:`linear-gradient(#132c3566,#132c3566),url("${current.src}")`}}><img className="film-active-image" key={current.id} src={current.src} alt={current.alt} onError={()=>{setPlaying(false);void onRefresh();}}/><div className="film-caption">{current.caption || `Memory #${current.order}`}</div></div><div className="film-progress" aria-hidden="true"><i style={{animationDuration:`${speed}s`,animationPlayState:playing?'running':'paused'}} key={`${safeIndex}-${playing}-${speed}`}/></div><div className="film-controls"><button onClick={() => step(-1)} aria-label="Previous memory"><ChevronLeft size={17}/></button><button className="play-film" aria-label={playing?'Pause memory film':'Play memory film'} onClick={() => setPlaying(value=>!value)}>{playing ? 'Pause' : 'Play'}</button><button onClick={() => step(1)} aria-label="Next memory"><ChevronRight size={17}/></button><label>Speed <select aria-label="Film speed" value={speed} onChange={(event) => {setPlaying(false);setSpeed(Number(event.target.value));}}><option value={3}>3s</option><option value={5}>5s</option><option value={8}>8s</option></select></label><label className="loop-toggle"><input type="checkbox" checked={loop} onChange={(event) => setLoop(event.target.checked)}/> Loop</label><button className="film-open" onClick={() => openPhoto(safeIndex)}>Open photo</button><span>{safeIndex + 1} / {photos.length}</span></div><div className="filmstrip" aria-label="Memory timeline">{photos.map((photo, index) => <button key={photo.id} className={safeIndex === index ? 'current' : ''} onClick={() => {setPlaying(false);setFilmIndex(index);}} aria-label={`Show memory ${photo.order}`} aria-current={safeIndex===index?'true':undefined}><img src={photo.thumbnailSrc || photo.src} alt="" loading="lazy"/></button>)}</div></section>}
      {tab === 'scrapbook' && <section className="scrapbook-page" onTouchStart={e=>{(e.currentTarget as HTMLElement).dataset.x=String(e.touches[0]?.clientX||0)}} onTouchEnd={e=>{const dx=(e.changedTouches[0]?.clientX||0)-Number((e.currentTarget as HTMLElement).dataset.x||0);if(Math.abs(dx)>55)setPage(n=>Math.max(0,Math.min(Math.ceil(photos.length/2)-1,n+(dx<0?1:-1))))}}><div className="scrapbook-grid">{photos.slice(page*2,page*2+2).map((photo,index) => <button className={`scrapbook-card scrapbook-${index % 3}`} key={photo.id} onClick={() => openPhoto(page*2+index)}><span className="scrap-tape"/><img src={photo.thumbnailSrc || photo.src} alt={photo.alt} loading="lazy"/><span>{photo.caption || `Memory #${photo.order}`}</span></button>)}</div><div className="scrapbook-controls"><button disabled={!page} onClick={()=>setPage(n=>n-1)}>← Trang trước</button><span>{page+1} / {Math.ceil(photos.length/2)}</span><button disabled={page>=Math.ceil(photos.length/2)-1} onClick={()=>setPage(n=>n+1)}>Trang sau →</button></div></section>}
    </>}
  </div>;
}

function Setting({ label, detail, value, toggle }: { label: string; detail: string; value: boolean; toggle: () => void }) { return <div className="setting-row"><div><b>{label}</b><small>{detail}</small></div><button className={`toggle ${value ? 'on' : ''}`} role="switch" aria-checked={value} aria-label={label} onClick={toggle}><i/></button></div>; }

function stripMarkdown(value:string){return value.replace(/\*\*(.*?)\*\*/g,'$1').replace(/\*(.*?)\*/g,'$1');}
async function copyText(value:string){try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(value);return true;}}catch(error){console.warn('Clipboard API unavailable:',error);}const input=document.createElement('textarea');input.value=value;input.setAttribute('readonly','');input.style.position='fixed';input.style.opacity='0';document.body.append(input);input.select();let copied=false;try{copied=document.execCommand('copy');}finally{input.remove();}return copied;}
function renderNote(value:string){const parts=value.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);return parts.map((part,index)=>part.startsWith('**')?<strong key={index}>{part.slice(2,-2)}</strong>:part.startsWith('*')?<em key={index}>{part.slice(1,-1)}</em>:part);}
