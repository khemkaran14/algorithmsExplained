import { containers } from '../../../../src/server/simulations/cloud/containers';
import { withProvider } from '../../../../src/server/simulations/cloud/provider';
export default withProvider(
  containers('containers-kubernetes-basics'),
  'containers-kubernetes-basics',
  {
    aws: 'Container image / ECS and EKS concepts',
    gcp: 'Container image / GKE concepts',
    notes:
      'This bounded scheduler is not Kubernetes, ECS or kubelet. Readiness probes, networking, image provenance, volumes and disruption budgets are additional systems.',
  },
);
