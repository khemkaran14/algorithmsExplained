def compare_sorts(values, algorithms):
    results = {}
    for name, sort in algorithms.items():
        copy = values[:]
        results[name] = sort(copy)
    return results
