import java.security.SecureRandom;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
class PasswordKDF {record Verifier(byte[] salt,byte[] hash,int iterations){}static Verifier hash(char[] password) throws Exception {byte[] salt=new byte[16];new SecureRandom().nextBytes(salt);int iterations=600000;PBEKeySpec spec=new PBEKeySpec(password,salt,iterations,256);
try{return new Verifier(salt,SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded(),iterations);}finally{spec.clearPassword();}}
} // PBKDF2 is a different KDF from scrypt. Calibrate parameters and record the algorithm.
