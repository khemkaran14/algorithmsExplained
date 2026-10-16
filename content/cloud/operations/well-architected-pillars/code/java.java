import java.util.*;
class Reference {
record CapacityReview(int[] placement,int healthy,int surviving,boolean peakFits,boolean zoneLossFits,double assumedSubtotal,boolean budgetFits) {}
static CapacityReview capacityReview(int replicas,int zones,int capacity,int peak,double assumedMonthlyRate,double budget) {
  int[] placement=new int[zones];for(int i=0;i<replicas;i++)placement[i%zones]++;
  int surviving=replicas-Arrays.stream(placement).max().orElse(0);
  return new CapacityReview(placement,replicas*capacity,surviving*capacity,replicas*capacity>=peak,surviving*capacity>=peak,replicas*assumedMonthlyRate,replicas*assumedMonthlyRate<=budget);
}
}
