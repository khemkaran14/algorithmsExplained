# Drained outcome for permanently unavailable targets; UI shows each retry separately.
def route(events, rules, failed, max_attempts, deduplicate=True):
    inbox, effects, dead = set(), {}, []
    matched = delivered = suppressed = unmatched = 0
    for event in events:
        targets = {r['target'] for r in rules if r['source'] in ('*', event['source']) and r['type'] in ('*', event['type'])}
        unmatched += not targets
        for target in targets:
            matched += 1
            if target == failed:
                dead.append((event['id'], target, max_attempts)); continue
            delivered += 1
            key = target, event['id']
            if deduplicate and key in inbox: suppressed += 1
            else:
                inbox.add(key); effects[target] = effects.get(target, 0) + 1
    return dict(matched=matched, delivered=delivered, suppressed=suppressed, unmatched=unmatched, effects=effects, dead=dead)
