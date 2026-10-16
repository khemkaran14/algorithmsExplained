class Availability {record Result(double availability,double downtimeSeconds){}static Result calculate(double[] components,boolean series,double common,int days){double product=1;
for(double a:components){
product*=series?a:1-a;}
double result=(series?product:1-product)*common;
// Independent components and an explicit common failure factor are model assumptions.
return new Result(result,(1-result)*days*86400);}}
