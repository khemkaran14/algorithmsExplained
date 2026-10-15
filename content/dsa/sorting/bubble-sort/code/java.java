class Bubble { static int[] sort(int[] a) {
  for (int end=a.length-1; end>0; end--) { boolean swapped=false;
    for (int j=0; j<end; j++) if (a[j]>a[j+1]) {
      int t=a[j]; a[j]=a[j+1]; a[j+1]=t; swapped=true; }
    if (!swapped) break; }
  return a; } }
