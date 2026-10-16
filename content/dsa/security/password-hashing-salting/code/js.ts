import {randomBytes,scrypt} from 'node:crypto';
function derive(password,salt){return new Promise((resolve,reject)=>scrypt(password,salt,32,{N:131072,r:8,p:1,maxmem:256*1024*1024},(error,key)=>error?reject(error):resolve(key)));}
async function hashPassword(password){const salt=randomBytes(16),hash=await derive(password,salt);
// Store salt, hash and KDF parameters; protect the database and use constant-time verification.
return {algorithm:'scrypt',N:131072,r:8,p:1,salt,hash};}
// Calibrate parameters for the deployment; apply authentication rate limits separately.
