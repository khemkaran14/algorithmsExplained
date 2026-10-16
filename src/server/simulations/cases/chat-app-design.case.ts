import 'server-only';
import { withCaseStudy } from './overview';
import { chatApp } from './social';
export default withCaseStudy(chatApp, {
  requirements: [
    'Persist room messages in a defined room order.',
    'Deduplicate retried sends without changing their payload.',
    'Replay missed messages after reconnect while enforcing room membership.',
  ],
  apis: [
    {
      method: 'POST',
      path: '/rooms/{id}/messages',
      purpose: 'Append a message with a client-generated message ID.',
    },
    {
      method: 'GET',
      path: '/rooms/{id}/messages?after={sequence}',
      purpose: 'Read messages after a durable room cursor.',
    },
  ],
  entities: [
    {
      name: 'Message',
      fields: 'roomId + sequence PK, messageId UNIQUE, sender, text',
    },
    { name: 'Cursor', fields: 'userId + roomId PK, lastDeliveredSequence' },
  ],
  decisions: [
    'Clients connect to a gateway, but acknowledged messages require durable storage.',
    'Use membership checks before accepting a room append.',
    'A message ID binds the sender, room and immutable payload.',
    'Order is scoped to a single room, not all rooms globally.',
    'Reconnect reads the room log after a cursor; delivery and read receipts are different.',
  ],
  breakInstructions:
    'Disconnect bob, lose the first send response, retry the same ID, then reconnect. Verify one committed message and one replay for the offline recipient.',
  assumptions: {
    dailyActors: 100000,
    requestsPerActor: 20,
    peakMultiplier: 5,
    payloadBytes: 1000,
    retentionDays: 30,
  },
});
