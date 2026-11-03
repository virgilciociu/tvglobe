// TV Globe - step 3: rotating 3D globe with hover, click-to-zoom on a country.

const COUNTRIES_URL =
  'https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson';

const COLOR_LAND = '#8ec1ff';
const COLOR_HOVER = '#ffd54f';
const COLOR_SELECTED = '#ffb300';
const COLOR_BORDER = '#1b4fa3';
const COLOR_OCEAN = '#0f3f94';

const DEFAULT_VIEW = { lat: 20, lng: 10, altitude: 2.5 };
const ZOOM_MS = 1200;

let hoveredCountry = null;
let selectedCountry = null;

const container = document.getElementById('globe');

// Every country is clickable: the panel shows its official time and, when there are
// no channels yet, a message that the website is still under construction.
const COLOR_DISABLED = '#6f87ad';
function isEnabled() {
  return true;
}

function countryName(d) {
  return displayCountry(countryCode(d)) || d.properties.NAME || d.properties.ADMIN;
}

function refreshPolygons() {
  globe
    .polygonCapColor(globe.polygonCapColor())
    .polygonAltitude(globe.polygonAltitude());
}

const globe = Globe()(container)
  .backgroundColor('rgba(0,0,0,0)')
  .showAtmosphere(true)
  .atmosphereColor('#bcd9ff')
  .atmosphereAltitude(0.15)
  .polygonCapColor(d => {
    if (!isEnabled(d)) return COLOR_DISABLED;
    if (d === selectedCountry) return COLOR_SELECTED;
    if (d === hoveredCountry) return COLOR_HOVER;
    return COLOR_LAND;
  })
  .polygonSideColor(() => 'rgba(0,0,0,0)')
  .polygonStrokeColor(() => COLOR_BORDER)
  .polygonAltitude(d => (isEnabled(d) && (d === hoveredCountry || d === selectedCountry) ? 0.03 : 0.006))
  .polygonLabel(d => `<b>${countryName(d)}</b>`)
  .onPolygonHover(country => {
    hoveredCountry = country;
    refreshPolygons();
    container.style.cursor = country && isEnabled(country) ? 'pointer' : 'grab';
  })
  .onPolygonClick(country => selectCountry(country))
  .onGlobeClick(() => clearSelection());

// Ocean color
globe.globeMaterial().color.set(COLOR_OCEAN);

// Slow automatic rotation
const controls = globe.controls();
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

globe.pointOfView(DEFAULT_VIEW);

// --- Zoom logic ---------------------------------------------------------

// Returns the biggest polygon ring of a country (handles MultiPolygon).
function mainRing(feature) {
  const geom = feature.geometry;
  const polygons = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  let best = polygons[0][0];
  for (const poly of polygons) {
    if (poly[0].length > best.length) best = poly[0];
  }
  return best;
}

// Center and size of a country, based on its biggest polygon.
function countryView(feature) {
  const ring = mainRing(feature);
  let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
  for (const [lng, lat] of ring) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
  const span = Math.max(maxLng - minLng, maxLat - minLat);
  const altitude = Math.min(1.8, Math.max(0.35, 0.3 + span * 0.02));
  return {
    lat: (minLat + maxLat) / 2,
    lng: (minLng + maxLng) / 2,
    altitude
  };
}

function selectCountry(country) {
  if (!country || !isEnabled(country)) return;
  selectedCountry = country;
  controls.autoRotate = false;
  refreshPolygons();
  openPanel(country);
  layout();
  globe.pointOfView(countryView(country), ZOOM_MS);
}

// Used by favorites and history: zoom to the country and play the channel.
function openChannel(code, id) {
  const feature = globe.polygonsData().find(d => countryCode(d) === code);
  if (!feature) return;
  if (selectedCountry !== feature) selectCountry(feature);
  playChannelById(id);
}

function clearSelection() {
  if (!selectedCountry) return;
  selectedCountry = null;
  closePanel();
  layout();
  refreshPolygons();
  globe.pointOfView(DEFAULT_VIEW, ZOOM_MS);
  setTimeout(() => {
    if (!selectedCountry) controls.autoRotate = true;
  }, ZOOM_MS);
}

window.addEventListener('keydown', e => {
  if (e.key === 'Escape') clearSelection();
});

// --- Layout & data ------------------------------------------------------

// The globe uses only the space not covered by the side panel,
// so the selected country is centered in the visible area.
function layout() {
  const isPhone = window.innerWidth <= 700;
  const panelOpen = panel.classList.contains('open');
  let width = window.innerWidth;
  let height = window.innerHeight;
  if (panelOpen) {
    if (isPhone) {
      height = Math.round(window.innerHeight * 0.55);
    } else {
      width = window.innerWidth - panel.offsetWidth;
    }
  }
  globe.width(width).height(height);
}
window.addEventListener('resize', layout);
layout();

fetch(COUNTRIES_URL)
  .then(res => res.json())
  .then(data => {
    globe.polygonsData(data.features);
  })
  .catch(err => console.error('Could not load country data:', err));
