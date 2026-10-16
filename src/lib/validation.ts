import { config } from 'zod/v4/core';
// Configure the shared parser before constructing browser schemas. Import this
// module for its side effect; do not re-export the complete Zod namespace.
config({ jitless: true });
