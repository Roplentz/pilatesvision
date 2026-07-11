import { it } from "vitest";
import { sampleFromLandmarks, summarizeSamples, type Landmark } from "@/lib/poseMetrics";
function synth(hipY:number,kneeAngle:number):Landmark[]{const l=Array.from({length:33},()=>({x:0.5,y:0.5,visibility:0.9}));l[0]={x:0.5,y:0.15,visibility:0.95};l[11]={x:0.42,y:0.30,visibility:0.9};l[12]={x:0.58,y:0.30,visibility:0.9};l[23]={x:0.44,y:hipY,visibility:0.9};l[24]={x:0.56,y:hipY,visibility:0.9};const o=(kneeAngle/180)*0.15+0.05;l[25]={x:0.44,y:hipY+o,visibility:0.9};l[26]={x:0.56,y:hipY+o,visibility:0.9};l[27]={x:0.44,y:hipY+o+0.20,visibility:0.9};l[28]={x:0.56,y:hipY+o+0.20,visibility:0.9};return l;}
it("dbg", () => {
const s=[];for(let i=0;i<72;i++){const p=(i%24)/24;const y=0.45+0.10*Math.sin(p*Math.PI);const k=180-(y-0.45)*400;const smp=sampleFromLandmarks(synth(y,k),i/10); if(smp)s.push(smp);}
const dur=s[s.length-1].t;
const summary=summarizeSamples(s,dur,"squat");
console.log("total",summary.reps_total,"valid",summary.reps_valid);
console.log("reps",JSON.stringify(summary.reps));
console.log("stats",JSON.stringify(summary.summary_stats));
});
