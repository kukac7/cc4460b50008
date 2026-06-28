import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type WeatherIcon = {
	icon: string;
	label: string;
};

export const weatherMap: Record<number, WeatherIcon> = {
	0: { icon: 'clear-day', label: 'Derült' },

	1: { icon: 'partly-cloudy-day', label: 'Többnyire derült' },
	2: { icon: 'partly-cloudy-day', label: 'Részben felhős' },
	3: { icon: 'overcast', label: 'Borult' },

	45: { icon: 'fog', label: 'Köd' },
	48: { icon: 'fog', label: 'Zúzmarás köd' },

	51: { icon: 'drizzle', label: 'Szitálás' },
	53: { icon: 'drizzle', label: 'Szitálás' },
	55: { icon: 'drizzle', label: 'Erős szitálás' },

	61: { icon: 'rain', label: 'Eső' },
	63: { icon: 'rain', label: 'Eső' },
	65: { icon: 'rain', label: 'Heves eső' },

	66: { icon: 'rain', label: 'Ónos eső' },
	67: { icon: 'rain', label: 'Ónos eső' },

	71: { icon: 'snow', label: 'Havazás' },
	73: { icon: 'snow', label: 'Havazás' },
	75: { icon: 'snow', label: 'Erős havazás' },
	77: { icon: 'snow', label: 'Hódara' },

	80: { icon: 'rain', label: 'Zápor' },
	81: { icon: 'rain', label: 'Zápor' },
	82: { icon: 'rain', label: 'Heves zápor' },

	85: { icon: 'snow', label: 'Hózápor' },
	86: { icon: 'snow', label: 'Erős hózápor' },

	95: { icon: 'thunderstorms', label: 'Zivatar' },
	96: { icon: 'thunderstorms', label: 'Zivatar jégesővel' },
	99: { icon: 'thunderstorms', label: 'Zivatar erős jégesővel' },
};
