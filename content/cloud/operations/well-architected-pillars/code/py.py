# No aggregate score: each failed constraint remains independently actionable.
def capacity_review(replicas, zones, capacity, peak, assumed_monthly_rate, budget):
    placement = [0] * zones
    for i in range(replicas): placement[i % zones] += 1
    surviving = replicas - max(placement)
    return dict(placement=placement, healthy_capacity=replicas * capacity,
                zone_failure_capacity=surviving * capacity, peak_fits=replicas * capacity >= peak,
                zone_loss_fits=surviving * capacity >= peak,
                assumed_instance_subtotal=replicas * assumed_monthly_rate,
                budget_fits=replicas * assumed_monthly_rate <= budget)
