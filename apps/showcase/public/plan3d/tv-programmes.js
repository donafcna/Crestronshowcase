// Original silent programmes painted locally: no video download or third-party player.
// Called at 15 fps only for the visible television.
export function drawProgramme(g, source, seconds, channel=0) {
  const W=1024,H=576,t=seconds;
  const kind=(source-1+channel)%4;
  const rect=(color,x,y,w,h)=>{g.fillStyle=color;g.fillRect(x,y,w,h);};
  const circle=(color,x,y,r)=>{g.fillStyle=color;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();};
  const line=(color,x1,y1,x2,y2,width=2)=>{g.strokeStyle=color;g.lineWidth=width;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();};
  g.save();g.textAlign='left';
  if(kind===0){
    // Cinematic alpine journey: parallax ridgelines, lake reflections and passing train.
    const sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#1e405b');sky.addColorStop(.55,'#e9ba88');sky.addColorStop(1,'#384f58');g.fillStyle=sky;g.fillRect(0,0,W,H);
    circle('#f6d19d',780,185,43);
    for(let layer=0;layer<4;layer++){
      g.fillStyle=['#778387','#697775','#475c5d','#263e42'][layer];g.beginPath();g.moveTo(0,H);
      for(let x=-40;x<=1080;x+=20){const xx=x+t*(3+layer*4);const y=220+layer*55+Math.sin(xx*.009+layer)*55+Math.sin(xx*.024+layer)*26;g.lineTo(x,y);}g.lineTo(W,H);g.fill();
    }
    rect('#497076',0,415,W,130);for(let i=0;i<22;i++)line('rgba(242,207,154,.18)',(i*103+t*5)%1024,425+i*5,(i*103+t*5)%1024+75,425+i*5,2);
    line('#233434',0,431,W,400,13);
    const trainX=(t*37)%1400-250;for(let i=0;i<4;i++){rect('#c8c6b0',trainX+i*61,390-(trainX+i*61)*.03,58,25);for(let j=0;j<4;j++)rect('#1c3945',trainX+i*61+5+j*13,395-(trainX+i*61)*.03,9,10);}
    rect('#070c12',0,0,W,58);rect('#070c12',0,H-58,W,58);
    g.fillStyle='#eee7d7';g.font='22px Georgia';g.fillText('LA TRAVERSÉE DES ALPES',52,H-22);
  }else if(kind===1){
    // Formula-style race with continuously moving cars, kerbs and broadcast timing.
    rect('#496a43',0,0,W,H);g.lineWidth=130;g.strokeStyle='#bab4a7';g.beginPath();g.ellipse(525,310,348,170,-.12,0,Math.PI*2);g.stroke();g.lineWidth=102;g.strokeStyle='#454a4d';g.stroke();
    for(let i=0;i<74;i++){const a=i/74*Math.PI*2;circle(i%2?'#faf3e8':'#bd4538',525+403*Math.cos(a),310+218*Math.sin(a),5);}
    for(let i=0;i<7;i++){const a=t*.4+i*.75,x=525+345*Math.cos(a),y=310+165*Math.sin(a);g.save();g.translate(x,y);g.rotate(Math.atan2(165*Math.cos(a),-345*Math.sin(a)));rect('#151b20',-13,-23,26,46);rect(['#df4336','#33b0b3','#25468d','#f6ad33'][i%4],-9,-22,18,43);rect('#111820',-19,-14,38,7);rect('#111820',-18,13,36,8);g.restore();}
    rect('#102029',28,84,163,194);g.fillStyle='#fff';g.font='20px Arial';['1  ROS   1:23.42','2  MAR   +0.82','3  LUC   +1.64','4  BEN   +2.07'].forEach((s,i)=>g.fillText(s,40,119+i*43));
  }else if(kind===2){
    // Football: moving players, passes and a travelling broadcast ball.
    for(let i=0;i<12;i++)rect(i%2?'#347f48':'#408f4f',i*86,0,86,H);
    g.strokeStyle='#e4eddf';g.lineWidth=3;g.strokeRect(54,75,916,435);line('#e4eddf',512,75,512,510);g.beginPath();g.arc(512,292,64,0,7);g.stroke();g.strokeRect(54,181,126,220);g.strokeRect(844,181,126,220);
    for(let team=0;team<2;team++)for(let i=0;i<11;i++){const x=110+(i%4)*170+team*165+Math.sin(t*.9+i)*24,y=118+Math.floor(i/4)*152+Math.cos(t*1.2+i)*32;circle('rgba(0,0,0,.2)',x+3,y+4,10);circle(team?'#f0e6d5':'#c34242',x,y,9);circle('#cea887',x,y-7,3);}
    const bx=512+Math.sin(t*.75)*280,by=295+Math.sin(t*1.37)*138;circle('#111',bx+2,by+3,6);circle('#fff',bx,by,5);
  }else{
    // Tennis: rally, racket swings and bouncing ball on a clay court.
    rect('#2f6054',0,0,W,H);rect('#bd7352',206,64,612,462);g.strokeStyle='#f4e8cf';g.lineWidth=3;g.strokeRect(251,85,522,419);g.strokeRect(316,85,392,419);g.strokeRect(316,179,392,232);line('#f4e8cf',512,179,512,411);rect('#dedfd3',230,287,565,4);
    for(let x=235;x<795;x+=13)line('rgba(235,235,225,.65)',x,290,x,315,1);
    for(let i=0;i<2;i++){const x=512+Math.sin(t*1.4+i*2)*132,y=i?451:132;circle(i?'#2f4b92':'#f4e6c4',x,y,12);circle('#d7b086',x,y-10,5);g.strokeStyle='#e8e8d2';g.lineWidth=3;g.beginPath();g.ellipse(x+23*Math.sin(t*5),y+10,9,15,.5,0,7);g.stroke();}
    circle('#dcec63',512+Math.sin(t*1.4)*130,292+Math.sin(t*3)*164,6);
  }
  if(kind){
    rect('rgba(7,18,27,.91)',24,20,kind===2?346:300,48);g.fillStyle='#fff';g.font='bold 22px Arial';g.fillText(kind===1?'GRAND PRIX  ·  TOUR 18/52':kind===2?'ALP  2 — 1  LAC   '+(67+Math.floor(t/60))+':'+String(Math.floor(t)%60).padStart(2,'0'):'ALPINE OPEN   6–4   30 : 15',40,51);
    rect('#c94d47',892,24,108,31);g.fillStyle='#fff';g.font='bold 16px Arial';g.fillText('EN DIRECT',902,46);
  }
  g.restore();return ['film','race','football','tennis'][kind];
}
