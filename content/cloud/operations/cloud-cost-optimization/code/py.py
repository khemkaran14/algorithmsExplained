# The rates are exercise inputs, not provider quotes.
def estimate(requests, hit_percent, replicas, hours, hourly, per_million,
             storage_gb, storage_rate, response_kb, public_percent, egress_rate, cache_rate, instances=True):
    origin = requests * (1 - hit_percent / 100)
    compute = replicas * hours * hourly if instances else origin / 1e6 * per_million
    storage = storage_gb * storage_rate * hours / 730
    egress = requests * response_kb / 1e6 * public_percent / 100 * egress_rate
    cache = cache_rate * hours / 730 if hit_percent > 0 else 0
    return dict(origin=origin, compute=compute, storage=storage, egress=egress,
                cache=cache, total=compute + storage + egress + cache)
