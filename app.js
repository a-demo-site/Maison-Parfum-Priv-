const CONFIG = {
  csvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR6zxv4YYveNHhDox4VBHK6UVYPtPoYJFuXBccDtzn7lvTvlbQDfrNLbBqMnwzjy98LLSESGg1Lq42C/pub?gid=0&single=true&output=csv",
  whatsappNumber: "919930466520",
  storeName: "Maison Parfum Privé"
};

const DEMO_CSV = `Category (Brand),Product Name,Price (INR),Image URL,Description,Size (ml),Fragrance Notes
Chanel,Chance Eau Tendre,11990,"https://source.unsplash.com/featured/1200x1200/?Chanel,Chance,perfume,bottle&sig=1","A bright and airy everyday scent with soft fruit, delicate florals, and a clean elegant finish.",50,"Grapefruit, quince, jasmine, white musk"
Chanel,Coco Mademoiselle Velvet,13490,"https://source.unsplash.com/featured/1200x1200/?Chanel,Coco,perfume,bottle&sig=2","A polished evening perfume with sparkling citrus, velvety rose, and a warm patchouli trail.",100,"Orange, Turkish rose, patchouli, vanilla"
Chanel,Bleu de Chanel Reserve,12490,"https://source.unsplash.com/featured/1200x1200/?Chanel,blue,perfume,bottle&sig=3","A refined woody aromatic fragrance that feels crisp at first and smooth, smoky, and confident later.",100,"Lemon zest, incense, cedarwood, sandalwood"
Dior,J'adore Lumiere,12990,"https://source.unsplash.com/featured/1200x1200/?Dior,Jadore,perfume,bottle&sig=4","A radiant floral scent with creamy petals and a graceful golden softness made for dressy daytime wear.",100,"Pear, jasmine sambac, ylang-ylang, musk"
Dior,Miss Dior Bloom,11790,"https://source.unsplash.com/featured/1200x1200/?Dior,Miss,Dior,perfume,bottle&sig=5","A romantic floral-fruity perfume with a fresh opening and a smooth rose-forward heart.",50,"Mandarin, peony, rose, soft woods"
Dior,Sauvage Intense Nuit,13990,"https://source.unsplash.com/featured/1200x1200/?Dior,Sauvage,perfume,bottle&sig=6","A bold modern scent with spicy freshness, dense woods, and a dark amber signature.",100,"Bergamot, black pepper, lavender, amberwood"
Creed,Aventus Noir,23990,"https://source.unsplash.com/featured/1200x1200/?Creed,Aventus,perfume,bottle&sig=7","A statement fragrance with juicy fruit on top and a powerful smoky-woody dry down.",50,"Pineapple, blackcurrant, birch smoke, oakmoss"
Creed,Silver Mountain Mist,21990,"https://source.unsplash.com/featured/1200x1200/?Creed,Silver,perfume,bottle&sig=8","A crisp and modern scent that feels cool, airy, and quietly luxurious throughout the day.",100,"Bergamot, green tea, blackcurrant, musk"
Creed,Green Irish Velvet,22990,"https://source.unsplash.com/featured/1200x1200/?Creed,green,perfume,bottle&sig=9","A fresh green fragrance with aromatic lift, smooth woods, and a polished masculine edge.",100,"Verbena, violet leaf, iris, sandalwood"
Yves Saint Laurent,Black Opium Midnight,11990,"https://source.unsplash.com/featured/1200x1200/?YSL,Black,Opium,perfume,bottle&sig=10","A rich sweet-warm perfume with coffee sparkle, creamy white florals, and sensual vanilla depth.",90,"Coffee, pear, orange blossom, vanilla"
Yves Saint Laurent,Libre Gold,12690,"https://source.unsplash.com/featured/1200x1200/?YSL,Libre,perfume,bottle&sig=11","A sharp yet elegant scent balancing aromatic freshness with glowing florals and smooth amber.",90,"Lavender, mandarin, jasmine, ambergris accord"
Yves Saint Laurent,Y Signature,11490,"https://source.unsplash.com/featured/1200x1200/?YSL,Y,perfume,bottle&sig=12","A clean modern fragrance with bright freshness, herbal depth, and a smooth woody base.",100,"Apple, ginger, sage, cedarwood"`;

const CATEGORY_ORDER = ["Chanel", "Dior", "Creed", "Yves Saint Laurent"];
const app = document.getElementById("app");

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000">
      <rect width="100%" height="100%" fill="#151515"/>
      <rect x="230" y="180" width="340" height="500" rx="24" fill="#262626" stroke="#c8a96a" stroke-width="8"/>
      <rect x="320" y="120" width="160" height="90" rx="12" fill="#c8a96a"/>
      <text x="50%" y="770" text-anchor="middle" fill="#c8c0b3" font-size="34" font-family="Arial">Perfume Image</text>
    </svg>
  `);

const state = {
  products: [],
  loading: true,
  error: ""
};

document.addEventListener("DOMContentLoaded", init);
window.addEventListener("hashchange", render);

async function init() {
  try {
    const csvText = await getCatalogCsv();
    const rows = parseCSV(csvText);
    const products = rows
      .map((row, index) => normalizeProduct(row, index))
      .filter(Boolean);

    state.products = products;
    state.loading = false;

    if (!location.hash) {
      location.hash = "#home";
    } else {
      render();
    }
  } catch (error) {
    state.loading = false;
    state.error = error.message || "Could not load products.";
    render();
  }
}

async function getCatalogCsv() {
  const url = CONFIG.csvUrl.trim();

  if (!url || url === "PASTE_GOOGLE_SHEET_CSV_URL_HERE") {
    return DEMO_CSV;
  }

  const bust = `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`;
  const response = await fetch(bust);

  if (!response.ok) {
    throw new Error("Could not fetch the Google Sheet CSV. Check the published link.");
  }

  return response.text();
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        value += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
    } else if (char === "\n" && !inQuotes) {
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else if (char !== "\r") {
      value += char;
    }
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  const cleaned = rows.filter((r) => r.some((cell) => String(cell).trim() !== ""));
  if (!cleaned.length) return [];

  const headers = cleaned[0].map((h) => h.trim());
  return cleaned.slice(1).map((cells) => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = (cells[index] || "").trim();
    });
    return obj;
  });
}

function normalizeProduct(row, index) {
  const category = row["Category (Brand)"]?.trim();
  const name = row["Product Name"]?.trim();
  const image = row["Image URL"]?.trim();
  const description = row["Description"]?.trim();
  const size = row["Size (ml)"]?.trim();
  const notes = row["Fragrance Notes"]?.trim();
  const priceRaw = row["Price (INR)"]?.trim();

  if (!category || !name) return null;

  const price = Number(String(priceRaw).replace(/[^\d.]/g, "")) || 0;

  return {
    id: `${slugify(category)}-${slugify(name)}-${index}`,
    category,
    name,
    price,
    image: image || PLACEHOLDER_IMAGE,
    description: description || "Luxury fragrance details coming soon.",
    size: size || "",
    notes: notes ? notes.split(",").map((n) => n.trim()).filter(Boolean) : [],
  };
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0
  }).format(value || 0);
}

function getRoute() {
  const hash = location.hash.replace(/^#/, "") || "home";
  const [view, ...rest] = hash.split("/");
  return {
    view,
    param: decodeURIComponent(rest.join("/"))
  };
}

function render() {
  if (state.loading) {
    app.innerHTML = `
      <section class="state-card">
        <p>Loading catalog...</p>
      </section>
    `;
    return;
  }

  if (state.error) {
    app.innerHTML = `
      <section class="state-card">
        <h2 class="empty-title">Could not load catalog</h2>
        <p class="muted">${escapeHtml(state.error)}</p>
      </section>
    `;
    return;
  }

  const route = getRoute();

  if (route.view === "category") {
    renderCategory(route.param);
  } else if (route.view === "product") {
    renderProduct(route.param);
  } else {
    renderHome();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderHome() {
  const categories = CATEGORY_ORDER.filter((name) =>
    state.products.some((product) => product.category === name)
  );

  const cards = categories.map((category) => {
    const items = state.products.filter((product) => product.category === category);
    const startPrice = Math.min(...items.map((p) => p.price));

    return `
      <a class="category-card" href="#category/${encodeURIComponent(category)}">
        <div>
          <h3>${escapeHtml(category)}</h3>
          <p>${items.length} products</p>
          <p>From ₹${formatPrice(startPrice)}</p>
        </div>
        <div class="category-arrow">View collection →</div>
      </a>
    `;
  }).join("");
    app.innerHTML = `
    <section class="carousel">
      <div class="carousel-track" id="carouselTrack">
        <div class="carousel-slide">
          <img src="https://images.unsplash.com/photo-1541643600914-78b084683702?w=900&q=80" alt="Chanel Collection" />
          <div class="carousel-caption">
            <p class="editorial-sub">Chanel · Exclusive Collection</p>
            <h2 class="editorial-title">Timeless<br>Elegance.</h2>
          </div>
        </div>
        <div class="carousel-slide">
          <img src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=900&q=80" alt="Dior Collection" />
          <div class="carousel-caption">
            <p class="editorial-sub">Dior · Haute Parfumerie</p>
            <h2 class="editorial-title">Born to<br>Bloom.</h2>
          </div>
        </div>
        <div class="carousel-slide">
          <img src="https://images.unsplash.com/photo-1590156206657-aec4e8708b27?w=900&q=80" alt="Creed Collection" />
          <div class="carousel-caption">
            <p class="editorial-sub">Creed · Heritage Since 1760</p>
            <h2 class="editorial-title">Wear Your<br>Legacy.</h2>
          </div>
        </div>
      </div>
      <div class="carousel-dots" id="carouselDots">
        <span class="dot active" data-index="0"></span>
        <span class="dot" data-index="1"></span>
        <span class="dot" data-index="2"></span>
      </div>
    </section>

    <div class="section-row">
      <div>
        <h2 class="section-title">Collections</h2>
      </div>
    </div>

    <section class="grid category-grid">
      ${cards}
    </section>
  `;
  initCarousel();
}

function renderCategory(categoryName) {
  const products = state.products.filter((product) => product.category === categoryName);

  if (!products.length) {
    app.innerHTML = `
      <section class="state-card">
        <a class="ghost-link" href="#home">← Back to home</a>
        <h2 class="empty-title" style="margin-top:16px;">Category not found</h2>
        <p class="muted">Please choose another brand.</p>
      </section>
    `;
    return;
  }

  const cards = products.map((product) => `
    <a class="product-card" href="#product/${encodeURIComponent(product.id)}">
      <div class="product-thumb-wrap">
        <img
          class="product-thumb"
          src="${escapeAttribute(product.image)}"
          alt="${escapeAttribute(product.name)}"
          loading="lazy"
          onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}'"
        />
      </div>
      <div class="product-body">
        <h3 class="product-name">${escapeHtml(product.name)}</h3>
        <div class="product-sub">
          <span>${escapeHtml(product.size)} ml</span>
          <span class="price">₹${formatPrice(product.price)}</span>
        </div>
      </div>
    </a>
  `).join("");

  app.innerHTML = `
    <div class="section-row">
      <div>
        <a class="ghost-link" href="#home">← Back to brands</a>
        <h2 class="section-title" style="margin-top:10px;">${escapeHtml(categoryName)}</h2>
        <p class="section-copy">${products.length} products in this collection.</p>
      </div>
    </div>

    <section class="grid product-grid">
      ${cards}
    </section>
  `;
}

function renderProduct(productId) {
  const product = state.products.find((item) => item.id === productId);

  if (!product) {
    app.innerHTML = `
      <section class="state-card">
        <a class="ghost-link" href="#home">← Back to home</a>
        <h2 class="empty-title" style="margin-top:16px;">Product not found</h2>
        <p class="muted">Please reopen the catalog from the brand list.</p>
      </section>
    `;
    return;
  }

  const whatsappLink = createWhatsAppLink(product);
  const notes = product.notes.length
    ? product.notes.map((note) => `<li class="note-chip">${escapeHtml(note)}</li>`).join("")
    : `<li class="note-chip">Notes coming soon</li>`;

  app.innerHTML = `
    <a class="ghost-link" href="#category/${encodeURIComponent(product.category)}">← Back to ${escapeHtml(product.category)}</a>

    <section class="detail-card" style="margin-top:14px;">
      <div class="detail-image-wrap">
        <img
          class="detail-image"
          src="${escapeAttribute(product.image)}"
          alt="${escapeAttribute(product.name)}"
          onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}'"
        />
      </div>

      <div class="detail-content">
        <p class="eyebrow" style="margin-bottom:8px;">${escapeHtml(product.category)}</p>
        <h2 class="detail-title">${escapeHtml(product.name)}</h2>
        <p class="detail-copy">${escapeHtml(product.description)}</p>

        <div class="meta-grid">
          <div class="meta-box">
            <div class="meta-label">Price</div>
            <div class="meta-value">₹${formatPrice(product.price)}</div>
          </div>
          <div class="meta-box">
            <div class="meta-label">Size</div>
            <div class="meta-value">${escapeHtml(product.size)} ml</div>
          </div>
        </div>

        <p class="meta-label">Fragrance notes</p>
        <ul class="notes">${notes}</ul>

        <div class="actions">
          <a class="cta-button" href="${whatsappLink}" target="_blank" rel="noopener">
            Buy / Enquire
          </a>
          <a class="secondary-button" href="#category/${encodeURIComponent(product.category)}">
            Back to collection
          </a>
        </div>
      </div>
    </section>
  `;
}

function createWhatsAppLink(product) {
  const cleanPhone = CONFIG.whatsappNumber.replace(/[^\d]/g, "");
  const message = `Hi, I'm interested in ${product.name} - ₹${formatPrice(product.price)}`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}
