import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
class AES {record Sealed(byte[] nonce,byte[] ciphertextAndTag){}static Sealed encrypt(byte[] key,byte[] plaintext) throws Exception {byte[] nonce=new byte[12];new SecureRandom().nextBytes(nonce);Cipher c=Cipher.getInstance("AES/GCM/NoPadding");c.init(Cipher.ENCRYPT_MODE,new SecretKeySpec(key,"AES"),new GCMParameterSpec(128,nonce));return new Sealed(nonce,c.doFinal(plaintext));}
static byte[] decrypt(byte[] key,Sealed sealed) throws Exception {Cipher c=Cipher.getInstance("AES/GCM/NoPadding");c.init(Cipher.DECRYPT_MODE,new SecretKeySpec(key,"AES"),new GCMParameterSpec(128,sealed.nonce()));return c.doFinal(sealed.ciphertextAndTag());}}
