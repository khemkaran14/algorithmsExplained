import java.util.*;
class Responsibility {record Flags(String service,boolean patchOS,boolean patchRuntime,boolean patchApp,boolean dataPolicyDone,boolean credentialsProtected,boolean providerBaselineAvailable){}record Task(String label,boolean customer,boolean done){}record Result(String task,String owner,boolean satisfied){}
static List<Result> assess(Flags p){List<Task>tasks=List.of(new Task("Physical hardware",false,true),new Task("Hypervisor",false,true),new Task("Guest OS",p.service().equals("iaas"),p.patchOS()),new Task("Language runtime",p.service().equals("iaas"),p.patchRuntime()),new Task("Application source",!p.service().equals("saas"),p.patchApp()),new Task("Tenant data policy",true,p.dataPolicyDone()),new Task("Customer credentials",true,p.credentialsProtected()));
return tasks.stream().map(t->new Result(t.label(),t.customer()?"customer":"provider",t.customer()?t.done():p.providerBaselineAvailable())).toList();}}
// Educational matrix, refined by each actual product contract.
// Exercise flags are not proof of real account security or provider availability.
// Tenant identities/data configuration remain customer choices.
