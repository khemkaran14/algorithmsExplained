function playback(bandwidth,adaptive=true,buffer=2,estimate=1,seconds=2){let stall=0,segment=0;const history=[];
for(const capacity of bandwidth){if(capacity===0){stall+=Math.max(0,seconds-buffer);buffer=Math.max(0,buffer-seconds);history.push({segment,quality:null,buffer});continue;}
const budget=estimate*(buffer<seconds?0.7:1);let quality=4;if(adaptive){quality=0.5;for(const rate of [0.5,1,2,4])if(rate<=budget)quality=rate;}
const duration=quality*seconds/capacity;stall+=Math.max(0,duration-buffer);buffer=Math.max(0,buffer-duration)+seconds;
estimate=0.7*estimate+0.3*capacity;history.push({segment:segment++,quality,buffer});}
return {stall,downloaded:segment,history};}
// A rendition is chosen from prior knowledge; outage intervals do not skip media segments.
