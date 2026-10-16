# snapshot must be a completed transfer/backup, never an in-flight copy.
def failover(strategy, replicas, available, fault_tick, now, detection, promotion, restore_duration, snapshot):
    if available >= replicas // 2 + 1: return dict(serving='primary', recovered=None)
    wait = detection + (promotion if strategy == 'cross-region' else restore_duration)
    can_recover = strategy in ('cross-region', 'backup-restore')
    if not can_recover or now < fault_tick + wait:
        return dict(serving='unavailable', recovered=None)
    return dict(serving='fenced-secondary', recovered=list(snapshot))
