let coins = [];

const form = document.getElementById("search-form");
const input = document.getElementById("coin-input");
const refreshBtn = document.getElementById("refresh-btn");
const statusArea = document.getElementById("status-area");
const coinsGrid = document.getElementById("coins-grid");

const API_BASE = "https://api.coingecko.com/api/v3";
const TOP_COUNT = 12; // تعداد ارزهایی که اول صفحه نشون داده می‌شه

//  اسم فارسی به آیدی CoinGecko
const FA_ALIASES = {
  "بیت کوین": "bitcoin",
  بیتکوین: "bitcoin",
  اتریوم: "ethereum",
  تتر: "tether",
  "دوج کوین": "dogecoin",
  دوج‌کوین: "dogecoin",
  ریپل: "ripple",
  سولانا: "solana",
  کاردانو: "cardano",
  "بایننس کوین": "binancecoin",
  ترون: "tron",
  "لایت کوین": "litecoin",
  لایتکوین: "litecoin",
};

function normalizeCoinId(raw) {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/\u200c/g, " ") // نیم‌فاصله -> فاصله
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\s+/g, " ");
  return FA_ALIASES[cleaned] || cleaned.replace(/ /g, "-");
}

function showStatus(message, type = "loading") {
  statusArea.hidden = false;
  statusArea.textContent = message;
  statusArea.classList.remove("is-loading", "is-error");
  statusArea.classList.add(type === "error" ? "is-error" : "is-loading");
}

function hideStatus() {
  statusArea.hidden = true;
  statusArea.textContent = "";
  statusArea.classList.remove("is-loading", "is-error");
}

function renderEmptyState() {
  coinsGrid.innerHTML = `
    <div class="empty-state">
      <span class="empty-icon">◈</span>
      <p class="empty-title">ارزی برای نمایش وجود ندارد</p>
      <p class="empty-text">اسم یه ارز (مثل bitcoin) رو وارد کن یا دکمه‌ی به‌روزرسانی رو بزن</p>
    </div>
  `;
}

function formatPrice(price) {
  if (price == null) return "—";
  // ارزهای خیلی ارزون (مثل شیبا) به رقم اعشار بیشتری نیاز دارن
  const digits = price < 1 ? 6 : 2;
  return "$" + price.toLocaleString("en-US", { maximumFractionDigits: digits });
}

function formatChange(change) {
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}%`;
}

function createCoinCard(coin) {
  const card = document.createElement("div");
  card.className = "coin-card";
  card.dataset.id = coin.id;

  const head = document.createElement("div");
  head.className = "coin-head";

  if (coin.image) {
    const img = document.createElement("img");
    img.className = "coin-img";
    img.src = coin.image;
    img.alt = coin.name;
    img.loading = "lazy";
    head.append(img);
  }

  const titles = document.createElement("div");

  const name = document.createElement("p");
  name.className = "coin-name";
  name.textContent = coin.name;

  const symbol = document.createElement("p");
  symbol.className = "coin-symbol";
  symbol.textContent = coin.symbol;

  titles.append(name, symbol);
  head.append(titles);

  const price = document.createElement("p");
  price.className = "coin-price";
  price.textContent = formatPrice(coin.price);

  const change = document.createElement("p");
  const isUp = coin.change24h >= 0;
  change.className = `coin-change ${isUp ? "up" : "down"}`;
  change.textContent = formatChange(coin.change24h);

  const removeBtn = document.createElement("button");
  removeBtn.className = "remove-btn";
  removeBtn.type = "button";
  removeBtn.textContent = "حذف";

  card.append(head, price, change, removeBtn);
  return card;
}

function renderCoins() {
  if (coins.length === 0) {
    renderEmptyState();
    return;
  }
  coinsGrid.innerHTML = "";
  coins.forEach((coin) => coinsGrid.append(createCoinCard(coin)));
}

// تبدیل خروجی API به ساختار داخلی برنامه
function mapCoin(item) {
  return {
    id: item.id,
    name: item.name,
    symbol: (item.symbol || "").toUpperCase(),
    image: item.image,
    price: item.current_price,
    change24h: item.price_change_percentage_24h ?? 0,
  };
}

async function requestMarkets(params) {
  const query = new URLSearchParams({
    vs_currency: "usd",
    sparkline: "false",
    ...params,
  });
  const res = await fetch(`${API_BASE}/coins/markets?${query}`);
  if (!res.ok) {
    throw new Error(`HTTP_${res.status}`);
  }
  const data = await res.json();
  return data.map(mapCoin);
}

// برترین ارزها بر اساس ارزش بازار
function fetchTopCoins(count = TOP_COUNT) {
  return requestMarkets({
    order: "market_cap_desc",
    per_page: String(count),
    page: "1",
  });
}

// چند ارز مشخص با یک درخواست
function fetchCoinsByIds(ids) {
  return requestMarkets({ ids: ids.join(",") });
}

async function loadTopCoins() {
  showStatus("در حال دریافت قیمت‌ها...", "loading");
  try {
    coins = await fetchTopCoins();
    hideStatus();
    renderCoins();
  } catch (err) {
    showStatus(
      "دریافت قیمت‌ها ناموفق بود؛ چند ثانیه بعد دوباره تلاش کن.",
      "error",
    );
    renderCoins();
  }
}

async function addCoin(rawId) {
  const coinId = normalizeCoinId(rawId);
  if (!coinId) return;

  if (coins.some((c) => c.id === coinId)) {
    showStatus("این ارز قبلاً اضافه شده است.", "error");
    setTimeout(hideStatus, 2000);
    return;
  }
  showStatus("در حال دریافت اطلاعات...", "loading");

  try {
    const result = await fetchCoinsByIds([coinId]);
    if (result.length === 0) {
      throw new Error("NOT_FOUND");
    }
    coins.unshift(result[0]); // ارز جدید اول لیست میاد
    hideStatus();
    renderCoins();
  } catch (err) {
    if (err.message === "NOT_FOUND") {
      showStatus(
        "ارزی با این نام پیدا نشد. نام را دقیق‌تر وارد کن (مثلاً bitcoin).",
        "error",
      );
    } else {
      showStatus("دریافت اطلاعات ناموفق بود؛ دوباره تلاش کنید.", "error");
    }
  }
}

async function refreshAll() {
  if (coins.length === 0) {
    await loadTopCoins();
    return;
  }
  showStatus("در حال به‌روزرسانی قیمت‌ها...", "loading");

  try {
    const ids = coins.map((c) => c.id);
    const fresh = await fetchCoinsByIds(ids);
    // ترتیب فعلی کارت‌ها حفظ بشه
    const byId = new Map(fresh.map((c) => [c.id, c]));
    coins = ids.map((id) => byId.get(id)).filter(Boolean);
    hideStatus();
    renderCoins();
  } catch (err) {
    showStatus("به‌روزرسانی ناموفق بود؛ دوباره تلاش کنید.", "error");
  }
}

function removeCoin(coinId) {
  coins = coins.filter((c) => c.id !== coinId);
  renderCoins();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  addCoin(input.value);
  input.value = "";
  input.focus();
});

refreshBtn.addEventListener("click", refreshAll);

coinsGrid.addEventListener("click", (e) => {
  if (e.target.matches(".remove-btn")) {
    const card = e.target.closest(".coin-card");
    if (card) removeCoin(card.dataset.id);
  }
});

// شروع: لیست برترین ارزها رو بگیر و نشون بده
loadTopCoins();

const themeBtn = document.getElementById("theme-toggle");

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeBtn.textContent = theme === "dark" ? "☀️ حالت روشن" : "🌙 حالت تاریک";
  localStorage.setItem("theme", theme);
}

themeBtn.addEventListener("click", () => {
  const isLight = document.documentElement.dataset.theme === "light";
  setTheme(isLight ? "dark" : "light");
});

setTheme(localStorage.getItem("theme") || "dark");
