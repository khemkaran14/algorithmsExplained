import {generateKeyPairSync,sign,verify} from 'node:crypto';
// Generate and protect a new key; never use a public test-vector key for real signing.
const {privateKey,publicKey}=generateKeyPairSync('ed25519');
function signMessage(bytes){return sign(null,bytes,privateKey);}
function verifyMessage(bytes,signature){
return verify(null,bytes,publicKey,signature);}
