// Capacity and budget evidence; security/operations remain separate review checks.
function capacityReview(replicas,zones,capacity,peak,assumedMonthlyRate,budget) {
  const placement=Array(zones).fill(0);
  for(let i=0;i<replicas;i++)placement[i%zones]++;
  const surviving=replicas-Math.max(...placement);
  return {placement,healthyCapacity:replicas*capacity,zoneFailureCapacity:surviving*capacity,
    peakFits:replicas*capacity>=peak,zoneLossFits:surviving*capacity>=peak,
    assumedInstanceSubtotal:replicas*assumedMonthlyRate,budgetFits:replicas*assumedMonthlyRate<=budget};
}
