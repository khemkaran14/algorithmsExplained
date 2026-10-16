import java.util.*;
class Reference {
static class Rotation {
  int active=1,next=1;Integer pending=null;boolean validated=false;Set<Integer> accepted=new HashSet<>(Set.of(1));
  boolean create(){if(pending!=null)return false;pending=++next;validated=false;return true;}
  boolean configure(boolean success){validated=false;if(pending==null||!success)return false;accepted.add(pending);return true;}
  boolean validate(boolean success){validated=pending!=null&&accepted.contains(pending)&&success;return validated;}
  boolean promote(){if(pending==null||!validated||!accepted.contains(pending))return false;active=pending;pending=null;validated=false;return true;}
  boolean retire(){if(pending!=null)return false;accepted=new HashSet<>(Set.of(active));return true;}
  boolean authenticate(int cachedVersion){return accepted.contains(cachedVersion);}
}
}
