import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const base='https://crestrongui.vercel.app';
const files=['gui.html','gui.js','yacht-exterior-core.js','yacht-scene-cycle.js','yacht-exterior-gui.js','model-bridge.js','yacht-night-finish.js','sea.js'];
const hash=data=>createHash('sha256').update(data).digest('hex');
const expected=Object.fromEntries(await Promise.all(files.map(async file=>[file,hash(await readFile(new URL('../public/ftv-luxury/'+file,import.meta.url)))])));
const deadline=Date.now()+240000;let checks=[];
while(Date.now()<deadline){
 checks=await Promise.all(files.map(async file=>{
  try{
   const response=await fetch(`${base}/ftv-luxury/${file}?verify=${Date.now()}`,{cache:'no-store',signal:AbortSignal.timeout(15000)});
   const actual=hash(Buffer.from(await response.arrayBuffer()));
   return {file,status:response.status,expected:expected[file],actual,match:response.ok&&actual===expected[file]};
  }catch(e){return {file,match:false,error:String(e)};}
 }));
 if(checks.every(c=>c.match))break;
 console.log('Waiting for Vercel:',checks.filter(c=>!c.match).map(c=>c.file).join(', '));
 await new Promise(resolve=>setTimeout(resolve,5000));
}
await mkdir('test-results',{recursive:true});
await writeFile('test-results/yacht-production.json',JSON.stringify({base,checks},null,2));
console.log(JSON.stringify({base,checks},null,2));
if(!checks.length||checks.some(c=>!c.match))process.exitCode=1;
