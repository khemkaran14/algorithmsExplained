import { trafficVisualizer } from '../../../../src/server/simulations/traffic';
export default trafficVisualizer({
  slug: 'ec2-compute-engine',
  title: 'EC2 / Compute Engine virtual machines',
  databaseCapacity: 12,
  why: 'Adjust app replicas and per-replica CPU work capacity. Requests enter the app pool, then the separately limited database; queues, rejected requests and completions are all accounted for. The AWS/GCP toggle changes component mappings, not a universal hardware performance claim.',
});
