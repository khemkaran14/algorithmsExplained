#include <vector>
long long sum(const std::vector<int>& a) { long long total = 0;
  for (int value : a) total += value;
  // One read per value.
  // Constant auxiliary space.
  return total; }
