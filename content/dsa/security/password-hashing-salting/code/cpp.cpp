#include <openssl/evp.h>
#include <openssl/rand.h>
#include <array>
#include <string>
#include <stdexcept>
struct Verifier{std::array<unsigned char,16>salt;std::array<unsigned char,32>hash;};Verifier hashPassword(const std::string& password){Verifier out;if(RAND_bytes(out.salt.data(),out.salt.size())!=1||EVP_PBE_scrypt(password.data(),password.size(),out.salt.data(),out.salt.size(),131072,8,1,256ULL*1024*1024,out.hash.data(),out.hash.size())!=1)throw std::runtime_error("KDF failed");return out;} // Store algorithm/cost parameters; calibrate for deployment.
