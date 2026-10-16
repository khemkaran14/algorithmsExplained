import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
class AES {record Sealed(byte[] nonce,byte[] ciphertextAndTag){}static Sealed encrypt(byte[] key,byte[] plaintext,byte[] aad) throws Exception {byte[] nonce=new byte[12];new SecureRandom().nextBytes(nonce);Cipher c=Cipher.getInstance("AES/GCM/NoPadding");c.init(Cipher.ENCRYPT_MODE,new SecretKeySpec(key,"AES"),new GCMParameterSpec(128,nonce));c.updateAAD(aad);return new Sealed(nonce,c.doFinal(plaintext));}
static byte[] decrypt(byte[] key,Sealed sealed,byte[] aad) throws Exception {Cipher c=Cipher.getInstance("AES/GCM/NoPadding");c.init(Cipher.DECRYPT_MODE,new SecretKeySpec(key,"AES"),new GCMParameterSpec(128,sealed.nonce()));c.updateAAD(aad);return c.doFinal(sealed.ciphertextAndTag());}}

class Envelope {
record Record(int version,String id,AES.Sealed payload,AES.Sealed wrapped) {}
static byte[] aad(String text){return text.getBytes(java.nio.charset.StandardCharsets.UTF_8);}
static Record store(byte[] kek,int version,String id,byte[] plaintext)throws Exception{byte[] dek=new byte[32];new SecureRandom().nextBytes(dek);return new Record(version,id,AES.encrypt(dek,plaintext,aad(id)),AES.encrypt(kek,dek,aad(id+":"+version)));}
static byte[] read(byte[] kek,Record r)throws Exception{byte[] dek=AES.decrypt(kek,r.wrapped,aad(r.id+":"+r.version));return AES.decrypt(dek,r.payload,aad(r.id));}
static Record rewrap(byte[] oldKek,byte[] newKek,Record r,int version)throws Exception{byte[] dek=AES.decrypt(oldKek,r.wrapped,aad(r.id+":"+r.version));return new Record(version,r.id,r.payload,AES.encrypt(newKek,dek,aad(r.id+":"+version)));}
}
