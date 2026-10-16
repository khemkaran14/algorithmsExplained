import java.security.MessageDigest;
import java.util.HexFormat;
class SHA256 {static String hash(byte[] bytes) throws Exception {
MessageDigest digest=MessageDigest.getInstance("SHA-256");
// A digest is not encryption or a password KDF.
return HexFormat.of().formatHex(digest.digest(bytes));}}
