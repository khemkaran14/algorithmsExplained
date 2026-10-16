// One resolver cache; update authoritative records without editing cached expiry.
class Resolver {
  constructor(){this.cache=null;}
  resolve(tick,records,ttl,negativeTTL){
    if(this.cache&&tick<this.cache.expires)return {...this.cache,source:'cache'};
    if(records.length===0)this.cache={answers:[],status:'NXDOMAIN',expires:tick+negativeTTL};
    else {const answers=records.filter(x=>x.healthy).map(x=>x.address);
      if(!answers.length)return {answers:[],status:'no-healthy-answer',expires:null,source:'authority'};
      this.cache={answers,status:'answer',expires:tick+ttl};}
    return {...this.cache,source:'authority'};
  }
}
