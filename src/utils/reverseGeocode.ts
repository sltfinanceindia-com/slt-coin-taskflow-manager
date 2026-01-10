/**
 * Reverse geocode coordinates to get a human-readable location
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 */
export async function reverseGeocode(lat: number, lon: number): Promise<{
  city: string;
  state: string;
  country: string;
  displayName: string;
}> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'Tenexa-App/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const data = await response.json();
    
    const address = data.address || {};
    const city = address.city || address.town || address.village || address.municipality || address.county || 'Unknown';
    const state = address.state || address.region || '';
    const country = address.country || '';
    
    let displayName = city;
    if (state && state !== city) {
      displayName += `, ${state}`;
    }
    
    return {
      city,
      state,
      country,
      displayName,
    };
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return {
      city: 'Unknown',
      state: '',
      country: '',
      displayName: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
    };
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

export default reverseGeocode;