function responsibility(p){const rows=[['Physical hardware',false,p.providerBaselineAvailable],['Hypervisor',false,p.providerBaselineAvailable],['Guest OS',p.service==='iaas',p.patchOS],['Language runtime',p.service==='iaas',p.patchRuntime],['Application source',p.service!=='saas',p.patchApp],['Tenant data policy',true,p.dataPolicyDone],['Customer credentials',true,p.credentialsProtected]];
return rows.map(([task,customer,done])=>({task,owner:customer?'customer':'provider',satisfied:customer?done:p.providerBaselineAvailable}));}
// Baseline educational matrix; concrete product contracts refine the boundary.
// IaaS customer owns guest OS/runtime/app; PaaS manages runtime; SaaS manages app source.
// Tenant data-access decisions and customer credentials remain customer responsibilities.
// This checks declared exercise flags only; it never scans an account or certifies compliance.
// Provider availability is an injected baseline assumption, not measured service health.
