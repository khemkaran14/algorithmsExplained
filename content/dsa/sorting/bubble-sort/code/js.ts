function bubble(a) {
  for (let end = a.length - 1; end > 0; end--) { let swapped = false;
    for (let j = 0; j < end; j++) if (a[j] > a[j + 1]) {
      [a[j], a[j + 1]] = [a[j + 1], a[j]]; swapped = true; }
    if (!swapped) break; }
  return a; }
