const CATEGORY_META = {
  food:    { color: '#f97316', bg: '#fff4ed', emoji: '🍽️', label: 'Food & Drink' },
  bank:    { color: '#3b82f6', bg: '#eff6ff', emoji: '🏦', label: 'Banking' },
  health:  { color: '#22c55e', bg: '#f0fdf4', emoji: '🏥', label: 'Health' },
  market:  { color: '#a855f7', bg: '#faf5ff', emoji: '🛒', label: 'Market' },
  school:  { color: '#eab308', bg: '#fefce8', emoji: '🎓', label: 'Education' },
  fuel:    { color: '#ef4444', bg: '#fef2f2', emoji: '⛽', label: 'Fuel Station' },
  transit: { color: '#06b6d4', bg: '#ecfeff', emoji: '🚌', label: 'Transit' },
  other:   { color: '#888',    bg: '#f5f5f5', emoji: '📍', label: 'Other' },
};

const POIS = [
  { name: 'LUTH Hospital',              category: 'health',  lat: 6.5175, lng: 3.3480, address: 'Idi-Araba, Yaba',          phone: '01-774-0050',  hours: 'Open 24hrs' },
  { name: 'Yaba College of Technology', category: 'school',  lat: 6.5195, lng: 3.3710, address: 'Herbert Macaulay Way',     phone: '',             hours: 'Mon–Fri 8am–5pm' },
  { name: 'University of Lagos',        category: 'school',  lat: 6.5158, lng: 3.3980, address: 'Akoka, Yaba',             phone: '',             hours: 'Mon–Fri 8am–5pm' },
  { name: 'Tejuosho Market',            category: 'market',  lat: 6.5063, lng: 3.3631, address: 'Ojuelegba Road, Yaba',    phone: '',             hours: 'Daily 7am–7pm' },
  { name: 'Makoko Fish Market',         category: 'market',  lat: 6.4966, lng: 3.3896, address: 'Makoko, Yaba',            phone: '',             hours: 'Daily 6am–6pm' },
  { name: 'Zenith Bank Yaba',           category: 'bank',    lat: 6.5121, lng: 3.3700, address: 'Herbert Macaulay Way',    phone: '01-278-7000',  hours: 'Mon–Fri 8am–4pm' },
  { name: 'GTBank Yaba',                category: 'bank',    lat: 6.5135, lng: 3.3650, address: 'Corporation Drive, Yaba', phone: '01-448-0000',  hours: 'Mon–Fri 8am–4pm' },
  { name: 'Access Bank Yaba',           category: 'bank',    lat: 6.5110, lng: 3.3720, address: 'Yaba Bus Stop',           phone: '',             hours: 'Mon–Fri 8am–4pm' },
  { name: 'Chicken Republic Yaba',      category: 'food',    lat: 6.5118, lng: 3.3688, address: 'Herbert Macaulay Way',    phone: '',             hours: 'Daily 9am–10pm' },
  { name: 'Mr Biggs Yaba',              category: 'food',    lat: 6.5105, lng: 3.3670, address: 'Yaba, Lagos',             phone: '',             hours: 'Daily 9am–9pm' },
  { name: 'Tantalizers Yaba',           category: 'food',    lat: 6.5130, lng: 3.3660, address: 'Yaba, Lagos',             phone: '',             hours: 'Daily 9am–9pm' },
  { name: 'Randle General Hospital',    category: 'health',  lat: 6.5020, lng: 3.3580, address: 'Randle Ave, Surulere',    phone: '01-774-0100',  hours: 'Open 24hrs' },
  { name: 'Total Filling Station Yaba', category: 'fuel',    lat: 6.5140, lng: 3.3630, address: 'Western Ave, Yaba',       phone: '',             hours: 'Daily 6am–10pm' },
  { name: 'Yaba Bus Stop',              category: 'transit', lat: 6.5112, lng: 3.3679, address: 'Herbert Macaulay Way',    phone: '',             hours: 'Daily' },
  { name: 'Sabo Market',                category: 'market',  lat: 6.5088, lng: 3.3760, address: 'Sabo, Yaba',              phone: '',             hours: 'Daily 7am–7pm' },
];

let leafletMap;
let markers = [];
let activeCategory = 'all';
let activePoi = null;

function getMeta(cat) {
  return CATEGORY_META[cat] || CATEGORY_META.other;
}

function initMap() {
  leafletMap = L.map('map', { zoomControl: false, attributionControl: false })
    .setView([6.5120, 3.3700], 15);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
  }).addTo(leafletMap);

  renderMarkers(POIS);
  renderList(POIS);

  leafletMap.on('click', () => closeCard());

  document.getElementById('btn-zoom-in').addEventListener('click', () => leafletMap.zoomIn());
  document.getElementById('btn-zoom-out').addEventListener('click', () => leafletMap.zoomOut());
}

function renderMarkers(pois) {
  markers.forEach(m => leafletMap.removeLayer(m));
  markers = [];

  pois.forEach((poi) => {
    const meta = getMeta(poi.category);
    const icon = L.divIcon({
      className: '',
      html: `<div class="lagis-marker" style="width:14px;height:14px;background:${meta.color};"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });

    const marker = L.marker([poi.lat, poi.lng], { icon })
      .addTo(leafletMap)
      .on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        openCard(poi);
        leafletMap.setView([poi.lat, poi.lng], Math.max(leafletMap.getZoom(), 16));
      });

    markers.push(marker);
  });
}

function renderList(pois) {
  const list = document.getElementById('poi-list');
  const count = document.getElementById('list-count');
  count.textContent = `${pois.length} place${pois.length !== 1 ? 's' : ''}`;
  list.innerHTML = '';

  if (pois.length === 0) {
    list.innerHTML = `<div style="padding:32px 16px;text-align:center;color:#aaa;font-size:13px;">No results found</div>`;
    return;
  }

  pois.forEach((poi) => {
    const meta = getMeta(poi.category);
    const item = document.createElement('div');
    item.className = 'poi-item';
    item.innerHTML = `
      <div class="poi-dot" style="background:${meta.bg}">${meta.emoji}</div>
      <div class="poi-info">
        <div class="poi-name">${poi.name}</div>
        <div class="poi-meta">${meta.label} · ${poi.address}</div>
      </div>
      <div class="poi-arrow">›</div>
    `;
    item.addEventListener('click', () => {
      document.querySelectorAll('.poi-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      leafletMap.setView([poi.lat, poi.lng], Math.max(leafletMap.getZoom(), 16));
      openCard(poi);
    });
    list.appendChild(item);
  });
}

function openCard(poi) {
  const meta = getMeta(poi.category);

  const badge = document.getElementById('card-category-badge');
  badge.textContent = meta.label;
  badge.style.background = meta.bg;
  badge.style.color = meta.color;

  document.getElementById('card-name').textContent = poi.name;
  document.getElementById('card-address').textContent = poi.address || '';

  const phoneRow = document.getElementById('card-phone');
  const phoneText = document.getElementById('card-phone-text');
  if (poi.phone) {
    phoneText.textContent = poi.phone;
    phoneRow.classList.remove('hidden');
  } else {
    phoneRow.classList.add('hidden');
  }

  const hoursRow = document.getElementById('card-hours-row');
  const hoursText = document.getElementById('card-hours-text');
  if (poi.hours) {
    hoursText.textContent = poi.hours;
    hoursRow.classList.remove('hidden');
  } else {
    hoursRow.classList.add('hidden');
  }

  activePoi = poi;
  document.getElementById('info-card').classList.remove('hidden');
}

function closeCard() {
  document.getElementById('info-card').classList.add('hidden');
  document.querySelectorAll('.poi-item').forEach(i => i.classList.remove('active'));
  activePoi = null;
}

document.getElementById('close-card').addEventListener('click', closeCard);

const searchInput = document.getElementById('search');
const clearBtn = document.getElementById('search-clear');

searchInput.addEventListener('input', function () {
  const q = this.value.toLowerCase();
  clearBtn.classList.toggle('hidden', q === '');
  filterAndRender();
});

clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  clearBtn.classList.add('hidden');
  filterAndRender();
});

document.querySelectorAll('.cat-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    activeCategory = this.dataset.cat;
    filterAndRender();
  });
});

function filterAndRender() {
  const q = searchInput.value.toLowerCase();
  const filtered = POIS.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    return matchCat && matchQ;
  });
  renderMarkers(filtered);
  renderList(filtered);
}

initMap();