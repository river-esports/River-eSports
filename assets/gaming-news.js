
import { supabase, isConfigured } from "./supabase.js";

const newsList = document.getElementById("newsList");
const filterButtons = document.querySelectorAll(".filters button");

let allNews = [];
let activeCategory = "All";

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function renderNews() {
  const filtered = activeCategory === "All"
    ? allNews
    : allNews.filter(post => post.category === activeCategory);

  if (!filtered.length) {
    newsList.innerHTML = '<p class="message">No gaming news available in this category.</p>';
    return;
  }

  newsList.innerHTML = filtered.map(post => {
    const date = post.published_at
      ? new Date(post.published_at).toLocaleDateString("en-IN")
      : "";

    const image = post.image_url
      ? `<img src="${escapeHTML(post.image_url)}" alt="${escapeHTML(post.title)}" loading="lazy">`
      : "";

    return `
  <article class="news-card">
    <a href="article.html?id=${encodeURIComponent(post.id)}"
       style="color:inherit;text-decoration:none;display:block;">
      ${image}
      <div class="news-content">
        <p class="news-category">${escapeHTML(post.category)}</p>
        <h2>${escapeHTML(post.title)}</h2>
        <p class="news-date">${escapeHTML(date)}</p>
        <p class="news-body">${escapeHTML(post.body || "")}</p>
        <span>READ FULL ARTICLE ↗</span>
      </div>
    </a>
  </article>
`;
  }).join("");
}

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;

    filterButtons.forEach(item =>
      item.classList.toggle("active", item === button)
    );

    renderNews();
  });
});

async function loadNews() {
  if (!isConfigured) {
    newsList.textContent = "Website database is not configured.";
    return;
  }

  const { data, error } = await supabase
    .from("gaming_news")
    .select("*")
    .eq("status", "Published")
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error) {
    console.error(error);
    newsList.textContent = "Unable to load gaming news. Please try again later.";
    return;
  }

  allNews = data || [];
  renderNews();
}

loadNews();
