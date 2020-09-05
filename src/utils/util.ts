export function inRange(n: number, _min: number, _max: number): boolean { // Whether n is in the range [_min; _max]
  const min = Math.min(_min, _max);
  const max = Math.max(_min, _max);
  return min <= n && n <= max;
}

export function randomNumber(upperbound: number): number { // Returns a random number in the range [0; upperbound)
  return Math.floor(Math.random() * upperbound);
}
