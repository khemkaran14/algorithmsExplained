# Call only after selecting the operation's reachable replica component.
def commit(clock, previous_timestamp, epsilon, reachable, replicas, wait=True):
    if reachable < replicas // 2 + 1:
        return {"acknowledged": False}
    timestamp = max(previous_timestamp + 1, clock + epsilon)
    delay = max(0, timestamp + epsilon + 1 - clock) if wait else 0
    clock += delay
    return dict(acknowledged=True, clock=clock, timestamp=timestamp, delay=delay,
                timing_condition=clock - epsilon > timestamp)
