from copy import deepcopy

def recover(log,durable,disk):
    disk=deepcopy(disk); persisted=log[:durable]; winners={r['tx'] for r in persisted if r['kind']=='commit'}
    for record in persisted:
        if record['kind']=='update' and disk[record['key']]['lsn']<record['lsn']: disk[record['key']]=dict(value=record['after'],lsn=record['lsn'])
    for record in reversed(persisted):
        if record['kind']=='update' and record['tx'] not in winners: disk[record['key']]=dict(record['before'])
    return disk

def flush_page(buffer,disk,key,durable,enforce_wal=True):
    page=buffer[key]
    if enforce_wal: durable=max(durable,page['lsn'])
    disk[key]=dict(page); return durable
# Lock-conflicting open writes excluded; this is a bounded single-recovery redo/undo model.
