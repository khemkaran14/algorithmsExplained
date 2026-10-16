#include <openssl/evp.h>
#include <openssl/rand.h>
#include <array>
#include <vector>
#include <memory>
#include <optional>
#include <stdexcept>
using Bytes=std::vector<unsigned char>;using Context=std::unique_ptr<EVP_CIPHER_CTX,decltype(&EVP_CIPHER_CTX_free)>;struct Sealed{std::array<unsigned char,12>nonce;Bytes ciphertext;std::array<unsigned char,16>tag;};
Sealed encrypt(const std::array<unsigned char,32>& key,const Bytes& plaintext){Sealed out;Context c(EVP_CIPHER_CTX_new(),EVP_CIPHER_CTX_free);if(!c||RAND_bytes(out.nonce.data(),12)!=1||EVP_EncryptInit_ex(c.get(),EVP_aes_256_gcm(),nullptr,key.data(),out.nonce.data())!=1)throw std::runtime_error("initialization failed");out.ciphertext.resize(plaintext.size()+16);int length=0,tail=0;if(EVP_EncryptUpdate(c.get(),out.ciphertext.data(),&length,plaintext.data(),plaintext.size())!=1||EVP_EncryptFinal_ex(c.get(),out.ciphertext.data()+length,&tail)!=1||EVP_CIPHER_CTX_ctrl(c.get(),EVP_CTRL_GCM_GET_TAG,16,out.tag.data())!=1)throw std::runtime_error("encryption failed");out.ciphertext.resize(length+tail);return out;}
std::optional<Bytes> decrypt(const std::array<unsigned char,32>& key,Sealed sealed){Context c(EVP_CIPHER_CTX_new(),EVP_CIPHER_CTX_free);if(!c||EVP_DecryptInit_ex(c.get(),EVP_aes_256_gcm(),nullptr,key.data(),sealed.nonce.data())!=1)return std::nullopt;Bytes out(sealed.ciphertext.size()+16);int length=0,tail=0;if(EVP_DecryptUpdate(c.get(),out.data(),&length,sealed.ciphertext.data(),sealed.ciphertext.size())!=1||EVP_CIPHER_CTX_ctrl(c.get(),EVP_CTRL_GCM_SET_TAG,16,sealed.tag.data())!=1||EVP_DecryptFinal_ex(c.get(),out.data()+length,&tail)!=1)return std::nullopt;out.resize(length+tail);return out;}
