function grid(cells,minimum=false){const rows=cells.length,cols=cells[0].length,dp=Array.from({length:rows},()=>Array(cols).fill(minimum?Infinity:0));
for(let r=0;r<rows;r++)for(let col=0;col<cols;col++){if(cells[r][col]===null)continue;if(r===0&&col===0){dp[r][col]=minimum?cells[r][col]:1;continue;}
const above=r?dp[r-1][col]:minimum?Infinity:0,left=col?dp[r][col-1]:minimum?Infinity:0;
dp[r][col]=minimum?Math.min(above,left)+cells[r][col]:above+left;}
const result=dp[rows-1][cols-1];
return Number.isFinite(result)?result:null;}
