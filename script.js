const STARTED_AT = new Date("2026-02-12T16:36:00+05:30");
const STORAGE_KEY = "a-little-life-together-v1";

const CHAPTERS = [
  ["01", "How our story began", "The first pages, the little rituals, the things that become ours before we even notice.", "where-we-met.jpg"],
  ["02", "Soft, lovey-dovey things", "A few ways to keep choosing tenderness on ordinary Tuesdays, too.", "little-traditions.jpg"],
  ["03", "A little chaos, a lot of laughing", "For the stories that will make absolutely no sense to anyone else.", "silly-us.jpg"],
  ["04", "A place that feels like ours", "No rush on any of this. Just daydreams about rooms, plants, and a key we both have.", "cozy-home.jpg"],
  ["05", "Money, plans & grown-up things", "A few bigger goals, to talk through together whenever they feel right.", null],
  ["06", "Windows down, nowhere urgent", "Roads, playlists, and the lovely luxury of taking the long way.", null],
  ["07", "India, one little trip at a time", "A map of places to see here, with chai breaks and detours included.", null],
  ["08", "A map with no edges", "The faraway places we can keep tucked in the back of our minds.", null],
  ["09", "Trips that become our stories", "The overplanned ones, the happy accidents, the ones we’ll retell at dinner.", "dream-trip.jpg"],
  ["10", "A little brave together", "New heights, new water, and cheering each other on from nearby.", "growing-together.jpg"],
  ["11", "If family becomes our story", "A gentle collection of possibilities, for a future we get to choose together.", "future-us.jpg"],
  ["12", "Paws, people & little family things", "For the small, affectionate chaos that makes a home feel alive.", null],
  ["13", "The people who made us", "A few ways to make lovely memories with the people we love.", null],
  ["14", "Promises, at our own pace", "Big milestones belong to both of us. We can decide what they mean, in our time.", null],
  ["15", "Proof of all these days", "Photos, videos, ticket stubs, and the wonderfully ordinary evidence of being here.", "first-date.jpg"],
  ["16", "Date nights & something delicious", "For the places we’ll find, the recipes we’ll ruin, and the ones we’ll make again.", "food-and-dates.jpg"],
  ["17", "Things to learn side by side", "A chance to be beginners together, and enjoy being a little bad at it first.", null],
  ["18", "The “we actually did that” chapter", "The improbable, the exhilarating, and the stories that start with “remember when…”", null],
  ["19", "A life that fits us", "The long-range daydreams: a home, some freedom, and a life that feels like our own.", "future-us.jpg"],
  ["20", "A note to future us", "For the version of us that has lived a little more and knows which ideas became stories.", "our-long-story.jpg"]
].map(([id, title, intro, image]) => ({ id, title, intro, image }));

const HORIZONS = [
  ["", "Choose our horizon"],
  ["now", "In the next year"],
  ["soon", "In a few years"],
  ["later", "Much later"],
  ["legacy", "For future us"]
];

function readState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      done: new Set(Array.isArray(parsed.done) ? parsed.done : []),
      saved: new Set(Array.isArray(parsed.saved) ? parsed.saved : []),
      horizons: parsed.horizons && typeof parsed.horizons === "object" ? parsed.horizons : {}
    };
  } catch {
    return { done: new Set(), saved: new Set(), horizons: {} };
  }
}

const state = readState();
let allItems = [];
let activeFilter = "all";
const chaptersRoot = document.querySelector("#chapters");
const countLabel = document.querySelector("#list-count");

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      done: [...state.done],
      saved: [...state.saved],
      horizons: state.horizons
    }));
  } catch {
    // The page still works if browser storage is unavailable.
  }
  updateSavedCount();
}

function updateCounter() {
  const now = new Date();
  let years = now.getUTCFullYear() - STARTED_AT.getUTCFullYear();
  const anniversary = (year) => new Date(Date.UTC(
    STARTED_AT.getUTCFullYear() + year,
    STARTED_AT.getUTCMonth(),
    STARTED_AT.getUTCDate(),
    STARTED_AT.getUTCHours(),
    STARTED_AT.getUTCMinutes(),
    STARTED_AT.getUTCSeconds()
  ));
  if (anniversary(years) > now) years -= 1;
  const sinceAnniversary = Math.max(0, now - anniversary(Math.max(0, years)));
  const day = 86_400_000;
  const hour = 3_600_000;
  const minute = 60_000;
  const days = Math.floor(sinceAnniversary / day);
  const hours = Math.floor((sinceAnniversary % day) / hour);
  const minutes = Math.floor((sinceAnniversary % hour) / minute);
  const seconds = Math.floor((sinceAnniversary % minute) / 1_000);
  for (const [id, value] of Object.entries({ years, days, hours, minutes, seconds })) {
    const element = document.getElementById(id);
    if (element) element.textContent = String(value).padStart(id === "years" ? 1 : 2, "0");
  }
}

function makeChapter(chapter, items, index) {
  const section = document.createElement("details");
  section.className = "chapter";
  section.id = `chapter-${chapter.id}`;
  section.open = index === 0;

  const summary = document.createElement("summary");
  summary.className = "chapter-heading";
  summary.innerHTML = `<span class="chapter-number">CHAPTER ${chapter.id}</span><span class="chapter-title"></span><span class="chapter-count">${items.length} little ideas</span>`;
  summary.querySelector(".chapter-title").textContent = chapter.title;

  const content = document.createElement("div");
  content.className = "chapter-content";
  const intro = document.createElement("p");
  intro.className = "chapter-intro";
  intro.textContent = chapter.intro;
  content.append(intro);

  if (chapter.image) {
    const figure = document.createElement("figure");
    figure.className = "chapter-photo art-frame";
    figure.dataset.art = chapter.image;
    const image = document.createElement("img");
    image.src = `assets/${chapter.image}`;
    image.alt = `A doodle of us for ${chapter.title.toLowerCase()}`;
    image.loading = "lazy";
    const caption = document.createElement("figcaption");
    caption.innerHTML = `<span class="fallback-note">${chapter.image}</span><span class="art-caption">a drawing for this chapter</span>`;
    figure.append(image, caption);
    content.append(figure);
  }

  const list = document.createElement("ol");
  list.className = "idea-list";
  for (const item of items) list.append(makeIdea(item));
  content.append(list);
  section.append(summary, content);
  return section;
}

function makeIdea(item) {
  const row = document.createElement("li");
  row.className = "idea";
  row.dataset.number = item.number;
  row.dataset.chapter = item.chapter;

  const number = document.createElement("span");
  number.className = "idea-number";
  number.textContent = String(item.number).padStart(3, "0");

  const label = document.createElement("p");
  label.className = "idea-label";
  label.textContent = item.title;

  const actions = document.createElement("div");
  actions.className = "idea-actions";

  const checkLabel = document.createElement("label");
  checkLabel.className = "idea-check";
  checkLabel.title = "Mark this one as a memory we made";
  const check = document.createElement("input");
  check.type = "checkbox";
  check.checked = state.done.has(item.number);
  check.setAttribute("aria-label", `Mark idea ${item.number} complete`);
  const checkMark = document.createElement("span");
  checkMark.setAttribute("aria-hidden", "true");
  checkMark.textContent = "✓";
  checkLabel.append(check, checkMark);
  if (check.checked) row.classList.add("is-done");
  check.addEventListener("change", () => {
    check.checked ? state.done.add(item.number) : state.done.delete(item.number);
    row.classList.toggle("is-done", check.checked);
    saveState();
    applyFilters();
  });

  const save = document.createElement("button");
  save.className = "idea-save";
  save.type = "button";
  save.textContent = state.saved.has(item.number) ? "★" : "☆";
  save.setAttribute("aria-pressed", String(state.saved.has(item.number)));
  save.setAttribute("aria-label", state.saved.has(item.number) ? "Remove from saved ideas" : "Save this idea");
  save.title = "Keep this idea close";
  save.addEventListener("click", () => {
    if (state.saved.has(item.number)) state.saved.delete(item.number);
    else state.saved.add(item.number);
    save.textContent = state.saved.has(item.number) ? "★" : "☆";
    save.setAttribute("aria-pressed", String(state.saved.has(item.number)));
    save.setAttribute("aria-label", state.saved.has(item.number) ? "Remove from saved ideas" : "Save this idea");
    saveState();
    applyFilters();
  });

  const more = document.createElement("details");
  more.className = "idea-more";
  const moreSummary = document.createElement("summary");
  moreSummary.setAttribute("aria-label", "Choose when this might happen");
  moreSummary.title = "Choose when this might happen";
  moreSummary.textContent = "···";
  const menu = document.createElement("div");
  menu.className = "horizon-menu";
  const selectLabel = document.createElement("label");
  selectLabel.textContent = "When might we?";
  const select = document.createElement("select");
  select.setAttribute("aria-label", `Set a time horizon for idea ${item.number}`);
  for (const [value, title] of HORIZONS) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = title;
    select.append(option);
  }
  select.value = state.horizons[item.number] || "";
  select.addEventListener("change", () => {
    if (select.value) state.horizons[item.number] = select.value;
    else delete state.horizons[item.number];
    saveState();
    applyFilters();
  });
  menu.append(selectLabel, select);
  more.append(moreSummary, menu);

  actions.append(checkLabel, save, more);
  row.append(number, label, actions);
  return row;
}

function filterIncludes(item, query) {
  if (query && !item.title.toLocaleLowerCase().includes(query)) return false;
  if (activeFilter === "saved" && !state.saved.has(item.number)) return false;
  if (["now", "soon", "later", "legacy"].includes(activeFilter) && state.horizons[item.number] !== activeFilter) return false;
  return true;
}

function applyFilters() {
  const query = document.querySelector("#search").value.trim().toLocaleLowerCase();
  let visibleCount = 0;
  for (const chapter of CHAPTERS) {
    const section = document.getElementById(`chapter-${chapter.id}`);
    const items = allItems.filter((item) => item.chapter === chapter.id);
    let chapterCount = 0;
    for (const item of items) {
      const row = section.querySelector(`[data-number="${item.number}"]`);
      const visible = filterIncludes(item, query);
      row.hidden = !visible;
      if (visible) chapterCount += 1;
    }
    section.hidden = chapterCount === 0;
    section.querySelector(".chapter-count").textContent = `${chapterCount} ${chapterCount === 1 ? "little idea" : "little ideas"}`;
    if (query || activeFilter !== "all") section.open = chapterCount > 0;
    visibleCount += chapterCount;
  }
  const empty = document.querySelector(".empty-results");
  if (visibleCount === 0 && !empty) {
    const note = document.createElement("p");
    note.className = "empty-results";
    note.textContent = "Nothing by that name yet. Maybe it’s one of our ideas still waiting to be written.";
    chaptersRoot.append(note);
  } else if (visibleCount > 0 && empty) empty.remove();
  countLabel.textContent = query || activeFilter !== "all"
    ? `${visibleCount} ${visibleCount === 1 ? "idea" : "ideas"} found`
    : `${allItems.length} ideas, no rush.`;
  updateSavedCount();
}

function updateSavedCount() {
  document.querySelector("#saved-count").textContent = String(state.saved.size);
}

function setupFilters() {
  document.querySelectorAll(".filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      document.querySelectorAll(".filter-button").forEach((filter) => filter.classList.toggle("is-active", filter === button));
      applyFilters();
    });
  });
  document.querySelector("#search").addEventListener("input", applyFilters);
}

function setupSurprise() {
  const note = document.querySelector("#surprise-note");
  const text = document.querySelector("#surprise-text");
  document.querySelector("#surprise-trigger").addEventListener("click", () => {
    const options = allItems.filter((item) => !state.done.has(item.number));
    if (!options.length) {
      text.textContent = "Look at us. We made every single one. What shall we dream up next?";
    } else {
      const picked = options[Math.floor(Math.random() * options.length)];
      const chapter = document.getElementById(`chapter-${picked.chapter}`);
      chapter.open = true;
      document.querySelector("#search").value = "";
      activeFilter = "all";
      document.querySelectorAll(".filter-button").forEach((button) => button.classList.toggle("is-active", button.dataset.filter === "all"));
      applyFilters();
      const row = chapter.querySelector(`[data-number="${picked.number}"]`);
      text.textContent = picked.title;
      row.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    }
    note.classList.add("is-visible");
  });
  document.querySelector("#surprise-close").addEventListener("click", () => note.classList.remove("is-visible"));
}

function setupRevealAnimations() {
  if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const sections = document.querySelectorAll(
    ".time-together, .letter-scene, .doodle-interlude, .bucket-intro, .list-tools, .chapters, .last-page"
  );
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  sections.forEach((section) => {
    section.classList.add("reveal-on-scroll");
    observer.observe(section);
  });
}

function setupArtFallbacks() {
  document.querySelectorAll(".art-frame img").forEach((image) => {
    const figure = image.closest(".art-frame");
    const markEmpty = () => figure.classList.add("is-empty");
    image.addEventListener("error", markEmpty, { once: true });
    if (image.complete && image.naturalWidth === 0) markEmpty();
  });
}

async function start() {
  updateCounter();
  window.setInterval(updateCounter, 1_000);
  setupRevealAnimations();
  setupFilters();
  try {
    const response = await fetch("bucket-list.json");
    if (!response.ok) throw new Error("Bucket list could not be loaded");
    allItems = await response.json();
    if (!Array.isArray(allItems) || allItems.length !== 700) throw new Error("Bucket list content is incomplete");
    const chaptersWithItems = CHAPTERS.map((chapter, index) => ({
      chapter,
      items: allItems.filter((item) => item.chapter === chapter.id),
      index
    }));
    chaptersRoot.replaceChildren(...chaptersWithItems.map(({ chapter, items, index }) => makeChapter(chapter, items, index)));
    setupArtFallbacks();
    setupSurprise();
    applyFilters();
  } catch {
    const message = document.createElement("p");
    message.className = "empty-results";
    message.textContent = "The pages are here, but the list didn’t load. Please check that bucket-list.json sits beside index.html.";
    chaptersRoot.replaceChildren(message);
  }
}

start();
