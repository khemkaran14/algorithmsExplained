import { networking } from '../../../../src/server/simulations/cloud/network';
import { withProvider } from '../../../../src/server/simulations/cloud/provider';
export default withProvider(
  networking('vpc-subnets-routes-nat'),
  'vpc-subnets-routes-nat',
  {
    aws: 'VPC routes / internet gateway / NAT concepts',
    gcp: 'VPC subnet routes / Cloud NAT concepts',
    notes:
      'This is a bounded five-tuple teaching model, not TCP, a complete NAT implementation or all AWS/GCP route precedence. NAT is not an inbound authorization mechanism.',
  },
);
