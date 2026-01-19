const events = [
  {
    id: 1,
    title: "AAPL Q3 Earnings Call",
    symbol: "AAPL",
    category: "earnings",
    date: "2024-08-01",
    summary: "Consensus EPS: $1.31 | Revenue: $82.1B",
  },
  {
    id: 2,
    title: "FOMC Rate Decision",
    symbol: "FED",
    category: "macro",
    date: "2024-08-05",
    summary: "Rate decision with press conference",
  },
  {
    id: 3,
    title: "TSLA Delivery Update",
    symbol: "TSLA",
    category: "guidance",
    date: "2024-08-12",
    summary: "Focus on margin commentary and deliveries",
  },
  {
    id: 4,
    title: "MSFT Dividend Record Date",
    symbol: "MSFT",
    category: "dividend",
    date: "2024-08-15",
    summary: "Dividend: $0.75 per share",
  },
  {
    id: 5,
    title: "NVDA Q2 Earnings",
    symbol: "NVDA",
    category: "earnings",
    date: "2024-08-20",
    summary: "Watch data center growth and AI demand",
  },
  {
    id: 6,
    title: "GDP Advance Release",
    symbol: "US",
    category: "macro",
    date: "2024-08-25",
    summary: "First estimate of GDP for the quarter",
  },
];

const alerts = [];

const searchForm = document.querySelector("#search-form");
const resultsContainer = document.querySelector("#results");
const resultsCount = document.querySelector("#results-count");
const alertForm = document.querySelector("#alert-form");
const alertList = document.querySelector("#alerts");
const alertCount = document.querySelector("#alert-count");

const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const daysUntil = (date) => {
  const now = new Date();
  const target = new Date(date);
  const diffTime = target.getTime() - now.setHours(0, 0, 0, 0);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const renderEvents = (filtered) => {
  resultsContainer.innerHTML = "";
  resultsCount.textContent = `${filtered.length} events`;

  if (filtered.length === 0) {
    resultsContainer.innerHTML =
      "<p class=\"meta\">No events found. Try expanding your search.</p>";
    return;
  }

  filtered.forEach((event) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="pill">${event.symbol} · ${event.category}</div>
      <strong>${event.title}</strong>
      <div class="meta">${formatDate(event.date)} · ${event.summary}</div>
      <div class="actions">
        <span class="meta">${daysUntil(event.date)} days away</span>
        <button data-id="${event.id}">Add alert</button>
      </div>
    `;
    card.querySelector("button").addEventListener("click", () => {
      addAlertFromEvent(event);
    });
    resultsContainer.appendChild(card);
  });
};

const renderAlerts = () => {
  alertList.innerHTML = "";
  alertCount.textContent = `${alerts.length} alerts`;

  if (alerts.length === 0) {
    alertList.innerHTML =
      "<p class=\"meta\">No alerts yet. Add one from a search result or create your own.</p>";
    return;
  }

  alerts.forEach((alert) => {
    const card = document.createElement("div");
    card.className = "card alert-card";
    card.innerHTML = `
      <div class="pill">${alert.symbol} · ${alert.type}</div>
      <strong>Notify ${alert.window} day(s) before ${alert.title}</strong>
      <div class="meta">Scheduled: ${formatDate(alert.date)}</div>
      <div class="actions">
        <span class="meta">${alert.notes}</span>
        <button data-id="${alert.id}">Remove</button>
      </div>
    `;
    card.querySelector("button").addEventListener("click", () => {
      removeAlert(alert.id);
    });
    alertList.appendChild(card);
  });
};

const filterEvents = ({ keyword, category, range }) => {
  const keywordLower = keyword.trim().toLowerCase();
  const windowDays = Number(range);

  return events.filter((event) => {
    const matchesKeyword =
      keywordLower.length === 0 ||
      event.title.toLowerCase().includes(keywordLower) ||
      event.symbol.toLowerCase().includes(keywordLower);
    const matchesCategory = category === "all" || event.category === category;
    const withinRange = daysUntil(event.date) <= windowDays;

    return matchesKeyword && matchesCategory && withinRange;
  });
};

const addAlertFromEvent = (event) => {
  const existing = alerts.find(
    (alert) => alert.symbol === event.symbol && alert.type === event.category
  );
  if (existing) {
    existing.notes = "Already watching this event";
    renderAlerts();
    return;
  }

  alerts.push({
    id: Date.now(),
    symbol: event.symbol,
    type: event.category,
    window: 3,
    title: event.title,
    date: event.date,
    notes: "Created from search results",
  });

  renderAlerts();
};

const removeAlert = (id) => {
  const index = alerts.findIndex((alert) => alert.id === id);
  if (index >= 0) {
    alerts.splice(index, 1);
    renderAlerts();
  }
};

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const keyword = document.querySelector("#keyword").value;
  const category = document.querySelector("#category").value;
  const range = document.querySelector("#date-range").value;
  const filtered = filterEvents({ keyword, category, range });
  renderEvents(filtered);
});

alertForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const symbol = document.querySelector("#alert-symbol").value.trim().toUpperCase();
  const type = document.querySelector("#alert-type").value;
  const window = document.querySelector("#alert-window").value;

  if (!symbol) {
    return;
  }

  alerts.push({
    id: Date.now(),
    symbol,
    type,
    window,
    title: `${symbol} ${type}`,
    date: new Date().toISOString(),
    notes: "Custom alert created",
  });

  alertForm.reset();
  renderAlerts();
});

renderEvents(filterEvents({ keyword: "", category: "all", range: 30 }));
renderAlerts();
