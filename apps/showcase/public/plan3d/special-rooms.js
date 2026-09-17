import * as T from './vendor/three.module.min.js';

// Local, shared geometry: no model downloads or additional rendering context.
export function furnishSpecialRoom(R,M){
 const {w,d,type}=R.cfg,g=R.group;
 if(!['garage','sauna'].includes(type))return;
 const mat=(color,roughness=.7,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const dark=mat(0x242d33),metal=mat(0xabb5bb,.25,.8),rubber=mat(0x11161a,1),wood=M.boisClair;
 const box=(p,m,x,y,z,a,b,c)=>{const o=new T.Mesh(new T.BoxGeometry(a,b,c),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;p.add(o);return o;};
 const cyl=(p,m,x,y,z,r,h)=>{const o=new T.Mesh(new T.CylinderGeometry(r,r,h,24),m);o.position.set(x,y,z);p.add(o);return o;};
 const ball=(p,m,x,y,z,a,b,c)=>{const o=new T.Mesh(new T.SphereGeometry(1,20,12),m);o.position.set(x,y,z);o.scale.set(a,b,c);p.add(o);return o;};
 const tile=(color,lines)=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle=color;x.fillRect(0,0,256,256);x.strokeStyle=lines;x.lineWidth=2;for(let n=0;n<=256;n+=64){x.beginPath();x.moveTo(n,0);x.lineTo(n,256);x.moveTo(0,n);x.lineTo(256,n);x.stroke();}const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(3,3);return new T.MeshStandardMaterial({map:tex,roughness:.55});};
 const floor=tile(type==='garage'?'#787d7b':'#c8c6ba',type==='garage'?'#727774':'#aaa99d');box(g,floor,w/2,.043,d/2,w-.18,.04,d-.18);
 const e0=R.lamps[0].mat,e1=R.lamps[1].mat;
 if(type==='sauna'){
  const mosaic=tile('#738e89','#b7c5bb'),stone=tile('#d9d7c9','#b9b9b0'),glass=new T.MeshStandardMaterial({color:0xb6d5d0,transparent:true,opacity:.14,roughness:.15,depthWrite:false,side:T.DoubleSide});
  const cw=(w-.75)/2,front=3.65,height=2.7;
  // Two sealed volumes, seen in architectural section through the omitted ceilings.
  for(const [i,skin] of [wood,mosaic].entries()){
   const x=.25+i*(cw+.22),center=x+cw/2;
   box(g,skin,center,height/2,.24,cw,height,.18);box(g,skin,x,height/2,front/2,.15,height,front);box(g,skin,x+cw,height/2,front/2,.15,height,front);
   box(g,skin,center,height-.06,front/2,cw,.12,front); // ceiling, kept separate for the cutaway
   const ceiling=g.children[g.children.length-1];ceiling.visible=false;ceiling.userData.animated=true;ceiling.name='Cabin ceiling (section view)';
   box(g,glass,center,height/2,front,cw,height,.025);
   for(const xx of [x,x+cw,center-.45,center+.45])box(g,metal,xx,height/2,front,.035,height,.055);
   for(const yy of [.03,height])box(g,metal,center,yy,front,cw,.035,.055);
   box(g,metal,center+.33,1.25,front+.07,.025,.35,.035);
   if(i===0){
    for(let k=0;k<32;k++)box(g,wood,x+.12+k*(cw-.24)/32,1.35,.355,.075,2.6,.045);
    for(const [z,y] of [[.72,.9],[1.25,.47]]){box(g,wood,center,y,z,cw-.4,.12,.7);for(let n=0;n<8;n++)box(g,M.bois,center,y+.067,z-.29+n*.083,cw-.45,.016,.016);}
    const heater=box(g,dark,x+cw-.6,.52,2.55,.56,.85,.56);heater.name='Electric sauna heater';
    const heat=mat(0x3f3128);heat.emissive.setHex(0xff5a0b);heat.emissiveIntensity=0;
    for(let n=0;n<15;n++){const xx=x+cw-.8+(n%4)*.13,zz=2.36+Math.floor(n/4)*.12;ball(g,n%3?dark:heat,xx,.99,zz,.075,.05,.08);}
    for(const z of [2.12,2.99])box(g,wood,x+cw-.6,.8,z,.95,.065,.055);
    for(const xx of [x+cw-1.05,x+cw-.15])box(g,wood,xx,.43,2.55,.055,.86,.93);
    R.wellness={saunaOn:false,hammamOn:false,humidity:50,heat,steam:[]};
   }else{
    box(g,mosaic,center,.42,.77,cw-.3,.74,1);box(g,mosaic,x+cw-.58,.42,2.1,.85,.74,2);
    box(g,stone,center,.82,.77,cw-.25,.07,1.04);box(g,stone,x+cw-.58,.82,2.1,.88,.07,2.05);
    cyl(g,metal,x+.4,.24,2.9,.07,.11).rotation.x=Math.PI/2;
    // A handful of soft translucent volumes, animated only while this room is visible.
    for(let n=0;n<9;n++){const o=ball(g,new T.MeshBasicMaterial({color:0xe6f0ed,transparent:true,opacity:0,depthWrite:false}),x+.65+(n%3)*1.1,.6+Math.floor(n/3)*.65,1.2+(n%2)*1.25,.75,.3,.5);o.userData.animated=true;o.userData.baseY=o.position.y;R.wellness.steam.push(o);}
   }
   box(g,e0,center,2.55,.38,cw-.35,.025,.03);box(g,e1,center,.34,.7,cw-.45,.025,.04);
  }
  // Shared tiled vestibule: shower behind glass, drain, towels and vanity.
  box(g,stone,w-1.25,.075,d-1.05,2,.07,1.8);box(g,glass,w-2.3,1.2,d-1,.025,2.4,1.9);
  box(g,stone,w-.25,1.35,d-1,.13,2.7,1.9);cyl(g,metal,w-.45,2.3,d-1,.022,.65).rotation.z=Math.PI/2;
  cyl(g,metal,w-.78,2.32,d-1,.19,.03);cyl(g,metal,w-.35,1.5,d-1,.025,1.5);
  box(g,dark,w-1.2,.12,d-1.4,1.25,.018,.06);box(g,wood,1.45,.44,d-.65,2.2,.7,.7);box(g,stone,1.45,.83,d-.65,2.3,.07,.75);
  for(let n=0;n<4;n++)box(g,M.blanc,.7,.91+n*.055,d-.65,.55,.04,.38);
  const basin=ball(g,M.blanc,2,.95,d-.6,.36,.14,.27);basin.name='Wellness washbasin';cyl(g,metal,2,1.15,d-.85,.022,.5);
  R.decor={style:'wellness-two-sealed-cabins',cabins:2,shower:true,tiledFloor:true};return;
 }
 // Garage: smooth longitudinal body sections distinguish a low mid-engine coupe
 // from a rounder rear-engine grand tourer, inspired by Italian/German sports cars.
 function shell(parent,material,profiles){
  const curves=[0,1,2].map(k=>new T.CatmullRomCurve3(profiles.map(p=>new T.Vector3(p[0],p[k+1],0)))),vertices=[],indices=[],rings=42,sides=32;
  for(let i=0;i<=rings;i++){const t=i/rings,z=curves[0].getPoint(t).x,width=curves[0].getPoint(t).y,center=curves[1].getPoint(t).y,height=curves[2].getPoint(t).y;for(let k=0;k<=sides;k++){const a=k/sides*Math.PI*2;vertices.push(Math.cos(a)*width,center+Math.sin(a)*height,z);}}
  for(let i=0;i<rings;i++)for(let k=0;k<sides;k++){const a=i*(sides+1)+k,b=a+sides+1;indices.push(a,a+1,b,b,a+1,b+1);}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();const o=new T.Mesh(geo,material);o.castShadow=o.receiveShadow=true;parent.add(o);return o;
 }
 const models=[];
 for(const [i,color] of [0xa92525,0xb9c2c5].entries()){
  const car=new T.Group();car.position.set(i?w*.73:w*.27,0,d*.54);g.add(car);car.name=i?'Rounded rear-engine grand tourer':'Low mid-engine sports coupe';models.push(car.name);
  const paint=mat(color,.24,.5),glazing=mat(0x172e39,.18,.3);
  shell(car,paint,i?[[-2.08,.04,.52,.09],[-1.87,.68,.58,.22],[-1.23,.9,.64,.3],[0,.83,.64,.24],[1.27,.87,.61,.29],[1.92,.64,.52,.2],[2.07,.05,.5,.06]]:[[-2.05,.04,.53,.07],[-1.82,.82,.59,.24],[-1.12,.92,.64,.28],[0,.84,.56,.22],[1.2,.87,.52,.22],[1.92,.75,.44,.16],[2.1,.05,.42,.06]]);
  shell(car,glazing,i?[[-1.52,.03,.83,.01],[-1.16,.52,1.02,.16],[-.4,.63,1.19,.19],[.32,.57,1.15,.17],[.91,.5,.85,.09],[1.08,.02,.77,.01]]:[[-1.23,.02,.81,.01],[-.72,.55,1.05,.12],[.05,.58,1.08,.13],[.69,.5,.81,.1],[.94,.02,.74,.01]]);
  ball(car,paint,0,i?1.36:1.205,i?-.4:.04,i?.50:.46,.06,i?.39:.3);
  for(const side of [-1,1]){
   box(car,dark,side*.9,.87,.35,.2,.035,.035);
   ball(car,paint,side*.98,.91,.35,.12,.065,.12);box(car,metal,side*.865,.69,-.05,.013,.025,.15);
   for(const z of [-1.27,1.27]){
    const wheel=new T.Mesh(new T.TorusGeometry(.255,.085,10,32),rubber);wheel.rotation.y=Math.PI/2;wheel.position.set(side*.87,.35,z);car.add(wheel);
    const disc=cyl(car,metal,side*.95,.35,z,.215,.025);disc.rotation.z=Math.PI/2;
    const inner=cyl(car,dark,side*.967,.35,z,.18,.028);inner.rotation.z=Math.PI/2;
    for(let k=0;k<5;k++){const a=k*Math.PI*2/5,spoke=box(car,metal,side*.985,.35+Math.sin(a)*.09,z+Math.cos(a)*.09,.024,.033,.19);spoke.rotation.x=-a;}
   }
   if(i){const light=ball(car,M.blanc,side*.65,.65,1.7,.125,.035,.16);light.rotation.x=.25;}
   else {const light=box(car,M.blanc,side*.64,.59,1.8,.08,.026,.34);light.rotation.y=side*.35;}
   box(car,mat(0x842122,.3),side*.6,.65,-1.95,.32,.07,.03);box(car,dark,side*.53,.37,1.97,.49,.13,.06);
   const exhaust=cyl(car,metal,side*.55,.3,-1.99,.06,.15);exhaust.rotation.x=Math.PI/2;
  }
  box(car,dark,0,.34,2.02,.45,.09,.035);box(car,metal,0,.47,2.04,.28,.055,.013);
  for(const side of [-1,1])box(g,M.blanc,car.position.x+side*1.03,.069,d*.55,.035,.012,d-.6);
 }
 box(g,dark,w/2,1.25,.19,w-.4,2.3,.12);box(g,metal,w/2,.94,.46,w-1.1,.08,.64);
 for(let n=0;n<8;n++){box(g,n%2?dark:metal,.5+n*(w-1)/8,.43,.45,(w-.9)/8,.85,.52);box(g,metal,.5+n*(w-1)/8,.69,.73,.23,.025,.025);}
 for(let n=0;n<15;n++){const x=.55+n*(w-1.1)/15;box(g,metal,x,1.7+(n%2)*.17,.29,.025,.23,.025);cyl(g,metal,x,1.84+(n%2)*.17,.3,.033,.014).rotation.x=Math.PI/2;}
 for(const x of [1.4,w-1.4])box(g,e0,x,2.75,d/2,.12,.055,d-.5);
 box(g,dark,.28,1.32,d-.8,.23,.57,.35);box(g,e1,.41,1.45,d-.8,.015,.06,.17);
 const cable=new T.Mesh(new T.TorusGeometry(.23,.018,6,24),rubber);cable.rotation.y=Math.PI/2;cable.position.set(.45,.7,d-.8);g.add(cable);
 cyl(g,mat(0xb62d29),w-.4,.43,d-.45,.11,.66);box(g,metal,w-.4,.83,d-.45,.15,.09,.05);
 R.decor={style:'automotive-workshop',cars:models,tiledFloor:true};
}
