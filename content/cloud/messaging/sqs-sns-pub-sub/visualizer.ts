import { withProvider } from '../../../../src/server/simulations/cloud/provider';
import { messageQueue } from '../../../../src/server/simulations/rate-queue';
export default withProvider(
  messageQueue('sqs-sns-pub-sub'),
  'sqs-sns-pub-sub',
  {
    aws: 'SQS work queues / SNS fan-out concepts',
    gcp: 'Pub/Sub subscription concepts',
    notes:
      'These services have different ordering, acknowledgment, retention and optional delivery guarantees. The atomic inbox protects a modeled local effect; external email/charges still need their own idempotency protocol. Do not infer universal exactly-once delivery from this diagram.',
    nodes: {
      aws: { broker: 'SQS / SNS conceptual broker' },
      gcp: { broker: 'Pub/Sub conceptual broker' },
    },
  },
);
