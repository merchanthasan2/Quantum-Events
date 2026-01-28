import { City } from './types';

interface Coordinates {
    latitude: number;
    longitude: number;
}

const cityCoordinates: Record<string, Coordinates> = {
    'mumbai': { latitude: 19.0760, longitude: 72.8777 },
    'bangalore': { latitude: 12.9716, longitude: 77.5946 },
    'delhi': { latitude: 28.7041, longitude: 77.1025 },
    'pune': { latitude: 18.5204, longitude: 73.8567 },
    'chennai': { latitude: 13.0827, longitude: 80.2707 },
    'hyderabad': { latitude: 17.3850, longitude: 78.4867 },
    'kolkata': { latitude: 22.5726, longitude: 88.3639 },
    'gurugram': { latitude: 28.4595, longitude: 77.0266 },
    'noida': { latitude: 28.5355, longitude: 77.3910 },
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export async function detectUserCity(cities: City[]): Promise<City | null> {
    try {
        if (typeof window === 'undefined' || !navigator.geolocation) {
            return null;
        }

        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 5000,
                maximumAge: 300000,
            });
        });

        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        let closestCity: City | null = null;
        let minDistance = Infinity;

        cities.forEach(city => {
            const coords = cityCoordinates[city.slug];
            if (coords) {
                const distance = calculateDistance(
                    userLat,
                    userLon,
                    coords.latitude,
                    coords.longitude
                );

                if (distance < minDistance && distance < 100) {
                    minDistance = distance;
                    closestCity = city;
                }
            }
        });

        return closestCity;
    } catch (error) {
        return null;
    }
}
