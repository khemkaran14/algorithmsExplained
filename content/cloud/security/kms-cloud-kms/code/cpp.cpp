#include <openssl/evp.h>
#include <openssl/rand.h>
#include <array>
#include <vector>
#include <memory>
#include <optional>
#include <stdexcept>
#include <string>
#include <algorithm>
using Bytes=std::vector<unsigned char>;using Context=std::unique_ptr<EVP_CIPHER_CTX,decltype(&EVP_CIPHER_CTX_free)>;struct Sealed{std::array<unsigned char,12>nonce;Bytes ciphertext;std::array<unsigned char,16>tag;};
Sealed encrypt(const std::array<unsigned char,32>& key,const Bytes& plaintext,const Bytes& aad){Sealed out;Context c(EVP_CIPHER_CTX_new(),EVP_CIPHER_CTX_free);if(!c||RAND_bytes(out.nonce.data(),12)!=1||EVP_EncryptInit_ex(c.get(),EVP_aes_256_gcm(),nullptr,key.data(),out.nonce.data())!=1)throw std::runtime_error("initialization failed");out.ciphertext.resize(plaintext.size()+16);int length=0,tail=0;if(EVP_EncryptUpdate(c.get(),nullptr,&length,aad.data(),aad.size())!=1)throw std::runtime_error("AAD failed");if(EVP_EncryptUpdate(c.get(),out.ciphertext.data(),&length,plaintext.data(),plaintext.size())!=1||EVP_EncryptFinal_ex(c.get(),out.ciphertext.data()+length,&tail)!=1||EVP_CIPHER_CTX_ctrl(c.get(),EVP_CTRL_GCM_GET_TAG,16,out.tag.data())!=1)throw std::runtime_error("encryption failed");out.ciphertext.resize(length+tail);return out;}
std::optional<Bytes> decrypt(const std::array<unsigned char,32>& key,Sealed sealed,const Bytes& aad){Context c(EVP_CIPHER_CTX_new(),EVP_CIPHER_CTX_free);if(!c||EVP_DecryptInit_ex(c.get(),EVP_aes_256_gcm(),nullptr,key.data(),sealed.nonce.data())!=1)return std::nullopt;Bytes out(sealed.ciphertext.size()+16);int length=0,tail=0;if(EVP_DecryptUpdate(c.get(),nullptr,&length,aad.data(),aad.size())!=1)return std::nullopt;if(EVP_DecryptUpdate(c.get(),out.data(),&length,sealed.ciphertext.data(),sealed.ciphertext.size())!=1||EVP_CIPHER_CTX_ctrl(c.get(),EVP_CTRL_GCM_SET_TAG,16,sealed.tag.data())!=1||EVP_DecryptFinal_ex(c.get(),out.data()+length,&tail)!=1)return std::nullopt;out.resize(length+tail);return out;}

struct Record { int version;std::string id;Sealed payload,wrapped; };
Bytes aad(const std::string& text){return Bytes(text.begin(),text.end());}
std::array<unsigned char,32> dataKey(const Bytes& bytes){if(bytes.size()!=32)throw std::runtime_error("invalid key length");std::array<unsigned char,32> key;std::copy(bytes.begin(),bytes.end(),key.begin());return key;}
Record store(const std::array<unsigned char,32>& kek,int version,std::string id,const Bytes& plaintext){std::array<unsigned char,32> dek;if(RAND_bytes(dek.data(),32)!=1)throw std::runtime_error("random failed");return {version,id,encrypt(dek,plaintext,aad(id)),encrypt(kek,Bytes(dek.begin(),dek.end()),aad(id+":"+std::to_string(version)))};}
std::optional<Bytes> read(const std::array<unsigned char,32>& kek,const Record& r){auto dek=decrypt(kek,r.wrapped,aad(r.id+":"+std::to_string(r.version)));if(!dek)return std::nullopt;return decrypt(dataKey(*dek),r.payload,aad(r.id));}
std::optional<Record> rewrap(const std::array<unsigned char,32>& oldKek,const std::array<unsigned char,32>& newKek,const Record& r,int version){auto dek=decrypt(oldKek,r.wrapped,aad(r.id+":"+std::to_string(r.version)));if(!dek)return std::nullopt;return Record{version,r.id,r.payload,encrypt(newKek,*dek,aad(r.id+":"+std::to_string(version)))};}
