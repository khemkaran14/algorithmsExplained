import 'server-only';
import { messageQueue } from '../rate-queue';
const base = messageQueue('notification-system');
const channels = ['Email', 'SMS', 'Push', 'Webhook'];
export const notifications: typeof base = {
  ...base,
  inputHint:
    'Each subscriber group is an independent delivery channel (Email, SMS, Push, optional Webhook). Messages carry illustrative work values, not real addresses. Atomic inbox + application effect prevents duplicate modeled sends; actual external providers need their own idempotency protocol. Poison messages or a failed channel retry to the dead-letter queue. Preferences, templates and real provider calls are outside this model.',
  controls: [
    ...(base.controls ?? []),
    {
      key: 'failSubscriber',
      label: 'Unavailable channel index (-1 = none)',
      type: 'number',
      min: -1,
      max: 3,
    },
  ],
  presets: {
    ...base.presets,
    average: {
      ...base.presets.average,
      mode: 'pubsub',
      subscribers: 3,
      failSubscriber: 1,
    },
    worst: {
      ...base.presets.worst,
      mode: 'pubsub',
      subscribers: 3,
      failSubscriber: 1,
    },
  },
  *generate(input) {
    for (const f of base.generate(input)) {
      if (f.state.nodes)
        f.state.nodes = f.state.nodes.map((n) => ({
          ...n,
          label: n.id.startsWith('group')
            ? `${channels[Number(n.id.slice(5))]} delivery worker`
            : n.label,
        }));
      yield f;
    }
  },
};
