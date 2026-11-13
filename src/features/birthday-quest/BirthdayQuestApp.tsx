import { ArrowUpRight, Check, LockKeyhole, Star, Trophy } from 'lucide-react';
import type { QuestId, QuestState, AchievementId } from '@/quest';

type Destination = 'note' | 'gallery' | 'cake' | 'surprise' | 'puzzle' | 'bug-hunter' | 'final';
type Props = { state: QuestState; photoCount: number; onGo: (app: Destination) => void };
const tasks: { id: QuestId; title: string; detail: string; app: Destination }[] = [
  { id: 'readSecretNote', title: 'Read the secret note', detail: 'Mở thư và đọc đến cuối.', app: 'note' },
  { id: 'exploreMemories', title: 'Explore memories', detail: 'Xem 10 kỷ niệm khác nhau.', app: 'gallery' },
  { id: 'blowCandles', title: 'Make a wish', detail: 'Thổi tắt nến trên bánh sinh nhật.', app: 'cake' },
  { id: 'openSurprise', title: 'Open the surprise', detail: 'Đợi món quà hé lộ.', app: 'surprise' },
  { id: 'solvePuzzle', title: 'Restore a memory', detail: 'Ghép hoàn chỉnh một bức ảnh.', app: 'puzzle' },
  { id: 'catchAllBugs', title: 'Debug the birthday', detail: 'Bắt đủ 8 bug trong 20 giây.', app: 'bug-hunter' },
];
const achievementInfo: Record<AchievementId, { title: string; detail: string; icon: string }> = {
  letterReader: { title: 'Letter Reader', detail: 'Đã đọc lời nhắn.', icon: '💌' },
  memoryExplorer: { title: 'Memory Explorer', detail: 'Đã xem album kỷ niệm.', icon: '📷' },
  wishMaker: { title: 'Wish Maker', detail: 'Đã gửi một điều ước.', icon: '🎂' },
  giftOpener: { title: 'Gift Opener', detail: 'Đã mở món quà bí mật.', icon: '🎁' },
  memoryRestorer: { title: 'Memory Restorer', detail: 'Đã ghép một bức ảnh.', icon: '🧩' },
  bugSlayer: { title: 'Bug Slayer', detail: 'Đã bắt mọi bug.', icon: '🐛' },
  noBugsJustWishes: { title: 'No Bugs, Just Wishes', detail: 'Happiness deployed successfully.', icon: '♡' },
  catWhisperer: { title: 'Cat Whisperer', detail: 'Đã làm quen với mèo desktop.', icon: '🐱' },
  birthdayExplorer: { title: 'Birthday Explorer', detail: 'Đã mở khóa lời chúc cuối.', icon: '⭐' },
};

export default function BirthdayQuestApp({ state, photoCount, onGo }: Props) {
  const core = ['readSecretNote', 'exploreMemories', 'blowCandles', 'openSurprise'] as const;
  const progress = core.filter((id) => id === 'exploreMemories' && !photoCount ? true : state.completedTaskIds.includes(id)).length;
  return <div className="game-app quest-app">
    <header className="game-heading"><span className="game-kicker">BIRTHDAY QUEST 2.0 · OPTIONAL ADVENTURE</span><h2>A little adventure for you ♡</h2><p>Mọi nhiệm vụ được ghi nhận từ hoạt động thật. Không cần làm theo thứ tự.</p></header>
    <div className="quest-progress"><div><span>Birthday wishes</span><b>{progress}/4</b></div><div className="quest-progress-track"><i style={{ width: `${progress * 25}%` }}/></div></div>
    <section className="quest-task-list" aria-label="Quest tasks">{tasks.map((task) => {
      const complete = state.completedTaskIds.includes(task.id);
      const unavailable = task.id === 'exploreMemories' && photoCount === 0;
      return <article key={task.id} className={`quest-task ${complete ? 'done' : ''} ${unavailable ? 'unavailable' : ''}`}>
        <span className="quest-check">{complete ? <Check size={17}/> : unavailable ? <LockKeyhole size={15}/> : <Star size={16}/>}</span><div><b>{task.title}</b><small>{unavailable ? 'Not available yet · không có ảnh trong album.' : task.detail}</small></div><button onClick={() => onGo(task.app)}>{complete ? 'Visit' : 'Go to app'} <ArrowUpRight size={14}/></button>
      </article>;
    })}</section>
    <section className="achievement-section"><h3><Trophy size={17}/> Achievements <span>{state.unlockedAchievementIds.length}/{Object.keys(achievementInfo).length}</span></h3><div className="achievement-grid">{(Object.keys(achievementInfo) as AchievementId[]).map((id) => { const unlocked = state.unlockedAchievementIds.includes(id); const item = achievementInfo[id]; return <article key={id} className={`achievement-card ${unlocked ? 'unlocked' : ''}`}><span>{unlocked ? item.icon : '🔒'}</span><div><b>{unlocked ? item.title : 'A little mystery'}</b><small>{unlocked ? item.detail : 'Keep exploring to discover it.'}</small></div></article>; })}</div></section>
    <section className={`final-secret-card ${state.finalSecretUnlocked ? 'unlocked' : ''}`}><div><span>{state.finalSecretUnlocked ? 'FINAL WISH UNLOCKED ✨' : 'THE FINAL WISH'}</span><b>{state.finalSecretUnlocked ? 'A gentle little secret is ready.' : 'One more little adventure…'}</b><small>{state.finalSecretUnlocked ? 'Your birthday explorer achievement is yours.' : `Complete the available wishes and solve a puzzle or catch every bug.${photoCount ? '' : ' The photo task is unavailable until memories load.'}`}</small></div><button disabled={!state.finalSecretUnlocked} onClick={() => onGo('final')}>{state.finalSecretUnlocked ? 'Open final wish' : 'Locked'} {state.finalSecretUnlocked ? <ArrowUpRight size={14}/> : <LockKeyhole size={14}/>}</button></section>
  </div>;
}
