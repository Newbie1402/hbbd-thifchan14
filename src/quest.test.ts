import { describe,expect,it } from 'vitest';
import { completeQuest,questCount,readQuest,resetQuest } from './quest';

describe('birthday quest persistence',()=>{
  it('completes milestones once and restores them after reload',()=>{const storage=window.localStorage;storage.clear();expect(questCount(readQuest(storage))).toBe(0);expect(completeQuest(storage,'open_memories').changed).toBe(true);expect(completeQuest(storage,'open_memories').changed).toBe(false);expect(questCount(readQuest(storage))).toBe(1);});
  it('recovers corrupt state and resets all milestones',()=>{const storage=window.localStorage;storage.setItem('birthday-quest-v1','broken');expect(questCount(readQuest(storage))).toBe(0);for(const id of ['open_memories','read_secret_note','blow_candles','open_surprise'] as const)completeQuest(storage,id);expect(questCount(readQuest(storage))).toBe(4);resetQuest(storage);expect(questCount(readQuest(storage))).toBe(0);});
});
