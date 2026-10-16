#include <vector>
#include <string>
struct Flags{std::string service;bool patchOS,patchRuntime,patchApp,dataPolicyDone,credentialsProtected,providerBaselineAvailable;};struct Task{std::string label;bool customer,done;};struct Result{std::string task,owner;bool satisfied;};
std::vector<Result> responsibility(const Flags&p){std::vector<Task>tasks{{"Physical hardware",false,true},{"Hypervisor",false,true},{"Guest OS",p.service=="iaas",p.patchOS},{"Language runtime",p.service=="iaas",p.patchRuntime},{"Application source",p.service!="saas",p.patchApp},{"Tenant data policy",true,p.dataPolicyDone},{"Customer credentials",true,p.credentialsProtected}};std::vector<Result>out;for(auto t:tasks)out.push_back({t.label,t.customer?"customer":"provider",t.customer?t.done:p.providerBaselineAvailable});return out;}
// Chosen baseline only; concrete service contracts define actual responsibility.
// No infrastructure is provisioned and no account is inspected.
// Hardware management does not remove customer data and identity obligations.
