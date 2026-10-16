import { z } from 'zod';
// CSP forbids Function/eval in the browser. Use Zod's supported non-JIT parser
// before constructing shared progress schemas, avoiding even its eval probe.
z.config({ jitless: true });
export { z };
