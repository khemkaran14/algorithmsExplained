#include <vector>
#include <utility>
std::pair<double,double> availability(const std::vector<double>& components,bool series,double common=1,int days=30){double product=1;for(double a:components){product*=series?a:1-a;}
double result=(series?product:1-product)*common;
// This is a planning equation under independence, not an SLA guarantee.
return {result,(1-result)*days*86400};}
