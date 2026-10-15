function stackDemo(input) { const stack=[];
  for (const value of input) {
    stack.push(value); }
  while (stack.length > 0) {
    const popped=stack.pop(); console.log(popped); }
  return stack; }
