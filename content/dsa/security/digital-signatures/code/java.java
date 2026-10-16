import java.security.*;
class Signatures {static KeyPair newKey() throws Exception {return KeyPairGenerator.getInstance("Ed25519").generateKeyPair();}
static byte[] sign(byte[] message,PrivateKey key) throws Exception {Signature s=Signature.getInstance("Ed25519");s.initSign(key);s.update(message);return s.sign();}
static boolean verify(byte[] message,byte[] signature,PublicKey trustedKey) throws Exception {
Signature s=Signature.getInstance("Ed25519");s.initVerify(trustedKey);s.update(message);
return s.verify(signature);}}
