class Sum { static long sum(int[] a) {
  long total = 0;
  for (int value : a) total += value;
  // One read per value.
  // Constant auxiliary space.
  return total; } }
