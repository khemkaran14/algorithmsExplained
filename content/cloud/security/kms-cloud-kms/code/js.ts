import {randomBytes,createCipheriv,createDecipheriv} from 'node:crypto';
function encrypt(key,plaintext,aad){const nonce=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,nonce);cipher.setAAD(aad);const ciphertext=Buffer.concat([cipher.update(plaintext),cipher.final()]);
return {nonce,ciphertext,tag:cipher.getAuthTag()};}
function decrypt(key,{nonce,ciphertext,tag},aad){const cipher=createDecipheriv('aes-256-gcm',key,nonce);cipher.setAuthTag(tag);cipher.setAAD(aad);
const plaintext=Buffer.concat([cipher.update(ciphertext),cipher.final()]);
return plaintext;} // Authentication failure throws before any plaintext is returned. Key is 32 protected random bytes.

function store(kek,version,id,plaintext){const dek=randomBytes(32);return {version,id,payload:encrypt(dek,plaintext,Buffer.from(id)),wrapped:encrypt(kek,dek,Buffer.from(id+':'+version))};}
function read(kek,record){const dek=decrypt(kek,record.wrapped,Buffer.from(record.id+':'+record.version));return decrypt(dek,record.payload,Buffer.from(record.id));}
function rewrap(oldKek,newKek,record,version){const dek=decrypt(oldKek,record.wrapped,Buffer.from(record.id+':'+record.version));return {...record,version,wrapped:encrypt(newKek,dek,Buffer.from(record.id+':'+version))};}
