import {randomBytes,createCipheriv,createDecipheriv} from 'node:crypto';
function encrypt(key,plaintext){const nonce=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,nonce);const ciphertext=Buffer.concat([cipher.update(plaintext),cipher.final()]);
return {nonce,ciphertext,tag:cipher.getAuthTag()};}
function decrypt(key,{nonce,ciphertext,tag}){const cipher=createDecipheriv('aes-256-gcm',key,nonce);cipher.setAuthTag(tag);
const plaintext=Buffer.concat([cipher.update(ciphertext),cipher.final()]);
return plaintext;} // Authentication failure throws before any plaintext is returned. Key is 32 protected random bytes.
