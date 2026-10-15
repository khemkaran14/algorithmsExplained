function sum(a) {
  let total = 0;
  for (const value of a) {
    total += value;
  }
  // Each value was read once.
  return total;
}
