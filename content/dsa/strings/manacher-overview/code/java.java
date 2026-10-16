class Manacher {static String longest(String s){int[][] radii=new int[2][s.length()];int bestStart=0,bestLength=1;
for(int parity=0;parity<2;parity++){int[] d=radii[parity];int left=0,right=-1;for(int i=0;i<s.length();i++){
int k=i>right?(parity==1?0:1):Math.min(d[left+right-i+(parity==1?1:0)],right-i+1);
while(i+k<s.length()&&i-k-(parity==1?1:0)>=0&&s.charAt(i+k)==s.charAt(i-k-(parity==1?1:0)))k++;
d[i]=k;int start=i-k+(parity==1?0:1),length=2*k-(parity==1?0:1);if(length>bestLength){bestStart=start;bestLength=length;}if(i+k-1>right){left=start;right=i+k-1;}}}
return s.substring(bestStart,bestStart+bestLength);}}
