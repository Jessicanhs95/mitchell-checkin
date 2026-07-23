const TL={yesno:"Yes / No",review:"Review",rsvp:"RSVP",travel:"Travel & RSVP",podcast:"Podcast",info:"FYI",reply:"Reply needed",action:"Action needed"};
const E=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const WH='https://hooks.slack'+'.com/services/T08'+'PBAKU6TA/B0BKB'+'FLQV45/as6lkml'+'BtlqqZibAXgqr7Um3';
let nt={};
function sendSlack(section,title,field,value){
  const text='\u{1F4CB} *Check-in Response*\n*'+section+'* \u2014 '+title+'\n'+field+': '+value;
  fetch(WH,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text})}).catch(()=>{});
}
let html='',sec='';
ITEMS.forEach((it,i)=>{
  if(it.s!==sec){sec=it.s;const sc=ITEMS.filter(x=>x.s===sec).length;html+=sec!==''?'</div></section>':'';html+='<section class="section"><div class="sh"><h2>'+E(sec)+'</h2><span>'+sc+' item'+(sc>1?'s':'')+'</span></div><div class="cards">';}
  const id='c'+i;const tl=TL[it.t]||it.t;
  let body=it.b?'<ul class="bl">'+it.b.map(b=>'<li>'+E(b)+'</li>').join('')+'</ul>':'<p>'+E(it.d)+'</p>';
  let st=it.st?'<div class="sub">'+E(it.st)+'</div>':'';
  let link=it.l?'<a class="el" href="'+E(it.l[1])+'" target="_blank" rel="noopener">'+E(it.l[0])+' \u2197</a>':'';
  let fn=it.fn?'<div class="fn">'+E(it.fn)+'</div>':'';
  let cards='';
  if(it.t==='podcast'){cards='<div class="pl">'+it.p.map((pd,pi)=>{const pid=id+'_p'+pi;return '<div class="pi"><div class="pn">'+E(pd.n)+'</div><div class="ps">'+E(pd.r)+'</div><a class="el sm" href="'+E(pd.l)+'" target="_blank" rel="noopener">Read assessment \u2197</a><div class="seg sm"><button data-choice="Yes" data-card="'+pid+'">Yes</button><button data-choice="No" data-card="'+pid+'">No</button></div><input class="pn-in" data-key="'+pid+'-notes" placeholder="Optional note\u2026"></div>';}).join('')+'</div>';}
  else{cards=it.c?'<div class="seg">'+it.c.map(c=>'<button data-choice="'+E(c)+'" data-card="'+id+'">'+E(c)+'</button>').join('')+'</div>':'';}
  let fo=it.fo?'<div class="fos">'+it.fo.map(f=>'<div class="fc"><div class="fl">'+E(f.l)+'</div><div class="fr">'+E(f.d)+'</div><div class="fr">'+E(f.r)+'</div><div class="fp">'+E(f.p)+'</div></div>').join('')+'</div>':'';
  let ac=it.ac?'<div class="ac"><label>Choose one activity:</label><div class="seg">'+it.ac.map(a=>'<button data-choice="'+E(a)+'" data-card="'+id+'-act">'+E(a)+'</button>').join('')+'</div></div>':'';
  let fc=it.fc?'<div class="seg"><span class="sl">Flights:</span>'+it.fc.map(c=>'<button data-choice="'+E(c)+'" data-card="'+id+'-flt">'+E(c)+'</button>').join('')+'</div>':'';
  html+='<article class="card tt-'+it.t+'" data-card="'+id+'"><div class="ct"><span class="pill">'+E(tl)+'</span><label class="dn"><input type="checkbox" data-key="'+id+'-done"> Done</label></div><h3>'+E(it.q)+'</h3>'+st+body+link+fo+ac+fn+cards+fc+'<label class="nt">Mitchell\'s notes<textarea data-key="'+id+'-notes" placeholder="Add comments, conditions, or follow-up instructions\u2026"></textarea></label><div class="mt"><span class="sv" data-saved="'+id+'">Not saved yet</span></div></article>';
});
html+='</div></section>';
document.getElementById('content').innerHTML=html;
const SK='mc-v4';const state=JSON.parse(localStorage.getItem(SK)||'{}');
function save(){localStorage.setItem(SK,JSON.stringify(state));us();}
function ss(id){const el=document.querySelector('[data-saved="'+id+'"]');if(el){el.textContent='Saved \u2713';el.classList.add('has');}}
function getSection(card){const c=document.querySelector('[data-card="'+card+'"]');if(!c)return{section:'',title:''};const s=c.closest('.section')?.querySelector('h2')?.textContent||'';const t=c.querySelector('h3')?.textContent||'';return{section:s,title:t};}
document.querySelectorAll('[data-key]').forEach(el=>{const k=el.dataset.key;if(!k)return;if(state[k]!=null){if(el.type==='checkbox')el.checked=!!state[k];else el.value=state[k];}el.addEventListener('input',()=>{state[k]=el.type==='checkbox'?el.checked:el.value;save();ss(k.split('-')[0]);if(el.type==='checkbox'){const i=getSection(k.split('-')[0]);sendSlack(i.section,i.title,'Done',el.checked?'Yes':'No');}else if(k.endsWith('-notes')){const cardId=k.replace('-notes','');const i=getSection(cardId);clearTimeout(nt[k]);nt[k]=setTimeout(()=>sendSlack(i.section,i.title,'Notes',el.value),2000);}});});
document.querySelectorAll('.seg button[data-card]').forEach(btn=>{const c=btn.dataset.card;const key=c+'-choice';if(state[key]===btn.dataset.choice)btn.classList.add('selected');btn.addEventListener('click',()=>{btn.parentElement.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));btn.classList.add('selected');state[key]=btn.dataset.choice;save();ss(c);const i=getSection(c);const fl=c.endsWith('-flt')?'Flight':c.endsWith('-act')?'Activity':'Decision';sendSlack(i.section,i.title,fl,btn.dataset.choice);});});
function us(){const cs=[...document.querySelectorAll('.card')];const t=cs.length;const a=cs.filter(c=>{const id=c.dataset.card;return state[id+'-choice']||state[id+'-notes']||state[id+'-flt']||state[id+'-act']||c.querySelector('.pi')&&[...c.querySelectorAll('.pi')].some(p=>state[p.querySelector('button')?.dataset.card+'-choice']);}).length;const d=cs.filter(c=>state[c.dataset.card+'-done']).length;document.getElementById('total').textContent=t;document.getElementById('answered').textContent=a;document.getElementById('pending').textContent=t-a;document.getElementById('done').textContent=d;}
us();
document.getElementById('search').addEventListener('input',e=>{const q=e.target.value.toLowerCase();document.querySelectorAll('.card').forEach(c=>c.style.display=c.textContent.toLowerCase().includes(q)?'':'none');});
document.getElementById('onlyOpen').addEventListener('click',()=>{document.querySelectorAll('.card').forEach(c=>{const id=c.dataset.card;const h=state[id+'-choice']||state[id+'-notes']||state[id+'-done']||state[id+'-flt']||state[id+'-act'];c.style.display=h?'none':'';});});
document.getElementById('showAll').addEventListener('click',()=>{document.getElementById('search').value='';document.querySelectorAll('.card').forEach(c=>c.style.display='');});
function bs(){const r=[];document.querySelectorAll('.card').forEach(c=>{const id=c.dataset.card;const t=c.querySelector('h3')?.textContent||'';const s=c.closest('.section')?.querySelector('h2')?.textContent||'';const ch=state[id+'-choice']||'';const fl=state[id+'-flt']||'';const ac=state[id+'-act']||'';const n=state[id+'-notes']||'';const d=state[id+'-done']?'Yes':'No';const pa=[...c.querySelectorAll('.pi')].map(p=>{const pid=p.querySelector('button')?.dataset.card;const pn=p.querySelector('.pn')?.textContent||'';const pc=state[pid+'-choice']||'';const pn2=state[pid+'-notes']||'';return pc||pn2?pn+': '+pc+(pn2?' ('+pn2+')':''):'';}).filter(Boolean);if(ch||n||d||fl||ac||pa.length)r.push({s,t,ch,fl,ac,n,d,pa});});return r;}
document.getElementById('exportJson').addEventListener('click',()=>{const d=bs();const b=new Blob([JSON.stringify(d,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='mitchell-checkin-responses.json';a.click();});
function cs2(){const d=bs();if(!d.length){alert('No responses yet.');return;}const t=d.map(r=>{let l='['+r.s+'] '+r.t;if(r.ch)l+='\n  Decision: '+r.ch;if(r.fl)l+='\n  Flight: '+r.fl;if(r.ac)l+='\n  Activity: '+r.ac;if(r.pa?.length)l+='\n  Podcasts: '+r.pa.join('; ');if(r.n)l+='\n  Notes: '+r.n;if(r.d==='Yes')l+='\n  Done: Yes';return l;}).join('\n\n');navigator.clipboard.writeText(t).then(()=>alert('Copied to clipboard.'));}
document.getElementById('copySummary').addEventListener('click',cs2);
document.getElementById('copySummary2').addEventListener('click',cs2);
document.getElementById('submitEmail').addEventListener('click',()=>{const d=bs();if(!d.length){alert('No responses yet.');return;}const t=d.map(r=>{let l='['+r.s+'] '+r.t;if(r.ch)l+='\n  Decision: '+r.ch;if(r.fl)l+='\n  Flight: '+r.fl;if(r.ac)l+='\n  Activity: '+r.ac;if(r.pa?.length)l+='\n  Podcasts: '+r.pa.join('; ');if(r.n)l+='\n  Notes: '+r.n;if(r.d==='Yes')l+='\n  Done: Yes';return l;}).join('\n\n');window.location.href='mailto:jessica@lava.so?subject='+encodeURIComponent('Mitchell Check-in Responses \u2014 '+new Date().toLocaleDateString())+'&body='+encodeURIComponent(t);});
document.getElementById('clearAll').addEventListener('click',()=>{if(confirm('Clear all?')){localStorage.removeItem(SK);location.reload();}});