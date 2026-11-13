export function shufflePositions(size: number, random = Math.random): number[] {
  const values = Array.from({ length: size }, (_, index) => index);
  for (let index = values.length - 1; index > 0; index--) {
    const target = Math.floor(random() * (index + 1));
    [values[index], values[target]] = [values[target], values[index]];
  }
  if (values.every((value, index) => value === index) && values.length > 1) [values[0], values[1]] = [values[1], values[0]];
  return values;
}

export function swapPositions(values: number[], first: number, second: number) {
  if (first === second || !Number.isInteger(first) || !Number.isInteger(second) || first < 0 || second < 0 || first >= values.length || second >= values.length) return values;
  const next = [...values];
  [next[first], next[second]] = [next[second], next[first]];
  return next;
}

export const isPuzzleSolved = (values: number[]) => values.every((value, index) => value === index);
export const bugHuntWon = (caught: number, durationMs: number) => caught === 8 && durationMs >= 0 && durationMs < 20_000;
