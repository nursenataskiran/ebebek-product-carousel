(async () => {
  
  const formatTRY = n => new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2
  }).format(n);

  const ROOT_ID = "ebb-min";
  const PRODUCTS_CACHE_KEY     = "ebbRecoProducts";
  const PRODUCTS_CACHE_VERSION = "v1";
  const FAVORITES_CACHE_KEY = "ebbFavorites";
  
  if (window.location.pathname !== '/' && window.location.pathname !== '/index.html' && !window.location.href.includes('ebebek.com')) {
    console.log("Wrong page!");
    return;
  }
  
  async function fetchData() {
    try {
      const url = "https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json";
      const res = await fetch(url, { method: "GET", cache: "no-store", headers: { "Accept": "application/json" } });
      if (!res.ok) throw new Error('Ağ hatası: ' + res.status);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Beklenmeyen format");
      return data;
    } catch (error) {
      console.log("Fetch error!", error);
      return [];
    }
  }

 function cacheSet(items, {
    key = PRODUCTS_CACHE_KEY,
    version = PRODUCTS_CACHE_VERSION
  } = {}) {
    try {
      localStorage.setItem(key, JSON.stringify({ version, ts: Date.now(), items }));
    } catch (e) {
      console.warn("[cacheSet] yazılamadı:", e);
    }
  }

 async function cacheGet({
    key = PRODUCTS_CACHE_KEY,
    version = PRODUCTS_CACHE_VERSION,
    force = false,
    fetcher = null, 
  } = {}) {
    if (!force) {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const obj = JSON.parse(raw);
          if (obj?.version === version && Array.isArray(obj.items)) {
            return obj.items; 
          }
        } catch (e) {
          console.warn("[cacheGet] parse hatası:", e);
        }
      }
    }

    //Cache yoksa veya force true ise — fetcher varsa çek ve yaz
    if (typeof fetcher === "function") {
      const items = await fetcher(); 
      if (Array.isArray(items) && items.length) {
        cacheSet(items, { key, version }); 
      }
      return items; 
    }

    //Fetcher verilmediyse, sadece cache arandığında null dön
    return null;
  }


 function calculateDiscount(price, original) {
    const p = Number(price);
    const o = Number(original);
    if (!Number.isFinite(p) || !Number.isFinite(o) || o <= p) return "";
    const pct = Math.round((1 - p / o) * 100);
    return `%${pct}`;
  }

 function createLikeButton(initial = false) {
    const wrap = document.createElement('like-button');   
    wrap.setAttribute('aria-pressed', String(!!initial));

    wrap.innerHTML = `
    <button class="like-button" type="button" aria-pressed="${initial}"
            aria-label="${initial ? 'Favorilerden çıkar' : 'Favorilere ekle'}">
      <svg class="icon" xmlns="http://www.w3.org/2000/svg"
           width="10.503" height="10.625" viewBox="0 0 17.503 15.625" aria-hidden="true">
        <path id="Fill" d="M8.752,15.625h0L1.383,8.162a4.824,4.824,0,0,1,0-6.762,4.679,4.679,0,0,1,6.674,0l.694.7.694-.7a4.678,4.678,0,0,1,6.675,0,4.825,4.825,0,0,1,0,6.762L8.752,15.624ZM4.72,1.25A3.442,3.442,0,0,0,2.277,2.275a3.562,3.562,0,0,0,0,5l6.475,6.556,6.475-6.556a3.563,3.563,0,0,0,0-5A3.443,3.443,0,0,0,12.786,1.25h-.01a3.415,3.415,0,0,0-2.443,1.038L8.752,3.9,7.164,2.275A3.442,3.442,0,0,0,4.72,1.25Z"></path>
      </svg>
    </button>
  `;

    const btn = wrap.querySelector('button');

    if (initial) btn.classList.add('liked');

    const toggle = () => {
        const now = btn.getAttribute('aria-pressed') === 'true' ? false : true;
        btn.setAttribute('aria-pressed', String(now));
        wrap.setAttribute('aria-pressed', String(now));
        btn.classList.toggle('liked', now); 
        wrap.dispatchEvent(new CustomEvent('toggle', { detail: { liked: now }, bubbles: true }));
    };

    btn.addEventListener('click', toggle);
    return wrap;
 }


  function getFav() {
    try {
      const raw = localStorage.getItem(FAVORITES_CACHE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }


  function setFav(id, liked) {
    const arr = getFav();
    const key = String(id);
    const i = arr.indexOf(key);

    if (liked && i === -1) {
      arr.push(key);
    } else if (!liked && i !== -1) {
      arr.splice(i, 1);
    }

    try {
      localStorage.setItem(FAVORITES_CACHE_KEY, JSON.stringify(arr));
    } catch {}
  }

 function createNavigationButtons() {
    const prevBtn = document.createElement('button');
    prevBtn.className = 'ebb-nav-btn ebb-prev-btn';
    prevBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" 
       stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="20" y1="12" x2="4" y2="12"></line>
      <polyline points="10,6 4,12 10,18"></polyline>
      </svg>
      `;
    prevBtn.setAttribute('aria-label', 'Önceki ürünler');

    const nextBtn = document.createElement('button');
    nextBtn.className = 'ebb-nav-btn ebb-next-btn';
    nextBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" 
         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="4" y1="12" x2="20" y2="12"></line>
        <polyline points="14,6 20,12 14,18"></polyline>
      </svg>
      `;
    nextBtn.setAttribute('aria-label', 'Sonraki ürünler');

    return { prevBtn, nextBtn };
 }

 
 function setupNavigation(carousel) {
    const track = carousel.querySelector('.ebb-track');
    const { prevBtn, nextBtn } = createNavigationButtons();
    
  
    carousel.appendChild(prevBtn);
    carousel.appendChild(nextBtn);
    
    const getScrollAmount = () => {
      const firstCard = track.querySelector('.ebb-card');
      const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 0;
      const gap = parseInt(getComputedStyle(track).gap) || 16;
      return cardWidth + gap;
    };
    
    const scrollPrev = () => {
      const scrollAmount = getScrollAmount();
      track.scrollBy({ 
        left: -scrollAmount, 
        behavior: 'smooth' 
      });
    };
    
    const scrollNext = () => {
      const scrollAmount = getScrollAmount();
      track.scrollBy({ 
        left: scrollAmount, 
        behavior: 'smooth' 
      });
    };

    prevBtn.addEventListener('click', scrollPrev);
    nextBtn.addEventListener('click', scrollNext);
  }

 function createProductCard(p) {
  const card = document.createElement('div');
  card.className = 'ebb-card';
  if (p.id) card.dataset.id = p.id;

  const name = document.createElement('product-name');
  const brandInline = document.createElement('brand');
  brandInline.textContent = p.brand ?? '';
  name.append(brandInline, ' - ', p.name ?? '');

  const image = document.createElement('img');
  if (p.img) image.src = p.img;
  image.alt = p.name ?? p.brand ?? 'product';

  const priceEl = document.createElement('price');
    if (p.price != null) {
      const formatted = formatTRY(p.price); 
      const [whole, rest] = formatted.split(',');
    if (rest) {
      priceEl.innerHTML = `${whole},<span class="cents">${rest} <span class="tl">TL</span></span>`;
    } else {
      priceEl.innerHTML = `${formatted}<span class="cents"><span class="tl">TL</span></span>`;
    }
  }
  const original = document.createElement('original-price');
  const hasOriginal = Number(p.original_price) > Number(p.price);
  if (hasOriginal) original.textContent = `${formatTRY(p.original_price)} TL`;

  const discount = document.createElement('discount');
  if (hasOriginal) discount.textContent = calculateDiscount(p.price, p.original_price);

  const like = createLikeButton(p.id && getFav().includes(String(p.id)));

  like.addEventListener('toggle', (e) => {
    if (!p.id) return;
    setFav(p.id, !!e.detail?.liked);
    });

  const priceWrap = document.createElement('div');      
  priceWrap.className = 'ebb-price-wrap';

  if (hasOriginal) {
    const promoRow = document.createElement('div');    
    promoRow.className = 'ebb-promo-row';
    promoRow.append(original, discount);
    priceWrap.appendChild(promoRow);
    card.classList.add('has-discount');
  }

  priceWrap.appendChild(priceEl);                      

  const addBtn = document.createElement('button');
  addBtn.className = 'ebb-add-btn';
  addBtn.type = 'button';
  addBtn.setAttribute('aria-label', 'Sepete ekle');

  card.append(like, image, name, priceWrap, addBtn);

  if (p.url) {
  card.setAttribute('role', 'link');
  card.setAttribute('tabindex', '0');
  card.dataset.href = p.url;

  const shouldIgnore = (el) =>
    el.closest('button, .like-button, .ebb-add-btn, a');

  const go = () => window.location.href = p.url;

  card.addEventListener('click', (e) => {
    if (shouldIgnore(e.target)) return; 
    go();
  });
  }
  return card;
  }



 function buildHTML(products = [], opts = {}) {
    const { perView = 4, gap = 16, id = 'ebb-carousel' } = opts;

    const banner = document.createElement('div');
    banner.className = 'ebb-banner';

    const carousel = document.createElement('div');
    carousel.className = 'ebb-carousel';
    carousel.id = id;
    carousel.style.setProperty('--per-view', perView);
    carousel.style.setProperty('--gap', `${gap}px`);

    const header = document.createElement('div');
    header.className = 'ebb-header';
    header.textContent = 'Sizin İçin Seçtiklerimiz';
    const track = document.createElement('div');
    track.className = 'ebb-track';

    products.forEach(p => track.appendChild(createProductCard(p)));
    carousel.appendChild(header);
    carousel.appendChild(track);
    setupNavigation(carousel);

    banner.appendChild(carousel);
    return banner;
  }

 function buildCSS(styleId = "ebb-style") {
    const css = `

  #ebb-min{
    font-family: Quicksand-Medium;
    max-width: 1600px;
    margin: 24px auto;
    padding: 0 24px;
    color:#111827;
    font-size: 12px;
    line-height: 1.2;
    }

    .ebb-banner{
    --banner-pad: 105px;
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 var(--banner-pad);   
    position: relative;
    }

    .ebb-header{ 
    display:flex; align-items:center; gap:8px;
    padding: 0 0 12px;      
    margin: 0 0 6px;
    font-size: 24px; line-height: 1.4; font-weight: 600; color: #1f2937;
    }

    .ebb-carousel{
    position:relative; width:100%; 
    overflow:visible;
    --per-view:5;            
    --gap:20px;                
    --img-h: 230px;
    --surface:#fff;
    --border:#f2f5f7;
    --price:#111827;
    --price-discount:#16a34a;  
    }

    .ebb-nav-btn{
    position:absolute; top:50%; transform:translateY(-50%);
    width:40px; height:40px; border-radius:50%;
    background:#fff; border:1px solid #e5e7eb; color:#374151;
    display:flex; align-items:center; justify-content:center;
    box-shadow: 0 2px 6px #e1e6ea;
    cursor:pointer;
    }
    
    .ebb-prev-btn{ left: -60px; }   
    .ebb-next-btn{ right: -60px; }

    .ebb-track{
    display:grid;
    grid-auto-flow:column;
    padding: 8px 0 24px;
    gap:var(--gap);
    grid-auto-columns:calc((100% - (var(--gap) * (var(--per-view) - 1))) / var(--per-view));
    overflow-x:auto;
  
    -webkit-overflow-scrolling:touch;
    }

    .ebb-track::-webkit-scrollbar {
    display: none;            
    }

    .ebb-card{
    position:relative;
    scroll-snap-align:start;
    background:var(--surface);
    border:1px solid var(--border);
    border-radius:8px;
    padding: 0px 20px 6px; 
    display:flex; flex-direction:column;
    min-height: 380px;
    max-width: 1140px;
    height: 100%;
    }

    .ebb-card:hover{ 
    border-color: #c1ccd4;
    }
    
    .ebb-card:focus-within {
    outline: none;
    }

    .like-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 25px;
    height: 25px;
    border-radius: 10px;
    cursor: pointer;
    border: none;
    background-color: transparent;
    position: relative;
    }

    like-button{
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 2;            
    pointer-events: none;   
    }
    
    like-button .like-button{
    pointer-events: auto;}

    .like-button::after {
    content: "like"; width: fit-content; height: fit-content; position: absolute;  color: white;
    opacity: 0; visibility: hidden;
    }

    .like-button:focus {
      outline: none;      
      box-shadow: none;   
      background: transparent; 
    }

    .icon {
    width: 30px; height: 30px; transition: 0.2s linear;
    }

    .icon path {
    fill: #a2b1bc; transition: 0.2s linear;}

    .like-button:hover > .icon path {
    fill: #ff8a00;
    }

    .like-button.liked .icon path {
      fill: #ff8a00; 
    }

    .ebb-add-btn{
    position:absolute;
    right:10px;
    bottom:10px;

    width:35px;              
    height:35px;
    border-radius:50%;

    background:#fff;
    color:var(--accent, #0091d5);    
    display:grid;
    place-items:center;
    cursor:pointer;
    transition: background .15s ease, color .15s ease, border-color .15s ease;
    z-index: 10;
    box-shadow: 0 2px 4px #e1e6ea; 
    }

   
    .ebb-add-btn::before,
    .ebb-add-btn::after{
    content:"";
    position:absolute;
    width:13px;
    height:2px;
    background: currentColor;
    border-radius: 1px;
    }
    .ebb-add-btn::after{ transform: rotate(90deg); }

    .ebb-add-btn:hover{
    background: var(--accent, #0ea5e9);
    color:#fff;                         
    border-color: var(--accent, #0ea5e9);
    }

    product-name brand { display:inline; font-weight:700; }
 
    product-name{
    margin-block-start: 0.83em;
    margin-block-end: 0.83em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    margin-bottom:10px;
    display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;}

    .ebb-card > img{
    width:100%; height:var(--img-h); object-fit:contain;
    background:var(--surface); border-radius:12px; margin-bottom:1px;
    }

    .ebb-price-wrap{
    margin-top: auto;        
    display: flex;
    flex-direction: column;
    align-items: flex-start;  
    gap: 0px;
    padding: 6px 0 10px;      
    }
    .ebb-promo-row{
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    }

    price{
    display: block;
    font-weight: 600;
    font-size: 18px;
    color: #2b2f33;
    }
    price .cents {
    font-size: 0.8em;
    vertical-align: baseline; 
    }

    .has-discount price{ color: var(--price-discount); }

    original-price{
    color: #a2b1bc;
    text-decoration: none;     
    position: relative;
    font-weight: 600;
    font-size: 13px; 
    }

    discount{
    font-size: 12px; 
    font-weight: 600; 
    padding: 4px 8px; 
    border-radius: 999px;
    display: inline-flex;
    color: #fff;
    background: #16a34a;
    }

  `;

  let el = document.getElementById(styleId);
  if (!el) {
    el = document.createElement("style");
    el.id = styleId;
    document.head.appendChild(el);
  }
  el.textContent = css;
  return el;
    }

  let root = document.getElementById(ROOT_ID);
  if (!root) {
    root = document.createElement('div');
    root.id = ROOT_ID;
    (document.querySelector("main") || document.body).prepend(root);
  }

  const items = await cacheGet({ fetcher: fetchData }) || [];

  root.innerHTML = "";
  if (!items.length) {
    root.textContent = "Ürün bulunamadı.";
  } else {
    const carouselEl = buildHTML(items, { perView: 5, gap: 16, id: 'ebb-carousel' });
    root.appendChild(carouselEl);
  }
  buildCSS();
})();

