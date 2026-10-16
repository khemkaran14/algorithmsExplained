# Existing FIFO waiters take ready slots before a new arrival.
def admission(environments, provider, concurrency, maximum, waiting):
    slots = 1 if provider == 'aws' else concurrency
    live = [e for e in environments if e['state'] != 'expired']
    warm = next((e for e in live if e['state'] == 'warm' and e['jobs'] < slots), None)
    if warm is not None and waiting == 0: return 'warm', warm['id']
    reserved = sum(e['state'] == 'starting' for e in live) * slots
    return ('cold-start' if len(live) < maximum and waiting+1 > reserved else 'queue'), None
