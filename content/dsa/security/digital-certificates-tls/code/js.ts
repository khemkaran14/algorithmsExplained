import https from 'node:https';
function fetchSecure(url){
// Default certificate and hostname verification remain enabled.
return new Promise((resolve,reject)=>{
const request=https.get(url,response=>{response.resume();resolve(response.statusCode);});request.setTimeout(20000,()=>request.destroy(new Error('timeout')));request.on('error',reject);
});} // Never set rejectUnauthorized:false to bypass a certificate error.
