import { events } from '../../../../src/server/simulations/cloud/events';
import { withProvider } from '../../../../src/server/simulations/cloud/provider';
export default withProvider(events, 'eventbridge-eventarc', {
  aws: 'EventBridge routing concepts',
  gcp: 'Eventarc routing concepts',
  notes:
    'This is a local filter/inbox exercise, not either provider\u2019s filter grammar, connector catalog or delivery guarantee. Event IDs must be immutable and external side effects need their own idempotency protocol.',
});
