class Grid {static Double solve(Integer[][] cells,boolean minimum){int rows=cells.length,cols=cells[0].length;double[][] dp=new double[rows][cols];if(minimum)for(double[] row:dp)java.util.Arrays.fill(row,Double.POSITIVE_INFINITY);
for(int r=0;r<rows;r++)for(int c=0;c<cols;c++){if(cells[r][c]==null)continue;if(r==0&&c==0){dp[r][c]=minimum?cells[r][c]:1;continue;}
double missing=minimum?Double.POSITIVE_INFINITY:0,above=r>0?dp[r-1][c]:missing,left=c>0?dp[r][c-1]:missing;
dp[r][c]=minimum?Math.min(above,left)+cells[r][c]:above+left;}
double out=dp[rows-1][cols-1];
return Double.isFinite(out)?out:null;}}
