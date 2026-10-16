import { withProvider } from '../../../../src/server/simulations/cloud/provider';
import { dataModels } from '../../../../src/server/simulations/database/data-models';
export default withProvider(
  dataModels('dynamodb-firestore-bigtable'),
  'dynamodb-firestore-bigtable',
  {
    aws: 'DynamoDB key/item and sort-key concepts',
    gcp: 'Firestore document / Bigtable row-key concepts',
    notes:
      'DynamoDB items, Firestore documents and Bigtable rows have different query, index, transaction and limit semantics. Relational/graph modes are comparison baselines, not a claim that these services expose native SQL or graph traversal.',
  },
);
