export const questIds = ['readSecretNote', 'exploreMemories', 'blowCandles', 'openSurprise', 'solvePuzzle', 'catchAllBugs'] as const;
export type QuestId = typeof questIds[number];
export const achievementIds = ['letterReader', 'memoryExplorer', 'wishMaker', 'giftOpener', 'memoryRestorer', 'bugSlayer', 'noBugsJustWishes', 'catWhisperer', 'birthdayExplorer'] as const;
export type AchievementId = typeof achievementIds[number];
export type QuestEvent =
  | { type: 'secretNote.read' }
  | { type: 'memory.viewed'; imageId: string }
  | { type: 'cake.candlesBlown' }
  | { type: 'surprise.revealed' }
  | { type: 'puzzle.solved'; imageId: string; difficulty: 'easy' | 'medium' }
  | { type: 'bugHunter.won'; caught: 8; durationMs: number }
  | { type: 'pet.interacted' };
export interface QuestState {
  schemaVersion: 2;
  completedTaskIds: QuestId[];
  viewedImageIds: string[];
  unlockedAchievementIds: AchievementId[];
  finalSecretUnlocked: boolean;
  updatedAt: string;
}

const key = 'birthday-quest-v2';
const taskForEvent: Partial<Record<QuestEvent['type'], QuestId>> = {
  'secretNote.read': 'readSecretNote',
  'cake.candlesBlown': 'blowCandles',
  'surprise.revealed': 'openSurprise',
  'puzzle.solved': 'solvePuzzle',
  'bugHunter.won': 'catchAllBugs',
};
const achievementForTask: Partial<Record<QuestId, AchievementId>> = {
  readSecretNote: 'letterReader',
  exploreMemories: 'memoryExplorer',
  blowCandles: 'wishMaker',
  openSurprise: 'giftOpener',
  solvePuzzle: 'memoryRestorer',
  catchAllBugs: 'bugSlayer',
};

export const emptyQuest = (): QuestState => ({ schemaVersion: 2, completedTaskIds: [], viewedImageIds: [], unlockedAchievementIds: [], finalSecretUnlocked: false, updatedAt: new Date(0).toISOString() });

export function readQuest(storage: Pick<Storage, 'getItem'>): QuestState {
  try {
    const value = JSON.parse(storage.getItem(key) || '{}') as Partial<QuestState>;
    const list = <T extends string>(items: unknown, allowed: readonly T[]) => Array.isArray(items) ? [...new Set(items.filter((item): item is T => typeof item === 'string' && allowed.includes(item as T)))] : [];
    const legacy = JSON.parse(storage.getItem('birthday-quest-v1') || '{}') as Record<string, unknown>;
    const completedTaskIds = list(value.completedTaskIds, questIds);
    if (value.schemaVersion !== 2) {
      if (legacy.open_memories === true) completedTaskIds.push('exploreMemories');
      if (legacy.read_secret_note === true) completedTaskIds.push('readSecretNote');
      if (legacy.blow_candles === true) completedTaskIds.push('blowCandles');
      if (legacy.open_surprise === true) completedTaskIds.push('openSurprise');
    }
    return {
      schemaVersion: 2,
      completedTaskIds: [...new Set(completedTaskIds)],
      viewedImageIds: Array.isArray(value.viewedImageIds) ? [...new Set(value.viewedImageIds.filter((item): item is string => typeof item === 'string'))] : [],
      unlockedAchievementIds: list(value.unlockedAchievementIds, achievementIds),
      finalSecretUnlocked: value.finalSecretUnlocked === true,
      updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : new Date(0).toISOString(),
    };
  } catch { return emptyQuest(); }
}

export function applyQuestEvent(state: QuestState, event: QuestEvent, photoCount: number): QuestState {
  const completed = new Set(state.completedTaskIds);
  const achievements = new Set(state.unlockedAchievementIds);
  const viewed = new Set(state.viewedImageIds);
  if (event.type === 'memory.viewed' && event.imageId.trim()) {
    viewed.add(event.imageId);
    if (photoCount > 0 && viewed.size >= Math.min(10, photoCount)) completed.add('exploreMemories');
  } else if (event.type === 'pet.interacted') achievements.add('catWhisperer');
  else if (event.type === 'bugHunter.won') {
    if (event.caught === 8 && event.durationMs <= 20_000) completed.add('catchAllBugs');
  } else {
    const task = taskForEvent[event.type];
    if (task) completed.add(task);
  }
  for (const id of completed) {
    const achievement = achievementForTask[id];
    if (achievement) achievements.add(achievement);
  }
  const core = ['readSecretNote', 'blowCandles', 'openSurprise'] as const;
  const albumReady = photoCount === 0 || completed.has('exploreMemories');
  const gameReady = completed.has('solvePuzzle') || completed.has('catchAllBugs');
  const finalSecretUnlocked = state.finalSecretUnlocked || (core.every((id) => completed.has(id)) && albumReady && gameReady);
  if (finalSecretUnlocked) achievements.add('birthdayExplorer');
  if (event.type === 'bugHunter.won' && completed.has('catchAllBugs')) achievements.add('noBugsJustWishes');
  const completedTaskIds = [...completed], viewedImageIds = [...viewed], unlockedAchievementIds = [...achievements];
  const same = (first: string[], second: string[]) => first.length === second.length && first.every((value) => second.includes(value));
  if (same(state.completedTaskIds, completedTaskIds) && same(state.viewedImageIds, viewedImageIds) && same(state.unlockedAchievementIds, unlockedAchievementIds) && state.finalSecretUnlocked === finalSecretUnlocked) return state;
  return { schemaVersion: 2, completedTaskIds, viewedImageIds, unlockedAchievementIds, finalSecretUnlocked, updatedAt: new Date().toISOString() };
}

export function saveQuest(storage: Pick<Storage, 'setItem'>, state: QuestState) { storage.setItem(key, JSON.stringify(state)); }
export function resetQuest(storage: Pick<Storage, 'removeItem'>) { storage.removeItem(key); storage.removeItem('birthday-quest-v1'); }
export const questCount = (state: QuestState) => state.completedTaskIds.length;
