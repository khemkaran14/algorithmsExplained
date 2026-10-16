import { withProvider } from '../../../../src/server/simulations/cloud/provider';
import { responsibility } from '../../../../src/server/simulations/cloud/responsibility';
export default withProvider(
  responsibility('shared-responsibility'),
  'shared-responsibility',
  {
    aws: 'AWS shared-responsibility concepts',
    gcp: 'Google Cloud shared-responsibility concepts',
    notes:
      'The checklist evaluates declared flags, not real accounts or compliance. Service contracts and shared-fate features refine this simple baseline; managed infrastructure does not eliminate customer identity/data governance.',
  },
);
