import { trafficVisualizer } from '../../../../src/server/simulations/traffic';
export default trafficVisualizer({
  slug: 'alb-cloud-load-balancing',
  title: 'Application Load Balancer / Cloud Load Balancing',
  databaseCapacity: 12,
  why: 'Round-robin service work goes to healthy app replicas, with a separate database queue and budget. Fail one app target or the database and inspect the completed, pending and rejected counts.',
});
