function hanoi(n,from='A',to='C',other='B',moves=[]){
if(n===0)return moves;
hanoi(n-1,from,other,to,moves);
moves.push([from,to]);
hanoi(n-1,other,to,from,moves);
return moves;}
