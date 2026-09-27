import test from 'node:test';
import assert from 'node:assert/strict';
import { createVillaEntry } from '../src/utils/villaEntry.js';
function fixture(){
 let time=0,renderedFrames=0,layout=null,fonts=true,overview=true,nav={phase:'overview-closed',moving:false,camera:[0,0,0],target:[0,0,0]};
 const shown=[],jumps=[];
 const api={setWindow(r){if(r&&r.id!==nav.camera[0]){nav.camera=[r.id,20,50];nav.moving=true;}},jump(){jumps.push(time);nav.moving=false;},navigation:()=>nav,metrics:()=>({renderedFrames})};
 const gate=createVillaEntry({api,measure:()=>layout,onReady:x=>shown.push(x),fontsReady:()=>fonts,isOverview:()=>overview,now:()=>time,requestFrame:()=>1,cancelFrame:()=>{}});
 return {gate,shown,jumps,api,set(v){if('time'in v)time=v.time;if('frames'in v)renderedFrames=v.frames;if('layout'in v)layout=v.layout;if('fonts'in v)fonts=v.fonts;if('overview'in v)overview=v.overview;if('nav'in v)nav=v.nav;},update(){gate.update();}};
}
const view=(id=1)=>({rect:{id,x:300,y:100,w:800,h:600},signature:String(id)});
test('no canvas-wide frame can be revealed before a measured, rendered fit',()=>{const f=fixture();f.update();assert.equal(f.gate.ready,false);f.set({layout:view()});f.update();assert.equal(f.jumps.length,1);f.set({time:200});f.update();assert.equal(f.gate.ready,false);f.set({frames:1});f.update();assert.equal(f.gate.ready,true);assert.deepEqual(f.shown[0].pose.camera,[1,20,50]);});
test('a layout/font change before entry resets the stability and render requirements',()=>{const f=fixture();f.set({layout:view()});f.update();f.set({time:170,frames:1,fonts:false});f.update();assert.equal(f.gate.ready,false);f.set({fonts:true,layout:view(2)});f.update();f.set({time:350,frames:1});f.update();assert.equal(f.gate.ready,false);f.set({frames:2});f.update();assert.equal(f.gate.ready,true);assert.equal(f.shown[0].pose.camera[0],2);});
test('once shown, the entry gate no longer jumps later navigation',()=>{const f=fixture();f.set({layout:view()});f.update();f.set({time:200,frames:1});f.update();const n=f.jumps.length;f.api.setWindow({id:7});f.update();assert.equal(f.api.navigation().moving,true);assert.equal(f.jumps.length,n);assert.equal(f.shown.length,1);});
test('manual focus before presentation is not replaced by an overview jump',()=>{const f=fixture();f.set({overview:false,layout:view(),nav:{phase:'opening',moving:true,camera:[1,2,3],target:[0,0,0]}});f.update();assert.equal(f.jumps.length,0);f.set({time:250,frames:1});f.update();assert.equal(f.gate.ready,false);f.set({nav:{phase:'room',moving:false,camera:[1,2,3],target:[0,0,0]}});f.update();assert.equal(f.gate.ready,true);assert.equal(f.shown[0].pose.phase,'room');});
test('disposing during loading never reveals a stale model',()=>{const f=fixture();f.set({layout:view()});f.update();f.gate.dispose();f.set({time:500,frames:4});f.update();assert.equal(f.gate.ready,false);assert.equal(f.shown.length,0);});
