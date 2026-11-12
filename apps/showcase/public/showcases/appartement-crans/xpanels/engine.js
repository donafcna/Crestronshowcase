/* Processor-independent executable reference model. Demo only; live mode never stores scene data in the browser. */
(function(scope){
 'use strict';
 function createEngine(config,stored){
  const n=config.lights.length,sh=config.shades.length+config.shadeGroups.length;
  const saved=stored?JSON.parse(JSON.stringify(stored.saved||stored)):config.scenes.map(s=>config.lights.map(l=>l.roomId===s.roomId?({Bright:100,Evening:65,Night:25,Off:0}[s.name]||0):0));
  // Existing saved scenes keep their indices; only missing appended scenes get defaults.
  for(let i=saved.length;i<config.scenes.length;i++)saved.push(config.lights.map(l=>l.roomId===config.scenes[i].roomId?({Bright:100,Evening:65,Night:25,Off:0}[config.scenes[i].name]||0):0));
  for(const row of saved)while(row.length<n)row.push(0);
  const names=stored?.names?.slice()||config.scenes.map(s=>s.name);let draftName='';
  const state={sceneNames:names,lights:Array(n).fill(0),shades:Array(sh).fill(50),climate:Array(config.climate.length).fill(210),temperature:Array(config.climate.length).fill(215),power:Array(config.climate.length).fill(1),owner:0,scene:0,active:0,revision:0,ack:[0,0],error:[0,0]};
  let before=null,lease=0;const motion=Array(sh).fill(0);
  function members(s){return config.lights.map((l,i)=>l.roomId===config.scenes[s-1].roomId?i:-1).filter(i=>i>=0);}
  function cancel(keepLevels=false){if(state.owner){if(!keepLevels)members(state.scene).forEach(i=>state.lights[i]=before[i]);state.owner=0;state.scene=0;before=null;state.active=0;}}
  function command(client,seq,op,id,v){
   state.ack[client-1]=seq;state.error[client-1]=0;
   const fail=()=>{state.error[client-1]=1;state.revision++;return false;};
   if(![1,2].includes(client)||![seq,op,id].every(Number.isInteger)||(op!==10&&!Number.isInteger(v))||seq<1||seq>65535)return false;
   if(op===0){if(state.owner===client)lease=30;}
   else if(op===1){if(id<1||id>n||config.lights[id-1]?.retired||v<0||v>100||(state.owner&&state.owner!==client&&members(state.scene).includes(id-1)))return fail();state.lights[id-1]=v;state.active=0;if(state.owner===client&&members(state.scene).includes(id-1))lease=30;}
   else if(op===2){if(id<1||id>saved.length||(state.owner&&config.scenes[id-1].roomId===config.scenes[state.scene-1].roomId))return fail();members(id).forEach(i=>state.lights[i]=saved[id-1][i]);state.active=id;}
   else if(op===3){if(state.owner||id<1||id>saved.length)return fail();before=state.lights.slice();state.owner=client;state.scene=id;draftName=names[id-1];lease=30;members(id).forEach(i=>state.lights[i]=saved[id-1][i]);state.active=0;}
   else if(op===4){if(state.owner!==client)return fail();members(state.scene).forEach(i=>saved[state.scene-1][i]=state.lights[i]);names[state.scene-1]=draftName;state.active=state.scene;state.owner=0;state.scene=0;before=null;}
   else if(op===5){if(state.owner!==client)return fail();cancel(true);}
   else if(op===6){if(state.owner!==client)return fail();draftName=config.scenes[state.scene-1].name;const d={Bright:100,Evening:65,Night:25,Off:0}[config.scenes[state.scene-1].name]||0;members(state.scene).forEach(i=>state.lights[i]=d);lease=30;}
   else if(op===7){if(id<1||id>sh||v<0||v>2)return fail();motion[id-1]=v===1?1:v===2?-1:0;}
   else if(op===8){if(id<1||id>state.climate.length||v<160||v>300)return fail();state.climate[id-1]=v;}
   else if(op===9){if(id<1||id>state.power.length||v<0||v>1)return fail();state.power[id-1]=v;}
   else if(op===10){let name;try{name=decodeURIComponent(v);}catch{return fail();}if(state.owner!==client||id!==state.scene||!name.trim()||new TextEncoder().encode(name).length>32)return fail();draftName=name;lease=30;}
   else if(op===11){if(id<1||id>saved.length||(state.owner&&config.scenes[id-1].roomId===config.scenes[state.scene-1].roomId))return fail();members(id).forEach(i=>saved[id-1][i]=state.lights[i]);state.active=id;}
   else return fail();state.revision++;return true;
  }
  function tick(){if(state.owner&&--lease<=0)cancel();motion.forEach((m,i)=>{state.shades[i]=Math.max(0,Math.min(100,state.shades[i]+m*5));if([0,100].includes(state.shades[i]))motion[i]=0;});state.temperature.forEach((t,i)=>{if(state.power[i])state.temperature[i]+=Math.sign(state.climate[i]-t);});state.revision++;}
  return {state,command,tick,exportStore:()=>({saved:JSON.parse(JSON.stringify(saved)),names:names.slice()}),exportSaved:()=>JSON.parse(JSON.stringify(saved))};
 }
 if(typeof module!=='undefined')module.exports={createEngine};else scope.A10BenchEngine={createEngine};
})(typeof window==='undefined'?globalThis:window);
