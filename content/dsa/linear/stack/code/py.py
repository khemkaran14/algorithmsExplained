def stack_demo(values):
    stack = []
    for value in values: stack.append(value)
    while stack:
        print(stack.pop())
    return stack
