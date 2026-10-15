import java.util.Arrays;
class MergeSort { static int[] sort(int[] a) {
  if(a.length<2)return a.clone();int mid=a.length/2;
  int[] left=sort(Arrays.copyOfRange(a,0,mid)),right=sort(Arrays.copyOfRange(a,mid,a.length));
  int[] out=new int[a.length];int i=0,j=0;
  for(int k=0;k<out.length;k++)out[k]=j==right.length||(i<left.length&&left[i]<=right[j])?left[i++]:right[j++];
  return out;
} }
