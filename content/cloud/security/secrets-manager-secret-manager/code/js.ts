// Symbolic version IDs only. Separate target acceptance from secret-manager pointers.
class Rotation {
  constructor(){this.active=1;this.pending=null;this.next=1;this.validated=false;this.accepted=new Set([1]);}
  create(){if(this.pending!==null)return false;this.pending=++this.next;this.validated=false;return true;}
  configure(success){this.validated=false;if(this.pending===null||!success)return false;this.accepted.add(this.pending);return true;}
  validate(success){this.validated=this.pending!==null&&this.accepted.has(this.pending)&&success;return this.validated;}
  promote(){if(this.pending===null||!this.validated||!this.accepted.has(this.pending))return false;this.active=this.pending;this.pending=null;this.validated=false;return true;}
  retire(){if(this.pending!==null)return false;this.accepted=new Set([this.active]);return true;}
  authenticate(cachedVersion){return this.accepted.has(cachedVersion);}
}
