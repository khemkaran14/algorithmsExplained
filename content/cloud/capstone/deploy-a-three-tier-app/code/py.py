# Public database exposure does not grant a workload identity permission.
def request_path(ingress, lb_to_app, cache_hit, app_to_db, db_identity):
    if not (ingress and lb_to_app): return 'rejected-ingress'
    if cache_hit: return 'completed-public-catalog-cache'
    if not (app_to_db and db_identity): return 'failed-db-path-or-identity'
    return 'queued-for-shared-db-capacity'

def conserved(offered, completed, failed, rejected, pending):
    return offered == completed + failed + rejected + pending
