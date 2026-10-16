#include <vector>
#include <optional>
#include <limits>
#include <algorithm>
#include <cmath>
std::optional<double> grid(const std::vector<std::vector<std::optional<int>>>& cells,bool minimum=false){unsigned rows=cells.size(),cols=cells[0].size();double missing=minimum?std::numeric_limits<double>::infinity():0;std::vector<std::vector<double>>dp(rows,std::vector<double>(cols,missing));for(unsigned r=0;r<rows;r++)for(unsigned c=0;c<cols;c++){if(!cells[r][c])continue;if(r==0&&c==0){dp[r][c]=minimum?*cells[r][c]:1;continue;}double above=r?dp[r-1][c]:missing,left=c?dp[r][c-1]:missing;dp[r][c]=minimum?std::min(above,left)+*cells[r][c]:above+left;}double out=dp.back().back();return std::isfinite(out)?std::optional<double>(out):std::nullopt;}
