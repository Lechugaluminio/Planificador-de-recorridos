/* Motor de efectos estilizados (fuego, humo, explosión, hollín, mat. peligrosos).
   FXR.attach(canvas, [{type,x,y,scale}]) dibuja en bucle mientras el canvas siga en la página. */
(function(){
  var R={};
  function rnd(a,b){return a+Math.random()*(b-a);}
  function gauss(){return (Math.random()+Math.random()+Math.random()-1.5)/1.5;}
  function soft(r,g,b,mid,size){
    var S=size||64,c=document.createElement('canvas');c.width=c.height=S;var x=c.getContext('2d'),h=S/2;
    var gr=x.createRadialGradient(h,h,0,h,h,h);
    gr.addColorStop(0,'rgba('+r+','+g+','+b+',1)');gr.addColorStop(mid,'rgba('+r+','+g+','+b+',.5)');gr.addColorStop(1,'rgba('+r+','+g+','+b+',0)');
    x.fillStyle=gr;x.fillRect(0,0,S,S);return c;
  }
  function cloud(r,g,b){
    var S=128,c=document.createElement('canvas');c.width=c.height=S;var x=c.getContext('2d');
    for(var i=0;i<22;i++){
      var a=Math.random()*6.283,d=Math.random()*30,cx=64+Math.cos(a)*d,cy=64+Math.sin(a)*d,rr=rnd(16,34);
      var gr=x.createRadialGradient(cx,cy,0,cx,cy,rr);
      var v=rnd(-14,14);
      gr.addColorStop(0,'rgba('+Math.max(0,r+v|0)+','+Math.max(0,g+v|0)+','+Math.max(0,b+v|0)+',.32)');gr.addColorStop(1,'rgba('+r+','+g+','+b+',0)');
      x.fillStyle=gr;x.beginPath();x.arc(cx,cy,rr,0,6.283);x.fill();
    }
    x.globalCompositeOperation='destination-in';
    var m=x.createRadialGradient(64,64,20,64,64,64);m.addColorStop(0,'rgba(0,0,0,1)');m.addColorStop(1,'rgba(0,0,0,0)');
    x.fillStyle=m;x.fillRect(0,0,S,S);return c;
  }
  var SP=null;
  function sprites(){
    if(SP)return SP;
    SP={core:soft(255,245,200,.25),yel:soft(255,190,60,.3),ora:soft(255,104,18,.35),red:soft(176,30,6,.4),spark:soft(255,225,150,.12,24),
        soot:soft(8,6,4,.55),glow:null,
        dark:[cloud(20,20,22),cloud(28,27,26),cloud(14,14,15),cloud(36,34,32)],
        grey:[cloud(70,68,66),cloud(90,88,85),cloud(58,57,56)],
        haz:[cloud(170,196,60),cloud(150,180,50),cloud(190,205,90)]};
    return SP;
  }
  function makeEmitter(f){
    var e={f:f,fire:[],smoke:[],spark:[],acc:{f:0,s:0,k:0},seed:Math.random()*100,soot:null};
    if(f.type==='dmg'){e.soot=[];for(var i=0;i<10;i++)e.soot.push({dx:gauss()*60,dy:gauss()*32,s:rnd(50,110),a:rnd(.22,.45)});}
    return e;
  }
  function spawnFire(e,bx,by,u,n,burst){
    for(var i=0;i<n;i++){
      if(burst){var ang=rnd(0,6.283),sp=rnd(70,220)*u;
        e.fire.push({x:bx+gauss()*45*u,y:by+gauss()*45*u,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp-60*u,l:0,m:rnd(.5,1),s:rnd(32,70)*u,bx:bx,el:1.2});}
      else e.fire.push({x:bx+gauss()*42*u,y:by+rnd(-4,8)*u,vx:rnd(-14,14)*u,vy:-rnd(120,220)*u,l:0,m:rnd(.5,1.05),s:rnd(22,42)*u,bx:bx+gauss()*10*u,el:rnd(1.5,2.2)});
    }
  }
  function spawnSpark(e,bx,by,u,n){
    for(var i=0;i<n;i++)e.spark.push({x:bx+gauss()*25*u,y:by-rnd(10,60)*u,vx:rnd(-25,25)*u,vy:-rnd(70,170)*u,l:0,m:rnd(.9,2),s:rnd(3,6)*u});
  }
  function spawnSmoke(e,bx,by,u,n,kind){
    var haz=kind==='haz';
    for(var i=0;i<n;i++){
      var set=haz?SP.haz:(kind==='grey'?SP.grey:SP.dark);
      e.smoke.push({x:bx+gauss()*30*u,y:by+rnd(-8,8)*u,vx:(haz?rnd(10,28):rnd(-6,14))*u,vy:-(haz?rnd(2,9):rnd(22,46))*u,l:0,m:haz?rnd(4.5,7):rnd(4,7),
        s:rnd(30,52)*u,g:(haz?rnd(34,56):rnd(38,70))*u,img:set[(Math.random()*set.length)|0],r:rnd(0,6.283),vr:rnd(-.25,.25),pk:haz?.32:(kind==='fsmoke'?.28:(kind==='grey'?.3:.4))});
    }
  }
  R.attach=function(cv,effects){
    var ctx=cv.getContext('2d'),sp=sprites(),W=0,H=0,dpr=1;
    function size(){var r=cv.getBoundingClientRect();dpr=Math.min(2,window.devicePixelRatio||1);W=r.width;H=r.height;cv.width=Math.max(1,Math.round(W*dpr));cv.height=Math.max(1,Math.round(H*dpr));}
    size();
    var em=(effects||[]).map(makeEmitter),last=performance.now(),alive=true,warm=true;
    function emit(e,key,rate,dt){e.acc[key]+=dt*rate;var n=e.acc[key]|0;e.acc[key]-=n;return n;}
    function update(e,dt,t,U){
      var f=e.f,sc=f.scale||1,u=U*sc,bx=f.x*W,by=f.y*H,su=Math.sqrt(sc),i,p;
      if(f.type==='fire'){spawnFire(e,bx,by,u,emit(e,'f',260*su,dt),false);spawnSmoke(e,bx,by-170*u,u,emit(e,'s',8*su,dt),'fsmoke');spawnSpark(e,bx,by,u,emit(e,'k',7*su,dt));}
      else if(f.type==='exp'){spawnFire(e,bx,by,u,emit(e,'f',300*su,dt),true);spawnSmoke(e,bx,by-110*u,u,emit(e,'s',10*su,dt),'fsmoke');spawnSpark(e,bx,by,u,emit(e,'k',22*su,dt));}
      else if(f.type==='smoke'){spawnSmoke(e,bx,by,u,emit(e,'s',17*su,dt),'dark');}
      else if(f.type==='haz'){spawnSmoke(e,bx,by,u,emit(e,'s',12*su,dt),'haz');}
      var exp=f.type==='exp';
      for(i=e.fire.length-1;i>=0;i--){p=e.fire[i];p.l+=dt;if(p.l>=p.m){e.fire.splice(i,1);continue;}
        p.vx+=((p.bx-p.x)*(exp?0.5:2.8))*dt+Math.sin(t*8+p.y*0.04+e.seed)*44*u*dt;p.vy*=0.994;p.x+=p.vx*dt;p.y+=p.vy*dt;}
      for(i=e.spark.length-1;i>=0;i--){p=e.spark[i];p.l+=dt;if(p.l>=p.m){e.spark.splice(i,1);continue;}
        p.vx+=Math.sin(t*5+i)*60*u*dt;p.vy+=18*u*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;}
      for(i=e.smoke.length-1;i>=0;i--){p=e.smoke[i];p.l+=dt;if(p.l>=p.m||p.y<-300){e.smoke.splice(i,1);continue;}
        p.vx+=(Math.sin(t*.7+p.r*3)*5+3)*u*dt;p.vy*=0.998;p.x+=p.vx*dt;p.y+=p.vy*dt;p.r+=p.vr*dt;}
      if(e.fire.length>900)e.fire.splice(0,e.fire.length-900);
      if(e.smoke.length>260)e.smoke.splice(0,e.smoke.length-260);
    }
    function drawSmoke(e){
      for(var i=0;i<e.smoke.length;i++){var p=e.smoke[i],k=p.l/p.m,a=Math.min(1,k/.15)*Math.pow(1-k,1.3)*p.pk,s=p.s+p.g*p.l;
        ctx.globalAlpha=a;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.drawImage(p.img,-s/2,-s/2,s,s);ctx.restore();}
    }
    function drawFire(e,t,U){
      var f=e.f,u=U*(f.scale||1),bx=f.x*W,by=f.y*H;
      var fl=.72+.28*Math.sin(t*12+e.seed)*Math.sin(t*4.7+e.seed*2);
      var gr=(f.type==='exp'?340:240)*u,gy=by-60*u;
      var g=ctx.createRadialGradient(bx,gy,0,bx,gy,gr);
      g.addColorStop(0,'rgba(255,140,40,'+(.26*fl)+')');g.addColorStop(.45,'rgba(255,80,10,'+(.1*fl)+')');g.addColorStop(1,'rgba(255,50,0,0)');
      ctx.globalAlpha=1;ctx.fillStyle=g;ctx.fillRect(bx-gr,gy-gr,gr*2,gr*2);
      for(var i=0;i<e.fire.length;i++){var p=e.fire[i],k=p.l/p.m,w=p.s*(1-k*.5),h=w*p.el;
        var img,a;
        if(k<.15){img=sp.core;a=.3;}else if(k<.4){img=sp.yel;a=.5*(1-k);}else if(k<.68){img=sp.ora;a=.55*(1-k);}else{img=sp.red;a=.6*(1-k);}
        ctx.globalAlpha=a;ctx.drawImage(img,p.x-w/2,p.y-h*.62,w,h);}
      for(var j=0;j<e.spark.length;j++){var q=e.spark[j],kk=q.l/q.m;ctx.globalAlpha=(1-kk)*.9;ctx.drawImage(sp.spark,q.x-q.s,q.y-q.s,q.s*2,q.s*2);}
    }
    function drawSoot(e,U){
      var f=e.f,u=U*(f.scale||1),bx=f.x*W,by=f.y*H;
      for(var i=0;i<e.soot.length;i++){var b=e.soot[i],s=b.s*u;ctx.globalAlpha=b.a;ctx.drawImage(sp.soot,bx+b.dx*u-s/2,by+b.dy*u-s/2,s,s);}
    }
    function frame(now){
      if(!alive||!cv.isConnected){alive=false;return;}
      var r=cv.getBoundingClientRect();if(Math.abs(r.width-W)>1||Math.abs(r.height-H)>1)size();
      var dt=Math.min(.05,(now-last)/1000);last=now;var t=now/1000,U=W/1000;
      if(warm&&W>0){warm=false;for(var w=0;w<150;w++)for(var j=0;j<em.length;j++)update(em[j],1/30,t-5+w/30,U);}
      for(var j2=0;j2<em.length;j2++)update(em[j2],dt,t,U);
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
      ctx.globalCompositeOperation='source-over';
      em.forEach(function(e){if(e.soot)drawSoot(e,U);});
      em.forEach(drawSmoke);
      ctx.globalCompositeOperation='lighter';
      em.forEach(function(e){if(e.f.type==='fire'||e.f.type==='exp')drawFire(e,t,U);});
      ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return {stop:function(){alive=false;}};
  };
  window.FXR=R;
})();
