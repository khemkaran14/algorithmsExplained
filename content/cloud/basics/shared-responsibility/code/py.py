def responsibility(p):
    rows=[('Physical hardware',False,p['providerBaselineAvailable']),('Hypervisor',False,p['providerBaselineAvailable']),('Guest OS',p['service']=='iaas',p['patchOS']),('Language runtime',p['service']=='iaas',p['patchRuntime']),('Application source',p['service']!='saas',p['patchApp']),('Tenant data policy',True,p['dataPolicyDone']),('Customer credentials',True,p['credentialsProtected'])]
    return [dict(task=task,owner='customer' if customer else 'provider',satisfied=done if customer else p['providerBaselineAvailable']) for task,customer,done in rows]
# IaaS exposes the guest OS; PaaS manages runtime; SaaS manages source.
# Actual service contracts refine these illustrative ownership boundaries.
# No account scan, external request or compliance assessment occurs.
# Inputs are validated/defaulted exercise flags.
