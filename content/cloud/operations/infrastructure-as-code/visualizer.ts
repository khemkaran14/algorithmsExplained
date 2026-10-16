import { iac } from '../../../../src/server/simulations/cloud/iac';
import { withProvider } from '../../../../src/server/simulations/cloud/provider';
export default withProvider(iac, 'infrastructure-as-code', {
  aws: 'CloudFormation / Terraform-on-AWS concepts',
  gcp: 'Infrastructure Manager / Terraform-on-GCP concepts',
  notes:
    'No real resources, HCL parser, cloud credentials or deployment run. Dependency graphs, state locking, imports, provider retries and non-atomic replacement need further production design.',
});
