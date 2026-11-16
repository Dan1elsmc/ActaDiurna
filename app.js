const R=[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
const RE=/^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
function toRoman(n){let s='';for(const[v,r]of R)while(n>=v){s+=r;n-=v}return s}
function parts(n){const a=[];for(const[v,r]of R)while(n>=v){a.push([r,v]);n-=v}return a}
function fromRoman(s){const m={I:1,V:5,X:10,L:50,C:100,D:500,M:1000};let n=0;for(let i=0;i<s.length;i++){const a=m[s[i]],b=m[s[i+1]]||0;n+=a<b?-a:a}return n}
const desglose=x=>parts(x).map(a=>a[0]+' ('+a[1]+')').join(' + ');

/* Fecha */
const hoy=new Date(),MES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
document.getElementById('fecha').textContent='Hoy es el '+toRoman(hoy.getDate())+' de '+MES[hoy.getMonth()]+' del año '+toRoman(hoy.getFullYear()+753)+' desde la fundación de Roma';

/* Transiciones: dibujos que se revelan, menú activo y barra de lectura */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('v');io.unobserve(e.target)}}),{threshold:.25});
document.querySelectorAll('.rev').forEach(el=>io.observe(el));
const V=[...document.querySelectorAll('.vista')],enl=[...document.querySelectorAll('nav a')];
function ruta(){let h=location.hash.slice(1)||'portada';if(!V.some(v=>v.id==='v-'+h))h='portada';
V.forEach(v=>v.hidden=v.id!=='v-'+h);enl.forEach(a=>a.getAttribute('href')==='#'+h?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'));scrollTo(0,0)}
addEventListener('hashchange',ruta);ruta();
const pb=document.getElementById('pb');
addEventListener('scroll',()=>{const h=document.documentElement;pb.style.transform='scaleX('+(h.scrollTop/(h.scrollHeight-h.clientHeight||1))+')'},{passive:true});

/* Pestañas del Ludus */
document.querySelectorAll('.pest button').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('.pest button').forEach(x=>x.setAttribute('aria-selected',x===b));
  document.querySelectorAll('.gp').forEach(g=>g.hidden=g.id!==b.dataset.p);
});

/* Conversor */
const inp=document.getElementById('entrada'),sal=document.getElementById('salida');
inp.oninput=()=>{
  const t=inp.value.trim().toUpperCase();
  if(!t){sal.textContent='Escribe un número del 1 al 3999 o un número romano.';return}
  if(/^\d+$/.test(t)){
    const x=+t;
    if(x<1||x>3999){sal.textContent='Este conversor llega de 1 a 3999. Para cifras mayores los romanos ponían una barra sobre la letra, que multiplicaba por mil.';return}
    sal.innerHTML='<strong class="res">'+toRoman(x)+'</strong><br>'+desglose(x);return;
  }
  if(RE.test(t)){const x=fromRoman(t);sal.innerHTML='<strong class="res">'+x+'</strong><br>'+desglose(x);return}
  sal.textContent='No es un número romano válido. Recuerda: I, X, C y M se repiten hasta tres veces; V, L y D no se repiten; y solo se resta con IV, IX, XL, XC, CD y CM.';
};

/* Examen del centurión */
const qz=document.getElementById('qz');let n=0,ok=0;
function pregunta(){
  const max=n<3?39:n<6?399:3999,v=1+Math.floor(Math.random()*max),aRom=Math.random()<.5;
  const f=x=>aRom?toRoman(x):String(x);
  const ds=[1,-1,4,-4,5,-5,9,-9,10,-10,40,-40,50,-50,100,-100].sort(()=>Math.random()-.5);
  const o=[v];
  for(const d of ds){const m=v+d;if(m>0&&m<4000&&!o.includes(m))o.push(m);if(o.length===4)break}
  o.sort(()=>Math.random()-.5);
  qz.innerHTML='<p class="prog">Pregunta '+(n+1)+' de 10</p><p class="enun">'+(aRom?'¿Cómo se escribe '+v+' en números romanos?':'¿Qué número es '+toRoman(v)+'?')+'</p><div class="ops">'+o.map(x=>'<button data-x="'+x+'">'+f(x)+'</button>').join('')+'</div><div id="fb" aria-live="polite"></div>';
  qz.querySelectorAll('.ops button').forEach(b=>b.onclick=()=>responde(b,v));
}
function responde(b,v){
  const acierto=+b.dataset.x===v;if(acierto){ok++;pt('exam',1)}n++;
  qz.querySelectorAll('.ops button').forEach(x=>{x.disabled=true;if(+x.dataset.x===v)x.classList.add('bien');else if(x===b)x.classList.add('mal')});
  document.getElementById('fb').innerHTML=(acierto?'Correcto. ':'No es esa. ')+toRoman(v)+' es '+v+': '+desglose(v)+'.<br><br><button class="btn" id="sig">'+(n<10?'Siguiente':'Ver resultado')+'</button>';
  document.getElementById('sig').onclick=n<10?pregunta:fin;
  document.getElementById('sig').focus();
}
function fin(){
  const rango=ok<4?'recluta':ok<7?'legionario':ok<10?'centurión':'cónsul';
  let mejor=ok;
  try{mejor=Math.max(ok,+localStorage.getItem('acta-mejor')||0);localStorage.setItem('acta-mejor',mejor)}catch(e){}
  qz.innerHTML='<p class="enun">Acertaste '+ok+' de 10: eres '+rango+'.</p><p>Tu mejor marca en este navegador: '+mejor+' de 10.</p><button class="btn" id="otra">Jugar otra vez</button>';
  document.getElementById('otra').onclick=()=>{n=0;ok=0;pregunta()};
}
/* Más juegos */
const $=id=>document.getElementById(id),sh=a=>a.sort(()=>Math.random()-.5),rnd=k=>1+Math.floor(Math.random()*k);
function mcq(el,pre,opts,ok,expl,next,label){
  el.innerHTML=pre+'<div class="ops">'+opts.map(o=>'<button>'+o+'</button>').join('')+'</div><div class="fb" aria-live="polite"></div>';
  el.querySelectorAll('.ops button').forEach(b=>b.onclick=()=>{
    const g=b.textContent===ok;if(g)pt(el.id,1);
    el.querySelectorAll('.ops button').forEach(x=>{x.disabled=true;if(x.textContent===ok)x.classList.add('bien');else if(x===b)x.classList.add('mal')});
    const f=el.querySelector('.fb');f.innerHTML=(g?'Correcto. ':'No es esa. ')+expl+'<br><br><button class="btn">'+(label||'Siguiente')+'</button>';
    f.querySelector('button').onclick=()=>next(g);f.querySelector('button').focus();
  });
}
/* Constructor */
let tg=0,cs='';
function cons(){tg=rnd(999);cs='';
  $('cons').innerHTML='<p class="enun">Construye el número '+tg+' con estas piezas</p><p class="res" id="cs">&nbsp;</p><div class="ops">'+'IVXLCDM'.split('').map(l=>'<button data-l="'+l+'">'+l+'</button>').join('')+'</div><p><button class="btn" id="cb">Comprobar</button> <button class="btn2" id="cd">Borrar</button></p><div id="cf" aria-live="polite"></div>';
  $('cons').querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{cs+=b.dataset.l;$('cs').textContent=cs});
  $('cd').onclick=()=>{cs='';$('cs').innerHTML='&nbsp;'};
  $('cb').onclick=()=>{const v=cs&&RE.test(cs),g=v&&fromRoman(cs)===tg;
    $('cf').innerHTML=g?'Correcto: '+tg+' es '+toRoman(tg)+'. <button class="btn" id="cn">Otro número</button>':(v?'Tu número vale '+fromRoman(cs)+'. Inténtalo otra vez.':'Esa combinación no es un número romano válido.');
    if(g){pt('cons',3);$('cn').onclick=cons}};
}
/* Reloj romano */
function reloj(){
  const h=rnd(12),m=[0,15,30,45][rnd(4)-1],lab=(a,b)=>toRoman(a)+':'+(b<10?'0'+b:b);
  let num='';for(let i=1;i<=12;i++){const a=(i*30-90)*Math.PI/180;num+='<text x="'+(100+76*Math.cos(a)).toFixed(1)+'" y="'+(100+76*Math.sin(a)).toFixed(1)+'">'+(i===4?'IIII':toRoman(i))+'</text>'}
  const ok=lab(h,m),o=[ok];while(o.length<4){const x=lab(rnd(12),[0,15,30,45][rnd(4)-1]);if(!o.includes(x))o.push(x)}
  const svg='<svg viewBox="0 0 200 200" class="reloj" role="img" aria-label="Reloj con cifras romanas"><circle cx="100" cy="100" r="94" fill="#fff" stroke="#b8923a" stroke-width="3"/>'+num+'<line x1="100" y1="100" x2="100" y2="54" stroke="#26211b" stroke-width="5" stroke-linecap="round" transform="rotate('+((h%12)*30+m/2)+' 100 100)"/><line x1="100" y1="100" x2="100" y2="28" stroke="#a3231b" stroke-width="3" stroke-linecap="round" transform="rotate('+(m*6)+' 100 100)"/></svg>';
  mcq($('rel'),svg+'<p class="enun">¿Qué hora marca? (horas y minutos)</p>',sh(o),ok,'Son las '+ok+'. Fíjate en que el reloj escribe IIII en lugar de IV, como muchos relojes reales.',reloj,'Otro reloj');
}
/* Suma romana */
function suma(){const a=rnd(400),b=rnd(400);
  $('sum').innerHTML='<p class="enun">'+toRoman(a)+' + '+toRoman(b)+' = ?</p><input class="ent" id="si" type="text" autocomplete="off" spellcheck="false" placeholder="Respuesta en romanos" aria-label="Respuesta en números romanos"><p><button class="btn" id="sb">Comprobar</button></p><div id="sf" aria-live="polite"></div>';
  $('sb').onclick=()=>{const t=$('si').value.trim().toUpperCase(),g=t&&RE.test(t)&&fromRoman(t)===a+b;
    $('sf').innerHTML=g?'Correcto: '+a+' + '+b+' = '+(a+b)+'. <button class="btn" id="sn">Otra suma</button>':'Todavía no. Pista: junta las letras de ambos números, ordénalas de mayor a menor y aplica las reglas de repetición.';
    if(g){pt('sum',3);$('sn').onclick=suma}};
}
/* Memoria */
let mf=[],mm=0;
function mem(){const c=[];sh([4,9,14,19,29,40,49,90,99,400,444,1994]).slice(0,6).forEach(n=>c.push([n,String(n)],[n,toRoman(n)]));sh(c);mf=[];mm=0;
  $('mem').innerHTML='<p class="enun">Une cada número con su forma romana</p><div class="mem">'+c.map(x=>'<button data-n="'+x[0]+'">'+x[1]+'</button>').join('')+'</div><p id="mv" aria-live="polite">Movimientos: 0</p><button class="btn2" id="mr">Reiniciar</button>';
  $('mr').onclick=mem;
  $('mem').querySelectorAll('.mem button').forEach(b=>b.onclick=()=>{
    if(b.classList.contains('ok')||b.classList.contains('up')||mf.length===2)return;
    b.classList.add('up');mf.push(b);
    if(mf.length===2){mm++;$('mv').textContent='Movimientos: '+mm;const x=mf[0],y=mf[1];
      if(x.dataset.n===y.dataset.n){[x,y].forEach(z=>{z.classList.remove('up');z.classList.add('ok')});mf=[];
        if($('mem').querySelectorAll('.ok').length===12){$('mv').textContent='¡Completado en '+mm+' movimientos!';pt('mem',5)}}
      else setTimeout(()=>{x.classList.remove('up');y.classList.remove('up');mf=[]},900)}
  });
}
/* Cronología */
const EV=[['753 a.C.','Fundación legendaria de Roma'],['509 a.C.','Nace la República'],['146 a.C.','Destrucción de Cartago'],['44 a.C.','Muere Julio César'],['27 a.C.','Augusto, primer emperador'],['80 d.C.','Se inaugura el Coliseo'],['117 d.C.','El Imperio, en su mayor extensión'],['313 d.C.','Edicto de Milán'],['476 d.C.','Cae el Imperio de Occidente']];
let cn=0,ce=[];
function cro(){const k=sh([...EV.keys()]).slice(0,5);ce=k.slice().sort((a,b)=>a-b);cn=0;
  $('cro').innerHTML='<p class="enun">Toca los hechos del más antiguo al más reciente</p><div class="ops cr">'+k.map(i=>'<button data-i="'+i+'">'+EV[i][1]+'</button>').join('')+'</div><div class="fb" id="cm" aria-live="polite"></div>';
  $('cro').querySelectorAll('.cr button').forEach(b=>b.onclick=()=>{
    if(b.disabled)return;
    if(+b.dataset.i===ce[cn]){b.disabled=true;b.classList.add('bien');b.insertAdjacentHTML('beforeend','<small>'+EV[b.dataset.i][0]+'</small>');cn++;
      $('cm').innerHTML=cn===5?'¡Orden perfecto! <button class="btn" id="cx">Otra ronda</button>':'Bien. Sigue con el siguiente.';
      if(cn===5){pt('cro',5);$('cx').onclick=cro}}
    else{b.classList.add('mal');setTimeout(()=>b.classList.remove('mal'),700);$('cm').textContent='Ese no es el siguiente. Piensa cuál ocurrió antes.'}
  });
}
/* Verdadero o falso */
const VF=[['Los romanos tenían un símbolo para el cero.',0,'No lo tenían, y por eso calcular con sus cifras era tan engorroso.'],['IX vale 9.',1,'Es 10 menos 1.'],['El Coliseo se inauguró en el año 80 d.C.',1,'Lo inauguró el emperador Tito.'],['El español viene del latín.',1,'Es una lengua romance, nacida del latín hablado.'],['Julio César fue el primer emperador romano.',0,'El primero fue Augusto. César fue dictador.'],['La Vía Apia fue una calzada romana.',1,'Se empezó en el 312 a.C.'],['Los romanos nunca escribían 4 como IIII.',0,'IIII aparece en inscripciones y en muchos relojes.'],['Roma tuvo reyes antes de ser República.',1,'Según la tradición, siete reyes.'],['La cúpula del Panteón es de hormigón romano.',1,'Sigue siendo la mayor de hormigón sin refuerzo.'],['Los gladiadores combatían en el Circo Máximo.',0,'Combatían en anfiteatros como el Coliseo. El Circo Máximo era para carreras de carros.'],['La letra V puede repetirse tres veces seguidas.',0,'V, L y D nunca se repiten: VV se escribe X.'],['Cartago fue destruida en el año 146 a.C.',1,'Al final de la tercera guerra púnica.']];
let vq=[],vi=0,vs=0;
function vf(){vq=sh(VF.slice()).slice(0,8);vi=0;vs=0;vp()}
function vp(){const q=vq[vi];
  mcq($('vf'),'<p class="prog">Afirmación '+(vi+1)+' de 8</p><p class="enun">'+q[0]+'</p>',['Verdadero','Falso'],q[1]?'Verdadero':'Falso',q[2],g=>{
    if(g)vs++;vi++;
    if(vi<8)vp();else{$('vf').innerHTML='<p class="enun">Resultado: '+vs+' de 8.</p><button class="btn" id="vr">Jugar otra vez</button>';$('vr').onclick=vf}
  },vi<7?'Siguiente':'Ver resultado');
}
cons();reloj();suma();mem();cro();vf();
pregunta();
/* Pasaporte */
const RANGOS=[[0,'Plebeyo'],[10,'Legionario'],[30,'Centurión'],[60,'Tribuno'],[100,'Senador'],[150,'Cónsul']];
let PAS={p:0,s:[]};try{PAS=JSON.parse(localStorage.getItem('acta-pas'))||PAS}catch(e){}
const rango=()=>RANGOS.filter(x=>PAS.p>=x[0]).pop()[1];
function pasaporte(){
  $('pas').innerHTML='Rango: <b>'+rango()+'</b> Puntos: <b>'+PAS.p+'</b> Insignias: <b>'+PAS.s.length+' de 14</b>'+(PAS.s.length>=10?' <button class="btn" id="dp">Ver mi diploma</button>':'');
  if($('dp'))$('dp').onclick=()=>{$('dr').textContent=rango();$('dip').showModal()};
}
function pt(id,n){PAS.p+=n;if(!PAS.s.includes(id))PAS.s.push(id);try{localStorage.setItem('acta-pas',JSON.stringify(PAS))}catch(e){}pasaporte()}
$('nom').oninput=()=>{$('dn').textContent=$('nom').value.trim()||'Ciudadano'};$('dc').onclick=()=>$('dip').close();
/* Ábaco */
let ab=[[0,0],[0,0],[0,0]],at=0;
function abaco(){
  const P=[100,10,1],L=['C','X','I'],tot=()=>ab.reduce((s,c,i)=>s+(c[0]*5+c[1])*P[i],0),t=tot();
  $('abq').innerHTML='<p class="enun">'+(at?'Forma el número '+at:'Mueve las cuentas')+'</p><div class="ab">'+ab.map((c,i)=>'<div><button class="c5'+(c[0]?' on':'')+'" data-i="'+i+'" data-k="0" aria-label="Cuenta de cinco"></button>'+[1,2,3,4].map(k=>'<button class="'+(k<=c[1]?'on':'')+'" data-i="'+i+'" data-k="'+k+'" aria-label="Cuenta de uno"></button>').join('')+'<b>'+L[i]+'</b></div>').join('')+'</div><p class="res">'+t+(t?' = '+toRoman(t):'')+'</p><p><button class="btn" id="ar">Proponme un número</button> <button class="btn2" id="a0">Vaciar</button></p>';
  $('abq').querySelectorAll('.ab button').forEach(b=>b.onclick=()=>{
    const c=ab[+b.dataset.i],k=+b.dataset.k;if(!k)c[0]=1-c[0];else c[1]=c[1]>=k?k-1:k;
    const ok=at&&tot()===at;abaco();
    if(ok){pt('ab',3);at=0;abaco();$('abq').insertAdjacentHTML('beforeend','<p>¡Lo lograste! +3 puntos.</p>')}
  });
  $('ar').onclick=()=>{at=rnd(999);abaco()};$('a0').onclick=()=>{ab=[[0,0],[0,0],[0,0]];abaco()};
}
/* Fechas romanas */
const ML=['Ianuarias','Februarias','Martias','Apriles','Maias','Iunias','Iulias','Augustas','Septembres','Octobres','Novembres','Decembres'],AB=['Ianuariis','Februariis','Martiis','Aprilibus','Maiis','Iuniis','Iuliis','Augustis','Septembribus','Octobribus','Novembribus','Decembribus'],DM=[31,28,31,30,31,30,31,31,30,31,30,31],MS=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
function fecha(){
  const h=new Date();
  $('fec').innerHTML='<label>Día <input class="ent" id="fd" type="number" min="1" max="31" value="'+h.getDate()+'" style="width:6rem"></label> <label>Mes <select class="ent" id="fm" style="width:auto">'+MS.map((m,i)=>'<option value="'+i+'"'+(i===h.getMonth()?' selected':'')+'>'+m+'</option>').join('')+'</select></label><div id="fo" aria-live="polite"></div><p class="nota">Aquí febrero tiene 28 días.</p>';
  const f=()=>{const m=+$('fm').value,d=Math.max(1,Math.min(+$('fd').value||1,DM[m])),nn=[2,4,6,9].includes(m)?7:5,id=nn+8;let t;
    if(d===1)t='Kalendis '+AB[m];else if(d===nn)t='Nonis '+AB[m];else if(d===id)t='Idibus '+AB[m];
    else{let g,nom,mn=ML[m];if(d<nn){g=nn;nom='Nonas'}else if(d<id){g=id;nom='Idus'}else{g=DM[m]+1;nom='Kalendas';mn=ML[(m+1)%12]}
      const N=g-d+1;t=(N===2?'pridie ':'ante diem '+toRoman(N)+' ')+nom+' '+mn}
    $('fo').innerHTML='<p class="res" style="font-size:1.6rem">'+t+'</p><p>Así habría escrito un romano esta fecha. Las Kalendas son el día 1, las Nonas el 5 o el 7 y los Idus el 13 o el 15, y se cuenta hacia atrás incluyendo ambos días.</p>'};
  $('fd').oninput=f;$('fm').onchange=f;f();
}
/* Inscripciones */
const IN=[[1810,'Grito de Independencia en Bogotá.'],[1819,'Batalla de Boyacá.'],[1538,'Fundación de Bogotá.'],[1492,'Llegada de Colón a América.'],[1789,'Comienza la Revolución francesa.'],[1914,'Estalla la Primera Guerra Mundial.'],[1945,'Termina la Segunda Guerra Mundial.'],[1969,'El ser humano llega a la Luna.'],[1776,'Independencia de Estados Unidos.'],[2026,'Este año.']];
function insc(){
  const q=IN[rnd(IN.length)-1],o=[q[0]];
  while(o.length<4){const x=q[0]+[10,-10,100,-100,5,-5,50,-50,1,-1,4,-4][rnd(12)-1];if(!o.includes(x))o.push(x)}
  mcq($('ins'),'<p class="enun">En una lápida se lee «'+toRoman(q[0])+'». ¿Qué año es?</p>',sh(o).map(String),String(q[0]),q[0]+': '+q[1],insc,'Otra inscripción');
}
/* Mercader */
function merc(){
  const t=rnd(4)-1,a=rnd(30),b=rnd(30),R=[['Compras un ánfora de vino por '+toRoman(a)+' denarios. ¿Cuántos sestercios son?',4*a,4,'Un denario valía 4 sestercios.'],['Un panadero cobra '+toRoman(a)+' sestercios por unos panes. ¿Cuántos ases son?',4*a,4,'Un sestercio valía 4 ases.'],['Una calzada mide '+toRoman(a)+' millas romanas. ¿Cuántos pasos dobles son?',1000*a,1000,'La milla era <em>mille passus</em>: mil pasos dobles.'],['Pagas '+toRoman(a)+' denarios y luego '+toRoman(b)+' denarios más. ¿Cuántos ases gastaste?',16*(a+b),16,'Un denario valía 16 ases.']][t],o=[R[1]];
  [1,-1,2,-2].forEach(k=>{if(o.length<4&&R[1]+k*R[2]>0)o.push(R[1]+k*R[2])});
  mcq($('mer'),'<p class="enun">'+R[0]+'</p>',sh(o).map(String),String(R[1]),R[3]+' Respuesta: '+R[1]+'.',merc,'Otro problema');
}
/* Terni lapilli */
const TL=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];let tb,tsel,tf;
const twin=(c,p)=>TL.some(l=>l.every(i=>c[i]===p)),tn=(a,b)=>Math.abs(a%3-b%3)<2&&Math.abs((a/3|0)-(b/3|0))<2;
function tmoves(p){const own=[],em=[];tb.forEach((v,i)=>{v===p?own.push(i):v===''&&em.push(i)});return own.length<3?em.map(t=>[-1,t]):own.flatMap(f=>em.filter(t=>tn(f,t)).map(t=>[f,t]))}
function tap(m,p){const c=tb.slice();if(m[0]>=0)c[m[0]]='';c[m[1]]=p;return c}
function tcpu(){
  const ms=tmoves('O');if(!ms.length)return;
  const sc=m=>{const c=tap(m,'O');if(twin(c,'O'))return 100;const sv=tb;tb=c;const bad=tmoves('X').some(x=>twin(tap(x,'X'),'X'));tb=sv;return(bad?-50:0)+(m[1]===4?5:0)+Math.random()};
  let best=ms[0],bs=-1e9;ms.forEach(m=>{const v=sc(m);if(v>bs){bs=v;best=m}});tb=tap(best,'O');
}
function terni(){tb=Array(9).fill('');tsel=-1;tf='';tr()}
function tr(){
  $('ter').innerHTML='<p class="enun">Terni lapilli: alinea tus tres piedras (X). Primero se colocan; luego se mueven a una casilla vecina.</p><div class="tt">'+tb.map((v,i)=>'<button data-i="'+i+'" class="'+(i===tsel?'sel ':'')+(v==='X'?'x':v==='O'?'o':'')+'" aria-label="Casilla '+(i+1)+'">'+v+'</button>').join('')+'</div><p aria-live="polite">'+tf+'</p><button class="btn2" id="tn">Nueva partida</button>';
  $('tn').onclick=terni;
  $('ter').querySelectorAll('.tt button').forEach(b=>b.onclick=()=>{
    if(tf)return;const i=+b.dataset.i,nx=tb.filter(v=>v==='X').length;
    if(nx<3){if(tb[i])return;tb[i]='X'}
    else if(tb[i]==='X'){tsel=i;tr();return}
    else if(tsel>=0&&!tb[i]&&tn(tsel,i)){tb[i]='X';tb[tsel]='';tsel=-1}else return;
    if(twin(tb,'X')){tf='¡Ganaste! +5 puntos.';pt('ter',5)}else{tcpu();if(twin(tb,'O'))tf='Ganó el computador. Inténtalo de nuevo.'}
    tr();
  });
}
/* Cursus honorum */
const CU=[['Cuestor','Administras el tesoro público y ayudas a los gobernadores.'],['Edil','Cuidas los mercados y los edificios y organizas los juegos públicos.'],['Tribuno de la plebe','Defiendes a los plebeyos y puedes vetar decisiones.'],['Pretor','Presides tribunales de justicia y puedes mandar ejércitos.'],['Censor','Cada cinco años haces el censo y revisas la lista del Senado.'],['Cónsul','Eres uno de los dos jefes del Estado, elegido por un año.']];
let cq=[],ci=0,cg=0;
function cur(){cq=sh([...CU.keys()]).slice(0,5);ci=0;cg=0;cp()}
function cp(){
  const q=CU[cq[ci]],o=sh(CU.filter((x,i)=>i!==cq[ci]).map(x=>x[0])).slice(0,3).concat(q[0]);
  mcq($('cur'),'<p class="prog">Paso '+(ci+1)+' de 5 en tu carrera política</p><p class="enun">'+q[1]+' ¿Qué cargo es?</p>',sh(o),q[0],'Es el '+q[0]+'.',g=>{
    if(g)cg++;ci++;
    if(ci<5)cp();else{$('cur').innerHTML='<p class="enun">Acertaste '+cg+' de 5: '+(cg===5?'llegas a cónsul.':cg>=3?'llegas a pretor.':'te quedas de cuestor.')+'</p><button class="btn" id="cr">Otra carrera</button>';$('cr').onclick=cur}
  },ci<4?'Siguiente':'Ver resultado');
}
/* Etimologías */
const ET=[['calcular','calculus: piedrecita para contar'],['candidato','candidatus: vestido de blanco'],['senado','senex: anciano'],['capital','caput: cabeza'],['dinero','denarius: moneda de plata'],['milla','mille passus: mil pasos'],['circo','circus: círculo'],['domicilio','domus: casa'],['sueldo','solidus: moneda de oro'],['pecuniario','pecus: ganado']];
function etim(){
  const q=ET[rnd(ET.length)-1],o=sh(ET.filter(x=>x!==q).map(x=>x[1])).slice(0,3).concat(q[1]);
  mcq($('eti'),'<p class="enun">¿De dónde viene «'+q[0]+'»?</p>',sh(o),q[1],'«'+q[0]+'» viene de '+q[1]+'.',etim,'Otra palabra');
}
/* Dato del día */
const DT=['La palabra “calcular” viene de <em>calculus</em>, la piedrecita con la que se contaba.','Julio recibe su nombre de Julio César y agosto, de Augusto.','Septiembre significa “séptimo mes”: el año romano antiguo empezaba en marzo.','Un legionario podía marchar unos 30 kilómetros al día con todo su equipo.','La Vía Apia se empezó en el 312 a.C. y todavía se camina por tramos.','La cúpula del Panteón sigue siendo la mayor de hormigón sin refuerzo del mundo.','Los arcos de entrada del Coliseo estaban numerados con cifras romanas.','En latín, <em>ludus</em> significaba a la vez juego y escuela.','El calendario juliano, creado por César en el 45 a.C., añadía un día cada cuatro años.','Muchos relojes escriben IIII en lugar de IV.','Plinio el Joven describió la erupción del Vesubio en cartas a Tácito.','La milla viene de <em>mille passus</em>: mil pasos dobles, unos 1,5 kilómetros.','Los romanos no tenían símbolo para el cero.','Las paredes de Pompeya conservan anuncios electorales de hace casi dos mil años.'];
const dy=Math.floor((hoy-new Date(hoy.getFullYear(),0,0))/864e5);
$('dd').innerHTML='<p><strong>Dato del día, '+toRoman(hoy.getDate())+' de '+MES[hoy.getMonth()]+'.</strong> '+DT[dy%DT.length]+'</p>';
/* Foro con comentarios (Giscus): completa estos datos al publicar en GitHub */
const GISCUS={repo:'',repoId:'',category:'',categoryId:''};
if(GISCUS.repo){const g=document.createElement('script');g.src='https://giscus.app/client.js';g.async=true;g.crossOrigin='anonymous';Object.entries({repo:GISCUS.repo,'repo-id':GISCUS.repoId,category:GISCUS.category,'category-id':GISCUS.categoryId,mapping:'pathname','input-position':'top',lang:'es'}).forEach(e=>g.setAttribute('data-'+e[0],e[1]));$('giscus').appendChild(g)}

/* Sopa de letras */
const SW=['ROMA','CESAR','FORO','LEGION','ABACO','COLISEO','AUGUSTO','SENADO','CONSUL','POMPEYA','LATIN','TERMAS','GLADIADOR','ACUEDUCTO'];
let sg,sws,sf,s1;
function sopa(){
  const N=10,pl=[],D=[[0,1],[1,0],[1,1]];sg=Array(N*N).fill('');sf=[];s1=-1;
  sh(SW.slice()).slice(0,6).forEach(w=>{for(let t=0;t<300;t++){
    const d=D[rnd(3)-1],r=rnd(N)-1,c=rnd(N)-1;
    if(r+d[0]*(w.length-1)>=N||c+d[1]*(w.length-1)>=N)continue;
    let ok=true;for(let k=0;k<w.length;k++){const v=sg[(r+d[0]*k)*N+c+d[1]*k];if(v&&v!==w[k]){ok=false;break}}
    if(ok){for(let k=0;k<w.length;k++)sg[(r+d[0]*k)*N+c+d[1]*k]=w[k];pl.push(w);break}}});
  sws=pl;sg=sg.map(v=>v||'ABCDEFGHILMNOPQRSTUV'[rnd(20)-1]);sr();
}
function sr(){
  const N=10,fc=new Set(sf.flatMap(x=>x.c));
  $('sop').innerHTML='<p class="enun">Encuentra las palabras: toca la primera y la última letra</p><div class="sg">'+sg.map((v,i)=>'<button data-i="'+i+'" class="'+(fc.has(i)?'f ':'')+(i===s1?'s':'')+'">'+v+'</button>').join('')+'</div><p>'+sws.map(w=>sf.some(x=>x.w===w)?'<s>'+w+'</s>':w).join(' · ')+'</p><p aria-live="polite">'+(sf.length===sws.length?'¡Completada! <button class="btn" id="sx">Otra sopa</button>':'')+'</p>';
  if($('sx'))$('sx').onclick=sopa;
  $('sop').querySelectorAll('.sg button').forEach(b=>b.onclick=()=>{
    const i=+b.dataset.i;if(s1<0){s1=i;sr();return}
    const r1=s1/N|0,c1=s1%N,r2=i/N|0,c2=i%N,dr=Math.sign(r2-r1),dc=Math.sign(c2-c1),L=Math.max(Math.abs(r2-r1),Math.abs(c2-c1))+1;
    s1=-1;
    if(!(r1===r2||c1===c2||Math.abs(r2-r1)===Math.abs(c2-c1))){sr();return}
    const cells=[...Array(L).keys()].map(k=>(r1+dr*k)*N+c1+dc*k),str=cells.map(x=>sg[x]).join(''),rev=[...str].reverse().join(''),w=sws.find(x=>(x===str||x===rev)&&!sf.some(y=>y.w===x));
    if(w){sf.push({w:w,c:cells});pt('sop',2);if(sf.length===sws.length)pt('sop',5)}
    sr();
  });
}
abaco();fecha();insc();merc();terni();cur();etim();sopa();pasaporte();
