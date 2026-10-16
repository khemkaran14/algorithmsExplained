#include <bits/stdc++.h>
using namespace std;
struct CapacityReview { vector<int> placement;int healthy,surviving;bool peakFits,zoneLossFits;double assumedSubtotal;bool budgetFits; };
CapacityReview capacityReview(int replicas,int zones,int capacity,int peak,double assumedMonthlyRate,double budget) {
  vector<int> placement(zones);for(int i=0;i<replicas;i++)placement[i%zones]++;
  int surviving=replicas-*max_element(placement.begin(),placement.end());
  return {placement,replicas*capacity,surviving*capacity,replicas*capacity>=peak,surviving*capacity>=peak,replicas*assumedMonthlyRate,replicas*assumedMonthlyRate<=budget};
}
