import { networking } from '../../../../src/server/simulations/cloud/network';
import { withProvider } from '../../../../src/server/simulations/cloud/provider';
export default withProvider(
  networking('security-groups-nacls-firewall-rules'),
  'security-groups-nacls-firewall-rules',
  {
    aws: 'Security groups / network ACL concepts',
    gcp: 'VPC firewall rule concepts',
    notes:
      'AWS security groups, NACLs and Google VPC firewall rules differ in attachment, priorities, denies and evaluation. This exercise does not merge every vendor policy layer.',
  },
);
