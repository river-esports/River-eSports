import { supabase, isConfigured } from "./supabase.js";
const $=id=>document.getElementById(id); const content=$("pageContent");
let currentPage="overview";
const configs={
 tournaments:{table:"tournaments",title:"Tournaments",fields:[["name","Tournament name","text",true],["status","Status","select",true,["Upcoming","Live","Completed","Postponed"]],["game","Game","text",false],["event_date","Date","date",false],["prize_pool","Prize pool (INR)","number",false],["registration_url","Registration URL","url",false],["description","Description","textarea",false]],columns:["name","status","event_date","prize_pool"]},
 matches:{table:"matches",title:"Match schedule",fields:[["tournament_name","Tournament","text",true],["round_name","Round / stage","text",true],["match_date","Date","date",false],["match_time","Time","text",false],["map_name","Map","text",false],["details","Details","textarea",false]],columns:["tournament_name","round_name","match_date","match_time","map_name"]},
 results:{table:"results",title:"Results",fields:[["tournament_name","Tournament","text",true],["winner","Winner","text",true],["runner_up","Runner-up","text",false],["third_place","Third place","text",false],["prize_pool","Prize pool (INR)","number",false],["summary","Summary","textarea",false]],columns:["tournament_name","winner","runner_up","prize_pool"]},
 teams:{table:"teams",title:"Teams & players",fields:[["name","Team name","text",true],["category","Category","text",false],["players","Players (comma separated)","textarea",false],["description","Description","textarea",false]],columns:["name","category","players"]},
 news:{table:"news",title:"News & banners",fields:[["title","Title","text",true],["body","Content","textarea",false],["image_url","Image URL","url",false],["published_at","Publish date","date",false]],columns:["title","published_at"]},
 gaming_news:{
  table:"gaming_news",
  title:"Gaming News",
  fields:[
   ["title","Title","text",true],
   ["body","Description / Content","textarea",false],
   ["image_url","Poster Image URL","url",false],
   ["category","Category","select",true,["BGMI News","Esports News","Gaming Tips & Guides"]],
   ["status","Status","select",true,["Draft","Published"]],
   ["published_at","Publish Date","date",false]
  ],
  columns:["title","category","status","published_at"]
 },
 sponsors:{table:"sponsors",title:"Sponsors",fields:[["name","Sponsor name","text",true],["website_url","Website URL","url",false],["logo_url","Logo URL","url",false],["sort_order","Display order","number",false]],columns:["name","website_url","sort_order"]}
};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function notice(msg){$("adminNotice").textContent=msg;$("adminNotice").classList.remove("hidden");setTimeout(()=>$("adminNotice").classList.add("hidden"),4500)}
function renderOverview(){
 $("pageTitle").textContent="OVERVIEW";
 content.innerHTML=`<div class="stat-grid"><div class="stat-card"><span>TOURNAMENTS</span><strong id="ovT">—</strong></div><div class="stat-card"><span>MATCHES</span><strong id="ovM">—</strong></div><div class="stat-card"><span>TEAMS</span><strong id="ovTeams">—</strong></div><div class="stat-card"><span>NEWS POSTS</span><strong id="ovN">—</strong></div></div><div class="panel"><div class="panel-head"><h2>WELCOME TO YOUR CONTROL ROOM</h2><a class="secondary-btn" href="index.html" target="_blank">VIEW WEBSITE ↗</a></div><p class="help-text">Use the sidebar to publish and update your BGMI tournaments, match schedules, results, teams, news and sponsors. Changes are saved to Supabase and appear on the public website.</p></div><div class="panel"><h2>IMPORTANT SETUP</h2><p class="help-text">Before using the dashboard, configure your Supabase project and run the database SQL file. Follow SETUP-GUIDE.md. Create your admin user in Supabase Authentication → Users.</p></div>`;
 Promise.all(["tournaments","matches","teams","news","gaming_news"].map(t=>supabase.from(t).select("id",{count:"exact",head:true}))).then(([a,b,c,d])=>{if($("ovT")){$("ovT").textContent=a.count??0;$("ovM").textContent=b.count??0;$("ovTeams").textContent=c.count??0;$("ovN").textContent=d.count??0;}});
}
async function renderTable(key){
 const cfg=configs[key];$("pageTitle").textContent=cfg.title.toUpperCase();
 content.innerHTML=`<div class="panel"><div class="panel-head"><h2>MANAGE ${cfg.title.toUpperCase()}</h2><button class="small-btn" id="addNew">+ ADD NEW</button></div><div class="table-scroll" id="tableArea"><div class="empty-admin">Loading records...</div></div></div>`;
 $("addNew").onclick=()=>openEditor(key,null);
 const {data,error}=await supabase.from(cfg.table).select("*").order("created_at",{ascending:false});
 if(error){$("tableArea").innerHTML=`<div class="empty-admin">Could not load records: ${esc(error.message)}</div>`;return;}
 if(!data.length){$("tableArea").innerHTML='<div class="empty-admin">No records yet. Select “Add New” to create your first entry.</div>';return;}
 $("tableArea").innerHTML=`<table class="data-table"><thead><tr>${cfg.columns.map(c=>`<th>${esc(c.replaceAll("_"," ").toUpperCase())}</th>`).join("")}<th>ACTIONS</th></tr></thead><tbody>${data.map(row=>`<tr>${cfg.columns.map(c=>`<td>${esc(row[c]??"—")}</td>`).join("")}<td><div class="row-actions"><button data-edit="${row.id}">EDIT</button><button class="delete" data-delete="${row.id}">DELETE</button></div></td></tr>`).join("")}</tbody></table>`;
 $("tableArea").querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>openEditor(key,data.find(x=>x.id===b.dataset.edit)));
 $("tableArea").querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>removeRow(key,b.dataset.delete));
}
function openEditor(key,row){
 const cfg=configs[key], root=$("modalRoot");
 root.innerHTML=`<div class="modal-backdrop"><form class="modal" id="editForm"><button type="button" class="modal-close" id="closeModal">×</button><h2>${row?"EDIT":"ADD"} ${cfg.title.toUpperCase()}</h2><div class="field-grid">${cfg.fields.map(([name,label,type,required,options])=>`<div class="field ${type==="textarea"?"full-field":""}"><label>${esc(label)}${required?" *":""}</label>${type==="textarea"?`<textarea name="${name}">${esc(row?.[name]??"")}</textarea>`:type==="select"?`<select name="${name}">${options.map(o=>`<option ${row?.[name]===o?"selected":""}>${o}</option>`).join("")}</select>`:`<input name="${name}" type="${type}" ${required?"required":""} value="${esc(row?.[name]??"")}">`}</div>`).join("")}</div><div class="form-actions"><button type="button" class="secondary-btn" id="cancelEdit">CANCEL</button><button class="small-btn" type="submit">SAVE CHANGES</button></div></form></div>`;
 const close=()=>root.innerHTML="";$("closeModal").onclick=close;$("cancelEdit").onclick=close;
 $("editForm").onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.currentTarget),payload={};cfg.fields.forEach(([n,,type])=>{const v=fd.get(n);payload[n]=v===""?null:(type==="number"?Number(v):v)});let q=row?supabase.from(cfg.table).update(payload).eq("id",row.id):supabase.from(cfg.table).insert(payload);const {error}=await q;if(error){notice("Save failed: "+error.message);return;}close();notice("Saved successfully. Public website will refresh with the new data.");renderTable(key);};
}
async function removeRow(key,id){if(!confirm("Delete this record permanently?"))return;const {error}=await supabase.from(configs[key].table).delete().eq("id",id);if(error){notice("Delete failed: "+error.message);return;}notice("Record deleted.");renderTable(key);}
async function renderSettings(){
 $("pageTitle").textContent="WEBSITE SETTINGS";content.innerHTML=`<div class="panel"><div class="panel-head"><h2>HOMEPAGE CONTENT</h2></div><form id="settingsForm" class="field-grid"><div class="field full-field"><label>Hero description</label><textarea name="hero_description" id="hero_description"></textarea></div><div class="field full-field"><label>About section text</label><textarea name="about_text" id="about_text"></textarea></div><div class="form-actions full-field"><button class="small-btn">SAVE SETTINGS</button></div></form><p class="help-text">These settings update the public homepage text. For a full-width hero image or custom banner artwork, add an image URL in the News & Banners section or extend the design later.</p></div>`;
 const {data,error}=await supabase.from("site_settings").select("*");if(error){notice(error.message);return;}const m=Object.fromEntries(data.map(x=>[x.key,x.value]));$("hero_description").value=m.hero_description||"";$("about_text").value=m.about_text||"";
 $("settingsForm").onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.currentTarget);for(const key of ["hero_description","about_text"]){const {error}=await supabase.from("site_settings").upsert({key,value:fd.get(key)},{onConflict:"key"});if(error){notice(error.message);return;}}notice("Website settings saved.");};
}
function navigate(page){currentPage=page;document.querySelectorAll(".side-link").forEach(b=>b.classList.toggle("active",b.dataset.page===page));if(page==="overview")renderOverview();else if(page==="settings")renderSettings();else renderTable(page);}
document.querySelectorAll(".side-link").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.page)));
$("loginForm").addEventListener("submit",async e=>{e.preventDefault();if(!isConfigured){$("loginMessage").textContent="Supabase is not configured yet. Follow SETUP-GUIDE.md.";return;}const {error}=await supabase.auth.signInWithPassword({email:$("email").value,password:$("password").value});if(error){$("loginMessage").textContent=error.message;return;}await showDashboard();});
async function showDashboard(){const {data:{user}}=await supabase.auth.getUser();if(!user)return;$("loginScreen").classList.add("hidden");$("dashboard").classList.remove("hidden");$("adminEmail").textContent=user.email||"Admin";navigate("overview");}
$("logoutBtn").onclick=async()=>{await supabase.auth.signOut();$("dashboard").classList.add("hidden");$("loginScreen").classList.remove("hidden");};
if(isConfigured){const {data:{session}}=await supabase.auth.getSession();if(session)await showDashboard();}
