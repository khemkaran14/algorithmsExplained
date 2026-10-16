import { containers } from '../../../../src/server/simulations/cloud/containers';
import { withProvider } from '../../../../src/server/simulations/cloud/provider';
export default withProvider(containers('ecs-eks-gke'), 'ecs-eks-gke', {
  aws: 'ECS task/service and EKS Kubernetes concepts',
  gcp: 'GKE Kubernetes concepts',
  notes:
    'ECS tasks/services and EKS/GKE pods/controllers are not interchangeable APIs. This shared conceptual model does not imply equal features, node management or prices.',
});
