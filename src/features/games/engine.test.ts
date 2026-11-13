import { describe, expect, it } from 'vitest';
import { bugHuntWon, isPuzzleSolved, shufflePositions, swapPositions } from './engine';

describe('game engines', () => {
  it('always shuffles to a complete but unsolved board', () => {
    for (const size of [9, 16]) {
      const result = shufflePositions(size, () => 0.5);
      expect([...result].sort((a, b) => a - b)).toEqual(Array.from({ length: size }, (_, index) => index));
      expect(isPuzzleSolved(result)).toBe(false);
    }
  });

  it('swaps valid positions without mutating the source', () => {
    const source = [2, 1, 0];
    expect(swapPositions(source, 0, 2)).toEqual([0, 1, 2]);
    expect(source).toEqual([2, 1, 0]);
    expect(swapPositions(source, -1, 9)).toBe(source);
  });

  it('accepts exactly eight bugs caught before the deadline', () => {
    expect(bugHuntWon(8, 19_999)).toBe(true);
    expect(bugHuntWon(8, 20_000)).toBe(false);
    expect(bugHuntWon(7, 10_000)).toBe(false);
  });
});
