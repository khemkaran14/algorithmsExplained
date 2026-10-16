# Synthetic UI observations are not a statistical safety proof.
def decision(tests, policy, signature, candidate, errors, baseline,
             baseline_errors, min_samples, max_error, max_regression):
    if not (tests and policy and signature): return 'reject-before-rollout'
    if candidate < min_samples or baseline == 0: return 'hold'
    rate, stable_rate = 100 * errors / candidate, 100 * baseline_errors / baseline
    if rate > max_error or rate - stable_rate > max_regression: return 'rollback'
    return 'advance'
