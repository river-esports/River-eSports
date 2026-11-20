
import { supabase, isConfigured } from "./supabase.js";

const $ = (id) => document.getElementById(id);

$("year").textContent = new Date().getFullYear();

$("menuToggle").addEventListener("click", () =>
  $("mainNav").classList.toggle("open")
);

document.querySelectorAll("#mainNav a").forEach(a =>
  a.addEventListener("click", () =>
    $("mainNav").classList.remove("open")
  )
);

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[c]));

const money = v =>
  v ? "₹" + Number(v).toLocaleString("en-IN") : "—";

function empty(msg) {
  return `<div class="empty-state">${msg}</div>`;
}

async function load() {
  if (!isConfigured) {
    $("tournamentList").innerHTML =
      empty("Connect Supabase to publish live tournament data. See SETUP-GUIDE.md.");
    return;
  }

  const [t, r, tm, n, s, settings] = await Promise.all([
    supabase.from("tournaments").select("*").order("created_at", { ascending: false }),
    supabase.from("results").select("*").order("created_at", { ascending: false }),
    supabase.from("teams").select("*").order("created_at", { ascending: false }),
    supabase.from("news").select("*").order("published_at", { ascending: false }),
    supabase.from("sponsors").select("*").order("sort_order"),
    supabase.from("site_settings").select("*")
  ]);

  const err = [t, r, tm, n, s, settings].find(x => x.error);

  if (err) {
    $("tournamentList").innerHTML =
      empty("Database setup is incomplete. Follow SETUP-GUIDE.md.");
    console.error(err.error);
    return;
  }

  const tournaments = t.data || [];
  const results = r.data || [];
  const teams = tm.data || [];
  const news = n.data || [];
  const sponsors = s.data || [];

  $("statTournaments").textContent = tournaments.length;
  $("statTeams").textContent = teams.length;

  $("tournamentList").innerHTML = tournaments.length
    ? tournaments.map(x => `
      <article class="event-card">
        <span class="tag">${esc(x.status || "Upcoming")}</span>
        <h3>${esc(x.name)}</h3>
        <div class="event-meta">
          <span>${esc(x.game || "BGMI")}</span>
          <span>${esc(x.event_date || "Date TBA")}</span>
        </div>
        <div class="event-prize">${money(x.prize_pool)}</div>
        ${x.registration_url
          ? `<a class="card-link" href="${esc(x.registration_url)}" target="_blank" rel="noopener">REGISTRATION ↗</a>`
          : ""}
      </article>
    `).join("")
    : empty("No tournaments published yet.");

  $("resultsList").innerHTML = results.length
    ? results.map(x => `
      <tr>
        <td>${esc(x.tournament_name)}</td>
        <td>${esc(x.winner || "—")}</td>
        <td>${esc(x.runner_up || "—")}</td>
        <td>${money(x.prize_pool)}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="4" class="empty-cell">No completed results yet.</td></tr>`;

  $("teamList").innerHTML = teams.length
    ? teams.map(x => `
      <article class="team-card">
        <span class="tag">${esc(x.category || "BGMI TEAM")}</span>
        <h3>${esc(x.name)}</h3>
        <p>${esc(x.players || "Roster details coming soon")}</p>
      </article>
    `).join("")
    : empty("No teams added yet.");

// News without Article Page
$("newsList").innerHTML = news.length
  ? news.map(x => `
      <article class="news-card">
        ${x.image_url
          ? `<img class="news-image" src="${esc(x.image_url)}" alt="${esc(x.title)}" loading="lazy" onerror="this.style.display='none'">`
          : ""}
        <div class="news-date">${esc(x.published_at || "RIVER UPDATE")}</div>
        <h3>${esc(x.title)}</h3>
        <p>${esc(x.body || "")}</p>
      </article>
    `).join("")
  : empty("No news posted yet.");
  
$("sponsorList").innerHTML = sponsors.length
  ? sponsors.map(x => `<span>${esc(x.name)}</span>`).join("")
  : "<span>PARTNERSHIPS</span><span>COMING SOON</span>";

const map = Object.fromEntries(
  (settings.data || []).map(x => [x.key, x.value])
);

if (map.hero_description)
  $("heroDescription").textContent = map.hero_description;

if (map.about_text)
  $("aboutText").textContent = map.about_text;
}

load();
