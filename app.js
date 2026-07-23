
const SK='mitchell-checkin-v3';
const state=JSON.parse(localStorage.getItem(SK)||'{}');
function save(){localStorage.setItem(SK,JSON.stringify(state));updateStats();}
function setSaved(cardId){const el=document.querySelector('[data-saved="'+cardId+'"]');if(el){el.textContent='Saved ✓';el.classList.add('has-data');}}
function initEl(el){const k=el.dataset.key;if(!k)return;if(state[k]!=null){if(el.type==='checkbox')el.checked=!!state[k];else el.value=state[k];}el.addEventListener('input',()=>{state[k]=el.type==='checkbox'?el.checked:el.value;save();const cardId=k.replace(/-(notes|done|choice)$/,'');setSaved(cardId);});}
document.querySelectorAll('[data-key]').forEach(initEl);
document.querySelectorAll('.segmented button[data-card]').forEach(btn=>{const card=btn.dataset.card;const key=card+'-choice';if(state[key]===btn.dataset.choice)btn.classList.add('selected');btn.addEventListener('click',()=>{btn.parentElement.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));btn.classList.add('selected');state[key]=btn.dataset.choice;save();setSaved(card);});});
function updateStats(){
  const cards=[...document.querySelectorAll('.card')];
  const total=cards.length;
  const answered=cards.filter(c=>{const id=c.dataset.card;return state[id+'-choice']||state[id+'-notes']||state[id+'-flight']||state[id+'-activity']||c.querySelector('.podcast-item')&&[...c.querySelectorAll('.podcast-item')].some(pi=>state[pi.querySelector('button')?.dataset.card+'-choice']);}).length;
  const done=cards.filter(c=>state[c.dataset.card+'-done']).length;
  document.getElementById('total').textContent=total;
  document.getElementById('answered').textContent=answered;
  document.getElementById('pending').textContent=total-answered;
  document.getElementById('done').textContent=done;
}
updateStats();
document.getElementById('search').addEventListener('input',e=>{const q=e.target.value.toLowerCase();document.querySelectorAll('.card').forEach(c=>c.style.display=c.textContent.toLowerCase().includes(q)?'':'none');});
document.getElementById('onlyOpen').addEventListener('click',()=>{document.querySelectorAll('.card').forEach(c=>{const id=c.dataset.card;const hasAns=state[id+'-choice']||state[id+'-notes']||state[id+'-done']||state[id+'-flight']||state[id+'-activity'];c.style.display=hasAns?'none':'';});});
document.getElementById('showAll').addEventListener('click',()=>{document.getElementById('search').value='';document.querySelectorAll('.card').forEach(c=>c.style.display='');});
function buildSummary(){const rows=[];document.querySelectorAll('.card').forEach(c=>{const id=c.dataset.card;const title=c.querySelector('h3')?.textContent||'';const section=c.closest('.section')?.dataset.section||'';const choice=state[id+'-choice']||'';const flight=state[id+'-flight']||'';const activity=state[id+'-activity']||'';const notes=state[id+'-notes']||'';const done=state[id+'-done']?'Yes':'No';const podAnswers=[...c.querySelectorAll('.podcast-item')].map(pi=>{const pid=pi.querySelector('button')?.dataset.card;const pname=pi.querySelector('.podcast-name')?.textContent||'';const pchoice=state[pid+'-choice']||'';const pnotes=state[pid+'-notes']||'';return pchoice||pnotes?pname+': '+pchoice+(pnotes?' ('+pnotes+')':''):'';}).filter(Boolean);if(choice||notes||done||flight||activity||podAnswers.length){rows.push({section,title,choice,flight,activity,notes,done,podAnswers});}});return rows;}
document.getElementById('exportJson').addEventListener('click',()=>{const data=buildSummary();const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='mitchell-checkin-responses.json';a.click();});
function copySummary(){const data=buildSummary();if(!data.length){alert('No responses yet.');return;}const text=data.map(r=>{let line='['+r.section+'] '+r.title;if(r.choice)line+='\n  Decision: '+r.choice;if(r.flight)line+='\n  Flight: '+r.flight;if(r.activity)line+='\n  Activity: '+r.activity;if(r.podAnswers?.length)line+='\n  Podcasts: '+r.podAnswers.join('; ');if(r.notes)line+='\n  Notes: '+r.notes;if(r.done==='Yes')line+='\n  Done: Yes';return line;}).join('\n\n');navigator.clipboard.writeText(text).then(()=>alert('Response summary copied to clipboard. Paste it into an email or message to your EA.'));}
document.getElementById('copySummary').addEventListener('click',copySummary);
document.getElementById('copySummary2').addEventListener('click',copySummary);
document.getElementById('clearAll').addEventListener('click',()=>{if(confirm('Clear all saved responses? This cannot be undone.')){localStorage.removeItem(SK);location.reload();}});

// Submit responses to Jessica via email
document.getElementById('submitEmail').addEventListener('click', () => {
  const data = buildSummary();
  if (!data.length) { alert('No responses yet. Please answer at least one item first.'); return; }
  const text = data.map(r => {
    let line = '[' + r.section + '] ' + r.title;
    if (r.choice) line += '\n  Decision: ' + r.choice;
    if (r.flight) line += '\n  Flight: ' + r.flight;
    if (r.activity) line += '\n  Activity: ' + r.activity;
    if (r.podAnswers && r.podAnswers.length) line += '\n  Podcasts: ' + r.podAnswers.join('; ');
    if (r.notes) line += '\n  Notes: ' + r.notes;
    if (r.done === 'Yes') line += '\n  Done: Yes';
    return line;
  }).join('\n\n');
  const subject = 'Mitchell Check-in Responses — ' + new Date().toLocaleDateString();
  const mailto = 'mailto:jessica@lava.so?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text);
  window.location.href = mailto;
});
