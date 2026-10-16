import {createHash} from 'node:crypto';
function sha256(bytes){
const hash=createHash('sha256');
hash.update(bytes);
// A plain digest does not authenticate who supplied these bytes.
return hash.digest('hex');}
