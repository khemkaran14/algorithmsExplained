# Applying resource actions is outside this pure planner; refresh after partial failure.
def plan(observed, desired):
    old, new = {x['name']: x for x in observed}, {x['name']: x for x in desired}
    actions = [(x['name'], 'destroy', x) for x in observed if x['name'] not in new]
    for value in desired:
        before = old.get(value['name'])
        kind = ('create' if before is None else 'replace' if before['region'] != value['region']
                else 'update' if before['size'] != value['size'] else None)
        if kind: actions.append((value['name'], kind, value.copy()))
    return actions

def blocked(actions, prevent_destroy):
    return prevent_destroy and any(kind in ('replace', 'destroy') for _, kind, _ in actions)
