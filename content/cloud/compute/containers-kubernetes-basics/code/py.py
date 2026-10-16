# A real scheduler and readiness probes are outside this bounded decision helper.
def next_action(pods, desired, surge, unavailable, target, free_healthy_slot):
    live = [p for p in pods if p['state'] != 'removed']
    ready = sum(p['state'] == 'ready' for p in live)
    count = sum(p['version'] == target for p in live)
    if count < desired and len(live) < desired + surge and free_healthy_slot: return 'create'
    removable = any(p['version'] != target and (p['state'] != 'ready' or ready-1 >= desired-unavailable) for p in live)
    return 'remove-old' if removable else 'wait'
