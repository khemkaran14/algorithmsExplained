# Caller maintains the window and consecutive breach count.
def evaluate(samples, slo_percent, burn_threshold, missing_policy):
    valid = [s for s in samples if s is not None]
    missing = len(valid) != len(samples)
    requests = sum(s[0] for s in valid)
    errors = sum(s[1] for s in valid)
    burn = errors / requests / (1 - slo_percent / 100) if requests else None
    state = ("breaching" if missing and missing_policy == "breaching" else
             "unknown" if missing and missing_policy == "unknown" else
             "unknown" if burn is None else "breaching" if burn >= burn_threshold else "healthy")
    return requests, errors, burn, state
