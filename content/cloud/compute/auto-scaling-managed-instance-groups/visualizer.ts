import { autoscaling } from '../../../../src/server/simulations/cloud/autoscaling';
import { withProvider } from '../../../../src/server/simulations/cloud/provider';
export default withProvider(
  autoscaling,
  'auto-scaling-managed-instance-groups',
  {
    aws: 'EC2 Auto Scaling',
    gcp: 'Compute Engine Managed Instance Groups',
    notes:
      'This demand-derived controller is not an implementation of either provider\u2019s autoscaler. Product metrics, health replacement, warm pools and stabilization behavior differ.',
  },
);
