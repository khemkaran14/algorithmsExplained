# Trust/session/principal selection must happen before this scoped policy core.
def glob(pattern, text):
    row = [True] + [False] * len(text)
    for token in pattern:
        nxt = [token == '*' and row[0]] + [False] * len(text)
        for j in range(1, len(text)+1):
            nxt[j] = (row[j] or nxt[j-1]) if token == '*' else row[j-1] and token in ('?', text[j-1])
        row = nxt
    return row[-1]
def allowed(statements, action, resource, conditions_match):
    allow = False
    for s in statements:
        if glob(s['action'], action) and glob(s['resource'], resource) and conditions_match(s):
            if s['effect'] == 'deny': return False
            allow = True
    return allow
