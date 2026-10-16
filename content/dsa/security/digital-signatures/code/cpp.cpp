#include <openssl/evp.h>
#include <vector>
#include <memory>
#include <stdexcept>
using Bytes=std::vector<unsigned char>;using Context=std::unique_ptr<EVP_MD_CTX,decltype(&EVP_MD_CTX_free)>;
Bytes sign(const Bytes& message,EVP_PKEY* protectedEd25519Key){Context c(EVP_MD_CTX_new(),EVP_MD_CTX_free);size_t length=0;if(!c||EVP_DigestSignInit(c.get(),nullptr,nullptr,nullptr,protectedEd25519Key)!=1||EVP_DigestSign(c.get(),nullptr,&length,message.data(),message.size())!=1)throw std::runtime_error("signing failed");Bytes out(length);if(EVP_DigestSign(c.get(),out.data(),&length,message.data(),message.size())!=1)throw std::runtime_error("signing failed");out.resize(length);return out;}
bool verify(const Bytes& message,const Bytes& signature,EVP_PKEY* trustedEd25519PublicKey){Context c(EVP_MD_CTX_new(),EVP_MD_CTX_free);return c&&EVP_DigestVerifyInit(c.get(),nullptr,nullptr,nullptr,trustedEd25519PublicKey)==1&&EVP_DigestVerify(c.get(),signature.data(),signature.size(),message.data(),message.size())==1;}
