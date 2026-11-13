import { describe, expect, it } from 'vitest';
import { applyQuestEvent, emptyQuest, questCount, readQuest, resetQuest, saveQuest } from './quest';

describe('Birthday Quest 2.0', () => {
  it('counts distinct memories toward the album threshold and persists idempotently', () => {
    const storage = window.localStorage; storage.clear();
    let state = emptyQuest();
    for (let index = 0; index < 9; index++) state = applyQuestEvent(state, { type: 'memory.viewed', imageId: `img-${index}` }, 48);
    expect(state.completedTaskIds).not.toContain('exploreMemories');
    const repeated = applyQuestEvent(state, { type: 'memory.viewed', imageId: 'img-0' }, 48);
    expect(repeated).toBe(state);
    state = applyQuestEvent(state, { type: 'memory.viewed', imageId: 'img-9' }, 48);
    saveQuest(storage, state);
    expect(readQuest(storage).completedTaskIds).toContain('exploreMemories');
    expect(questCount(readQuest(storage))).toBe(1);
  });

  it('uses all available images for a small album and does not require an empty album', () => {
    let state = emptyQuest();
    state = applyQuestEvent(state, { type: 'memory.viewed', imageId: 'only-photo' }, 1);
    expect(state.completedTaskIds).toContain('exploreMemories');
    let noPhotos = emptyQuest();
    for (const event of [{ type: 'secretNote.read' }, { type: 'cake.candlesBlown' }, { type: 'surprise.revealed' }, { type: 'bugHunter.won', caught: 8, durationMs: 19_000 }] as const) noPhotos = applyQuestEvent(noPhotos, event, 0);
    expect(noPhotos.finalSecretUnlocked).toBe(true);
  });

  it('unlocks the final wish only after core tasks and a real mini-game win', () => {
    let state = emptyQuest();
    state = applyQuestEvent(state, { type: 'secretNote.read' }, 12);
    state = applyQuestEvent(state, { type: 'cake.candlesBlown' }, 12);
    state = applyQuestEvent(state, { type: 'surprise.revealed' }, 12);
    for (let index = 0; index < 10; index++) state = applyQuestEvent(state, { type: 'memory.viewed', imageId: `photo-${index}` }, 12);
    expect(state.finalSecretUnlocked).toBe(false);
    state = applyQuestEvent(state, { type: 'puzzle.solved', imageId: 'photo-3', difficulty: 'easy' }, 12);
    expect(state.finalSecretUnlocked).toBe(true);
    expect(state.unlockedAchievementIds).toContain('birthdayExplorer');
    expect(applyQuestEvent(state, { type: 'pet.interacted' }, 12).unlockedAchievementIds).toContain('catWhisperer');
  });

  it('hydrates valid state, migrates legacy tasks, and recovers corrupt storage', () => {
    const storage = window.localStorage; storage.clear();
    storage.setItem('birthday-quest-v1', JSON.stringify({ open_memories: true, blow_candles: true }));
    expect(readQuest(storage).completedTaskIds).toEqual(['exploreMemories', 'blowCandles']);
    storage.setItem('birthday-quest-v2', 'broken');
    expect(readQuest(storage).completedTaskIds).toEqual([]);
    resetQuest(storage);
    expect(readQuest(storage).completedTaskIds).toEqual([]);
  });

  it('unlocks bug-hunter achievements once after a valid win', () => {
    const state = applyQuestEvent(emptyQuest(), { type: 'bugHunter.won', caught: 8, durationMs: 19000 }, 0);
    expect(state.unlockedAchievementIds).toContain('bugSlayer');
    expect(state.unlockedAchievementIds).toContain('noBugsJustWishes');
    expect(applyQuestEvent(state, { type: 'bugHunter.won', caught: 8, durationMs: 19000 }, 0)).toBe(state);
  });
});
