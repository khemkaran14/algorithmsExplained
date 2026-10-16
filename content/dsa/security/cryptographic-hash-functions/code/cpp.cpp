#include <openssl/evp.h>
#include <array>
#include <vector>
#include <stdexcept>
std::array<unsigned char,32> sha256(const std::vector<unsigned char>& bytes){std::array<unsigned char,32>out;unsigned length=0;if(EVP_Digest(bytes.data(),bytes.size(),out.data(),&length,EVP_sha256(),nullptr)!=1||length!=out.size())throw std::runtime_error("SHA-256 failed");
return out;} // Link with OpenSSL libcrypto.
