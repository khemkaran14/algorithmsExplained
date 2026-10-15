#include <string>
#include <vector>
std::vector<char32_t> codePoints(const std::u32string& text){
// The input is already decoded UTF-32, not a UTF-8 std::string.
std::vector<char32_t> out;for(char32_t point:text)out.push_back(point);
return out;}
