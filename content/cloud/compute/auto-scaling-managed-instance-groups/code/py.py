# Startup and cooldown affect when this desired count becomes ready capacity.
def desired(load, tick, capacity, target_percent, minimum, maximum, lag, current, low_ticks, stabilization):
    signal = load[max(0, tick-lag)]
    from math import ceil
    target = min(maximum, max(minimum, ceil(signal/(capacity*target_percent/100))))
    low_ticks = low_ticks + 1 if target < current else 0
    allowed = target > current or low_ticks >= stabilization
    return (target if allowed else current), low_ticks
