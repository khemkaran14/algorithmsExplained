import { cicd } from '../../../../src/server/simulations/cloud/cicd';
import { withProvider } from '../../../../src/server/simulations/cloud/provider';
export default withProvider(cicd, 'cloud-ci-cd', {
  aws: 'CodePipeline / CodeBuild / deployment concepts',
  gcp: 'Cloud Build / Cloud Deploy concepts',
  notes:
    'Synthetic requests are not statistical significance, actual build results or a real deployment. Supply-chain trust, approval policy, migration compatibility and production monitoring remain operational requirements.',
});
