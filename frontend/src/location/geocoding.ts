export type Place = { label: string; latitude: string; longitude: string; country?: string; countryCode?: string };
type GeocoderItem = { display_name: string; lat: string; lon: string; address?: { country?: string; country_code?: string } };
const baseUrl = import.meta.env.VITE_GEOCODING_BASE_URL ?? "https://nominatim.openstreetmap.org";
let lastRequest = 0;

async function request(path: string) {
  const wait = Math.max(0, 1000 - (Date.now() - lastRequest));
  if (wait) await new Promise((resolve) => window.setTimeout(resolve, wait));
  lastRequest = Date.now();
  const response = await fetch(`${baseUrl}${path}`, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("LOCATION_SEARCH_UNAVAILABLE");
  return response.json() as Promise<GeocoderItem[]>;
}

const toPlace = (item: GeocoderItem): Place => ({ label: item.display_name, latitude: item.lat, longitude: item.lon, country: item.address?.country, countryCode: item.address?.country_code?.toUpperCase() });

export async function searchPlaces(query: string, countryCode?: string): Promise<Place[]> {
  const params = new URLSearchParams({ q: query, format: "jsonv2", addressdetails: "1", limit: "5" });
  if (countryCode) params.set("countrycodes", countryCode.toLowerCase());
  return (await request(`/search?${params}`)).map(toPlace);
}

export async function reverseGeocode(latitude: string, longitude: string): Promise<Place | null> {
  const params = new URLSearchParams({ lat: latitude, lon: longitude, format: "jsonv2", addressdetails: "1" });
  const items = await request(`/reverse?${params}`);
  return items[0] ? toPlace(items[0]) : null;
}
