const API_KEY = '5837d11c-741e-4d47-80c8-2411cb37903c';

const CATEGORY_COLORS = {
  food:    '#f97316',
  bank:    '#3b82f6',
  health:  '#22c55e',
  market:  '#a855f7',
  school:  '#eab308',
  fuel:    '#ef4444',
  transit: '#06b6d4',
  other:   '#888888',
};

const POIS = [
  { name: 'LUTH Hospital',              category: 'health',  lat: 6.5175, lng: 3.3480, address: 'Idi-Araba, Yaba',         phone: '01-774-0050',  hours: 'Open 24hrs' },
  { name: 'Yaba College of Technology', category: 'school',  lat: 6.5195, lng: 3.3710, address: 'Herbert Macaulay Way',    phone: '',             hours: 'Mon–Fri 8am–5pm' },
  { name: 'University of Lagos',        category: 'school',  lat: 6.5158, lng: 3.3980, address: 'Akoka, Yaba',            phone: '',             hours: 'Mon–Fri 8am–5pm' },
  { name: 'Tejuosho Market',            category: 'market',  lat: 6.5063, lng: 3.3631, address: 'Ojuelegba Road, Yaba',   phone: '',             hours: 'Daily 7am–7pm' },
  { name: 'Makoko Fish Market',         category: 'market',  lat: 6.4966, lng: 3.3896, address: 'Makoko, Yaba',           phone: '',             hours: 'Daily 6am–6pm' },
  { name: 'Zenith Bank Yaba',           category: 'bank',    lat: 6.5121, lng: 3.3700, address: 'Herbert Macaulay Way',   phone: '01-278-7000',  hours: 'Mon–Fri 8am–4pm' },
  { name: 'GTBank Yaba',                category: 'bank',    lat: 6.5135, lng: 3.3650, address: 'Corporation Drive, Yaba',phone: '01-448-0000',  hours: 'Mon–Fri 8am–4pm' },
  { name: 'Access Bank Yaba',           category: 'bank',    lat: 6.5110, lng: 3.3720, address: 'Yaba Bus Stop',          phone: '',             hours: 'Mon–Fri 8am–4pm' },
  { name: 'Chicken Republic Yaba',      category: 'food',    lat: 6.5118, lng: 3.3688, address: 'Herbert Macaulay Way',   phone: '',             hours: 'Daily 9am–10pm' },
  { name: 'Mr Biggs Yaba',              category: 'food',    lat: 6.5105, lng: 3.3670, address: 'Yaba, Lagos',            phone: '',             hours: 'Daily 9am–9pm' },
  { name: 'Tantalizers Yaba',           category: 'food',    lat: 6.5130, lng: 3.3660, address: 'Yaba, Lagos',            phone: '',             hours: 'Daily 9am–9pm' },
  { name: 'Randle General Hospital',    category: 'health',  lat: 6.5020, lng: 3.3580, address: 'Randle Ave, Surulere',   phone: '01-774-0100',  hours: 'Open 24hrs' },
  { name: 'Total Filling Station Yaba', category: 'fuel',    lat: 6.5140, lng: 3.3630, address: 'Western Ave, Yaba',      phone: '',             hours: 'Daily 6am–10pm' },
  { name: 'Yaba Bus Stop',              category: 'transit', lat: 6.5112, lng: 3.3679, address: 'Herbert Macaulay Way',   phone: '',             hours: 'Daily' },
  { name: 'Sabo Market',                category: 'market',  lat: 6.5088, lng: 3.3760, address: 'Sabo, Yaba',             phone: '',             hours: 'Daily 7am–7pm' },
];

let map;
let markers = [];
let activeCategory = 'all';

function initMap() {
  // OpenStreetMap base layer via Leaflet
  const leafletMap = L.map('map', { zoomControl: false }).setView([6.5120, 3.3700], 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(leafletMap);

  // Now plot POIs using Leaflet markers
  POIS.forEach((poi) => {
    const color = getCategoryColor(poi.category);
    const icon = L.divIcon({
      className: '',
      html: `<div style="
        width:14px;height:14px;border-radius:50%;
        background:${color};border:2px solid #fff;
        box-shadow:0 0 0 2px ${color};
      "></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });

    const marker = L.marker([poi.lat, poi.lng], { icon })
      .addTo(leafletMap)
      .on('click', () => openCard(poi));

    markers.push({ destroy: () => leafletMap.removeLayer(marker), _lmarker: marker, _poi: poi });
  });

  renderList(POIS);

  // Override renderMarkers to work with Leaflet
  window.renderMarkers = function(pois) {
    markers.forEach(m => m.destroy());
    markers = [];
    pois.forEach((poi) => {
      const color = getCategoryColor(poi.category);
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:14px;height:14px;border-radius:50%;
          background:${color};border:2px solid #fff;
          box-shadow:0 0 0 2px ${color};
        "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      const marker = L.marker([poi.lat, poi.lng], { icon })
        .addTo(leafletMap)
        .on('click', () => openCard(poi));
      markers.push({ destroy: () => leafletMap.removeLayer(marker), _lmarker: marker });
    });
  };

  // Override sidebar click to pan map
  window.panTo = function(lat, lng) {
    leafletMap.setView([lat, lng], 17);
  };
}

function getCategoryColor(cat) {
  return CATEGORY_COLORS[cat] || CATEGORY_COLORS.other;
}

function renderMarkers(pois) {
  markers.forEach(m => m.destroy());
  markers = [];

  pois.forEach((poi) => {
    const marker = new mapgl.Marker(map, {
      coordinates: [poi.lng, poi.lat],
      label: {
        text: poi.name,
        fontSize: 11,
        offset: [0, -18],
      },
    });

    marker.on('click', () => openCard(poi));
    markers.push(marker);
  });
}

function renderList(pois) {
  const list = document.getElementById('poi-list');
  list.innerHTML = '';

  if (pois.length === 0) {
    list.innerHTML = '<p style="font-size:13px;color:#aaa;text-align:center;margin-top:20px;">No results found</p>';
    return;
  }

  pois.forEach((poi) => {
    const item = document.createElement('div');
    item.className = 'poi-item';
    item.innerHTML = `
      <div class="poi-item-name">
        <span class="cat-dot" style="background:${getCategoryColor(poi.category)};"></span>
        ${poi.name}
      </div>
      <div class="poi-item-meta">${poi.category} · ${poi.address}</div>
    `;
    item.addEventListener('click', () => {
      if(window.panTo) panTo(poi.lat, poi.lng);
      openCard(poi);
    });
    list.appendChild(item);
  });
}

function openCard(poi) {
  document.getElementById('card-name').textContent     = poi.name;
  document.getElementById('card-category').textContent = poi.category.toUpperCase();
  document.getElementById('card-address').textContent  = poi.address ? '📍 ' + poi.address : '';
  document.getElementById('card-phone').textContent    = poi.phone   ? '📞 ' + poi.phone   : '';
  document.getElementById('card-hours').textContent    = poi.hours   ? '🕐 ' + poi.hours   : '';
  document.getElementById('info-card').classList.remove('hidden');
}

document.getElementById('close-card').addEventListener('click', () => {
  document.getElementById('info-card').classList.add('hidden');
});

document.getElementById('search').addEventListener('input', function () {
  const query = this.value.toLowerCase();
  const filtered = POIS.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchQuery = p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query);
    return matchCat && matchQuery;
  });
  renderMarkers(filtered);
  renderList(filtered);
});

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    activeCategory = this.dataset.cat;

    const query = document.getElementById('search').value.toLowerCase();
    const filtered = POIS.filter(p => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const matchQuery = p.name.toLowerCase().includes(query);
      return matchCat && matchQuery;
    });
    renderMarkers(filtered);
    renderList(filtered);
  });
});

initMap();