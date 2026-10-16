#include <openssl/ssl.h>
#include <openssl/x509_vfy.h>
#include <memory>
#include <string>
// Caller owns an already-connected socket and sets a suitable I/O timeout.
bool verifyTLS(int socket,const std::string& hostname){std::unique_ptr<SSL_CTX,decltype(&SSL_CTX_free)>ctx(SSL_CTX_new(TLS_client_method()),SSL_CTX_free);if(!ctx||SSL_CTX_set_min_proto_version(ctx.get(),TLS1_2_VERSION)!=1||SSL_CTX_set_default_verify_paths(ctx.get())!=1)return false;SSL_CTX_set_verify(ctx.get(),SSL_VERIFY_PEER,nullptr);std::unique_ptr<SSL,decltype(&SSL_free)>ssl(SSL_new(ctx.get()),SSL_free);if(!ssl||SSL_set_tlsext_host_name(ssl.get(),hostname.c_str())!=1||SSL_set1_host(ssl.get(),hostname.c_str())!=1||SSL_set_fd(ssl.get(),socket)!=1)return false;return SSL_connect(ssl.get())==1&&SSL_get_verify_result(ssl.get())==X509_V_OK;}
