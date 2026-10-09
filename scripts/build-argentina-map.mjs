import fs from 'fs';
import https from 'https';
import { geoMercator, geoPath, geoCentroid, geoBounds } from 'd3-geo';

const BASE = 'https://raw.githubusercontent.com/alvarezgarcia/provincias-argentinas-geojson/master/';
const FILES = [
  'BUENOSAIRES.json', 'CATAMARCA.json', 'CHACO.json', 'CHUBUT.json', 'CORDOBA.json',
  'CORRIENTES.json', 'ENTRERIOS.json', 'FORMOSA.json', 'JUJUY.json', 'LAPAMPA.json',
  'LARIOJA.json', 'MENDOZA.json', 'MISIONES.json', 'NEUQUEN.json', 'RIONEGRO.json',
  'SALTA.json', 'SANJUAN.json', 'SANLUIS.json', 'SANTACRUZ.json', 'SANTAFE.json',
  'SANTIAGODELESTERO.json', 'TIERRADELFUEGO.json', 'TUCUMAN.json',
];

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'serprove-vet' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        get(res.headers.location).then(resolve, reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error('status ' + res.statusCode + ' for ' + url));
        return;
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    }).on('error', reject);
  });
}

function ringCentroidLat(ring) {
  let lat = 0;
  for (const c of ring) lat += c[1];
  return lat / ring.length;
}

function filterGeom(geom) {
  const keep = (poly) => ringCentroidLat(poly.coordinates[0]) > -56;
  if (geom.type === 'Polygon') return keep(geom) ? geom : null;
  if (geom.type === 'MultiPolygon') {
    const polys = geom.coordinates.filter((poly) => keep({ type: 'Polygon', coordinates: poly }));
    if (!polys.length) return null;
    if (polys.length === 1) return { type: 'Polygon', coordinates: polys[0] };
    return { type: 'MultiPolygon', coordinates: polys };
  }
  return geom;
}

function getName(feature, file) {
  return feature.properties?.name || feature.properties?.nombre || feature.properties?.NAME || null;
}

const features = [];
for (const file of FILES) {
  const raw = await get(BASE + file);
  const data = JSON.parse(raw);
  for (const feature of data.features) {
    const geometry = filterGeom(feature.geometry);
    if (!geometry) continue;
    const name = getName(feature, file);
    // Skip unnamed features (e.g., island part of Tierra del Fuego)
    if (!name) continue;
    features.push({
      type: 'Feature',
      properties: { name },
      geometry,
    });
  }
}

const collection = { type: 'FeatureCollection', features };
const width = 420;
const height = 680;
const projection = geoMercator().fitExtent([[22, 18], [width - 22, height - 28]], collection);
const path = geoPath(projection).digits(1);

const out = {
  width,
  height,
  provinces: features.map((f) => {
    const [x, y] = projection(geoCentroid(f));
    return {
      name: f.properties.name,
      d: path(f),
      label: [Math.round(x * 10) / 10, Math.round(y * 10) / 10],
    };
  }),
};

const dest = new URL('../src/data/argentina-map.json', import.meta.url);
fs.mkdirSync(new URL('../src/data/', import.meta.url), { recursive: true });
fs.writeFileSync(dest, JSON.stringify(out));
console.log('wrote', out.provinces.length, 'provinces,', JSON.stringify(out).length, 'bytes');
