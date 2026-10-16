import { iam } from '../../../../src/server/simulations/cloud/iam';
import { withProvider } from '../../../../src/server/simulations/cloud/provider';
export default withProvider(iam, 'iam-users-roles-policies', {
  aws: 'IAM identity policies / role trust concepts',
  gcp: 'IAM role binding / service account concepts',
  notes:
    'Real AWS IAM and Google IAM evaluation is richer and structurally different: organizations, resource policies, boundaries, conditions and identity federation are outside this flattened exercise. Inputs are trusted lesson scenarios, never an app authorization pattern.',
});
