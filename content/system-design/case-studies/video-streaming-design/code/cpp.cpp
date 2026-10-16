#include <vector>
#include <algorithm>
struct Playback {double stall=0,buffer=2;int downloaded=0;std::vector<double>qualities;};
Playback playback(const std::vector<double>& bandwidth,bool adaptive=true){Playback out;double estimate=1,seconds=2;
for(double capacity:bandwidth){if(capacity==0){out.stall+=std::max(0.0,seconds-out.buffer);out.buffer=std::max(0.0,out.buffer-seconds);continue;}double budget=estimate*(out.buffer<seconds?0.7:1),quality=4;if(adaptive){quality=0.5;for(double r:{0.5,1.0,2.0,4.0})if(r<=budget)quality=r;}
double duration=quality*seconds/capacity;out.stall+=std::max(0.0,duration-out.buffer);out.buffer=std::max(0.0,out.buffer-duration)+seconds;
estimate=0.7*estimate+0.3*capacity;out.qualities.push_back(quality);out.downloaded++;}return out;}
