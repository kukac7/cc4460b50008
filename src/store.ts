import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ICity {
	id: number;
	name: string;
	latitude: number;
	longitude: number;
	elevation: number;
	feature_code: string;
	country_code: string;
	admin1_id: number;
	admin2_id: number;
	admin3_id: number;
	admin4_id: number;
	timezone: string;
	population: number;
	postcodes: string[];
	country_id: number;
	country: string;
	admin1: string;
	admin2: string;
	admin3: string;
	admin4: string;
}

interface ICityStore {
	city: ICity;
	setCity: (city: ICity) => void;
}

export const useCityStore = create(
	persist<ICityStore>(
		(set) => ({
			city: {
				id: 0,
				name: '',
				latitude: 0,
				longitude: 0,
				elevation: 0,
				feature_code: '',
				country_code: '',
				admin1_id: 0,
				admin2_id: 0,
				admin3_id: 0,
				admin4_id: 0,
				timezone: '',
				population: 0,
				postcodes: [],
				country_id: 0,
				country: '',
				admin1: '',
				admin2: '',
				admin3: '',
				admin4: '',
			},
			setCity: (city) => set(() => ({ city })),
		}),
		{
			name: 'city',
			storage: createJSONStorage(() => localStorage),
		}
	)
);
