def search(values, target):
    for i, value in enumerate(values):
        if value == target:
            return i
    # No matching key was found.
    return -1
