/* ---------- global helpers ---------- */
const qs = s => document.querySelector(s);
const qsa = s => [...document.querySelectorAll(s)];

const STORAGE_KEY = 'bjt-history';

/* ---------- navigation ---------- */
qsa('nav button').forEach(btn=>{
  btn.addEventListener('click',()=>{
    qsa('nav button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    qsa('.view.visible')?.classList.remove('visible');
    qs(`#view-${btn.dataset.view}`).classList.add('visible');
    if(btn.dataset.view==='stats') renderStats();
    if(btn.dataset.view==='history') loadHistory();
  });
});

/* ---------- dynamic form ---------- */
const exerciseType = qs('#exerciseType');
const dynamicFields = qs('#dynamicFields');

function updateDynamicFields(){
  const t = exerciseType.value;
  let html='';
  if(t==='fitness'){
    html+=`
      <label>Exercise:
        <select id="exerciseName" required>
          <option>Bench Press</option>
          <option>Squat</option>
          <option>Deadlift</option>
          <option>Dips</option>
          <option>Pull-ups</option>
          <option>Row</option>
        </select>
      </label>
      <label>Sets: <input type="number" id="sets" value="3" min="1" required></label>
      <label>Reps: <input type="number" id="reps" value="8" min="1" required></label>
      <label>Weight (kg): <input type="number" id="weight" value="20" step="0.5" required></label>
    `;
  }else if(t==='swimming'){
    html+=`
      <label>Distance (m): <input type="number" id="meters" value="500" required></label>
      <label>Time (min): <input type="number" id="time" value="15" step="0.1" required></label>
    `;
  }else if(t==='running'){
    html+=`
      <label>Distance (km): <input type="number" id="distance" value="5" step="0.1" required></label>
      <label>Time (min): <input type="number" id="time" value="30" step="0.1" required></label>
    `;
  }else{
    const map={
      boxing:'Boxing',
      sixpack:'Six-pack',
      yoga:'Yoga',
      golf:'Golf',
      bouldering:'Bouldering'
    };
    html+=`
      <label>${map[t]} time (min):
        <input type="number" id="time" value="30" step="0.1" required>
      </label>`;
  }
  dynamicFields.innerHTML=html;
}
exerciseType.addEventListener('change',updateDynamicFields);
updateDynamicFields();

/* ---------- storage helpers ---------- */
function getHistory(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_KEY))||[]; }
  catch{ return []; }
}
function saveHistory(arr){
  localStorage.setItem(STORAGE_KEY,JSON.stringify(arr));
}

/* ---------- form submit ---------- */
qs('#exerciseForm').addEventListener('submit',e=>{
  e.preventDefault();
  const type=exerciseType.value;
  const date=new Date().toLocaleDateString();
  let details='';
  if(type==='fitness'){
    const name=qs('#exerciseName').value;
    const sets=qs('#sets').value;
    const reps=qs('#reps').value;
    const weight=qs('#weight').value;
    details=`${name}: ${sets}×${reps} @ ${weight} kg`;
  }else if(type==='swimming'){
    details=`${qs('#meters').value} m in ${qs('#time').value} min`;
  }else if(type==='running'){
    details=`${qs('#distance').value} km in ${qs('#time').value} min`;
  }else{
    details=`${qs('#time').value} min`;
  }
  const activityLabel=exerciseType.options[exerciseType.selectedIndex].text;
  const entry={date,activity:activityLabel,details};
  const hist=getHistory();
  hist.push(entry);
  saveHistory(hist);
  qs('#exerciseForm').reset();
  updateDynamicFields();
  alert('Saved!');
});

/* ---------- history view ---------- */
function loadHistory(){
  const tbody=qs('#historyTable tbody');
  tbody.innerHTML='';
  getHistory().forEach((e,i)=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`
      <td>${e.date}</td>
      <td>${e.activity}</td>
      <td>${e.details}</td>
      <td><button data-i="${i}" class="danger">✕</button></td>`;
    tbody.appendChild(tr);
  });
}
/* delete */
qs('#historyTable').addEventListener('click',e=>{
  if(e.target.matches('button[data-i]')){
    const i=e.target.dataset.i;
    const hist=getHistory();
    hist.splice(i,1);
    saveHistory(hist);
    loadHistory();
  }
});

/* ---------- statistics view ---------- */
function renderStats(){
  const data=getHistory();
  if(!data.length){qs('#statsContent').textContent='No data yet.';return;}

  const totals={};
  data.forEach(e=>{
    totals[e.activity]=(totals[e.activity]||0)+1;
  });
  let html='<h3>Total sessions</h3><ul>';
  Object.entries(totals).forEach(([k,v])=>{
    html+=`<li>${k}: ${v}</li>`;
  });
  html+='</ul>';
  qs('#statsContent').innerHTML=html;
}

/* ---------- settings view ---------- */
qs('#exportBtn').addEventListener('click',()=>{
  const blob=new Blob([JSON.stringify(getHistory(),null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='bjt-history.json';
  a.click();
});
qs('#importInput').addEventListener('change',e=>{
  const file=e.target.files[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=ev=>{
    try{
      const arr=JSON.parse(ev.target.result);
      if(Array.isArray(arr)){saveHistory(arr);alert('Imported!');}
      else alert('Invalid file.');
    }catch(_){alert('Invalid JSON.');}
  };
  reader.readAsText(file);
});
qs('#clearBtn').addEventListener('click',()=>{
  if(confirm('Delete ALL history?')){localStorage.removeItem(STORAGE_KEY);loadHistory();}
});

/* ---------- PWA: register service worker ---------- */
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js');
}
