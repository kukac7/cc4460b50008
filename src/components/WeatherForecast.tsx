import { useEffect, useState } from 'react';
import * as v from 'valibot';
import { cn, weatherMap } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogClose,
	Dialog,
} from '@/components/ui/dialog';
import { useCityStore, type ICity } from '@/store';
import { Form, Field as FormischField, useForm, type SubmitHandler } from '@formisch/react';
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldTitle,
} from './ui/field';
import { Input } from './ui/input';
import { Skeleton } from './ui/skeleton';
import ky from 'ky';
import { Check } from 'lucide-react';
import { format, setDefaultOptions } from 'date-fns';
import { hu } from 'date-fns/locale';
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from './ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

setDefaultOptions({ locale: hu });

const FormSchema = v.object({
	search: v.pipe(v.string(), v.minLength(3, 'Minimum 3 karakter')),
});

interface IGeocodingApiResult {
	results?: Array<ICity>;
	generationtime_ms: number;
}

interface IWeatherApiResponse {
	latitude: number;
	longitude: number;
	generationtime_ms: number;
	utc_offset_seconds: number;
	timezone: string;
	timezone_abbreviation: string;
	elevation: number;
	current_units: {
		time: string;
		interval: string;
		temperature_2m: string;
		weather_code: string;
	};
	current: {
		time: string;
		interval: number;
		temperature_2m: number;
		weather_code: number;
	};
	daily_units: {
		time: string;
		weather_code: string;
		temperature_2m_max: string;
		temperature_2m_min: string;
		precipitation_probability_min: string;
	};
	daily: {
		time: string[];
		weather_code: number[];
		temperature_2m_max: number[];
		temperature_2m_min: number[];
		precipitation_probability_min: number[];
	};
}

const chartConfig = {
	max: {
		label: 'Maximum',
		color: 'white',
	},
} satisfies ChartConfig;

export default function WeatherForecast() {
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const { city, setCity } = useCityStore();
	const [cities, setCities] = useState<Array<ICity>>([]);
	const [weather, setWeather] = useState<IWeatherApiResponse>();

	const form = useForm({
		schema: FormSchema,
		initialInput: {
			search: '',
		},
	});

	const handleSubmit: SubmitHandler<typeof FormSchema> = async (output) => {
		setLoading(true);

		try {
			const res = await ky(
				`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(output.search)}&count=50&language=hu&format=json`
			).json<IGeocodingApiResult>();

			if (res.results) {
				setCities(res.results);
			} else {
				setCities([]);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const getWeather = async (city: ICity) => {
		try {
			const res = await ky(
				`https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_min&current=temperature_2m,weather_code&timezone=${city.timezone}`
			).json<IWeatherApiResponse>();

			setWeather(res);
			setOpenModal(false);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		if (!city.id) {
			setOpenModal(true);
			return;
		}
		getWeather(city);
	}, [city]);

	return (
		<main
			className={cn(
				'container mt-12 mb-2 grid max-w-232 gap-y-15 md:mt-24 md:mb-20 md:grid-cols-[minmax(0,1fr)_minmax(0,578px)] md:gap-x-30'
			)}
		>
			<aside>
				<Dialog open={openModal} onOpenChange={setOpenModal}>
					<DialogTrigger asChild>
						{!city.id ? (
							<Skeleton className={cn('h-4')} />
						) : (
							<h1 className={cn('text-xs')}>{city.name}</h1>
						)}
					</DialogTrigger>
					<DialogContent
						onEscapeKeyDown={(e) => !city.id && e.preventDefault()}
						onPointerDownOutside={(e) => !city.id && e.preventDefault()}
						onInteractOutside={(e) => !city.id && e.preventDefault()}
						showCloseButton={!!city.id}
					>
						<DialogHeader>
							<DialogTitle>Város kereső</DialogTitle>
							<DialogDescription asChild>
								<Form
									of={form}
									id="form-city"
									onSubmit={handleSubmit}
									className={cn('my-4 grid gap-2')}
								>
									<FieldGroup>
										<FormischField of={form} path={['search']}>
											{(field) => (
												<Field data-invalid={field.errors !== null}>
													<Input
														{...field.props}
														id="form-city-search"
														value={field.input ?? ''}
														aria-invalid={field.errors !== null}
														placeholder="Város"
													/>
													{field.errors && (
														<FieldError
															errors={field.errors.map((message) => ({
																message,
															}))}
														/>
													)}
												</Field>
											)}
										</FormischField>
									</FieldGroup>
									<Button
										type="submit"
										className={cn('w-full')}
										disabled={loading}
									>
										Keresés
									</Button>
								</Form>
							</DialogDescription>
						</DialogHeader>
						<div className={cn('no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4')}>
							<FieldGroup>
								{cities.map((item) => (
									<FieldLabel
										key={item.id}
										className={cn(
											city.id === item.id && 'bg-gray-100',
											city.id === item.id
												? 'border-black'
												: 'border-gray-300',
											'hover:bg-gray-50'
										)}
										onClick={() => setCity(item)}
									>
										<Field orientation="horizontal">
											<FieldContent>
												<FieldTitle className={cn('font-bold')}>
													{item.admin1
														? `${item.name}, ${item.admin1}`
														: item.name}
												</FieldTitle>
												<FieldDescription>
													{item.country}
													<br />
													{`${item.latitude}, ${item.longitude}`}
												</FieldDescription>
											</FieldContent>
											{city.id === item.id && <Check />}
										</Field>
									</FieldLabel>
								))}
							</FieldGroup>
						</div>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline" disabled={!city.id}>
									Bezár
								</Button>
							</DialogClose>
						</DialogFooter>
					</DialogContent>
				</Dialog>
				{!city.id || !weather ? (
					<div className={cn('mt-2 grid gap-2')}>
						<Skeleton className={cn('h-4')} />
						<Skeleton className={cn('h-4')} />
					</div>
				) : (
					<>
						<h2
							className={cn('text-5xl')}
						>{`${weather.current.temperature_2m} ${weather.current_units.temperature_2m}`}</h2>
						<h3>{weatherMap[weather.current.weather_code]?.label}</h3>
					</>
				)}
			</aside>
			<section className={cn('grid gap-6')}>
				<h4 className={cn('text-xs')}>7 napos előrejelzés</h4>
				<div className={cn('grid items-start gap-7.5')}>
					{!city.id || !weather ? (
						<>
							{Array.from({ length: 7 }).map((_, index) => (
								<div
									key={index}
									className={cn(
										'grid grid-cols-3 items-center gap-2 md:gap-4 md:*:text-xl [&>p:last-child]:text-right [&>p:nth-child(2)]:text-center'
									)}
								>
									<Skeleton className={cn('h-4')} />
									<Skeleton className={cn('h-4')} />
									<Skeleton className={cn('h-4')} />
								</div>
							))}
						</>
					) : (
						<>
							{weather.daily.time.map((item, index) => (
								<div
									key={index}
									className={cn(
										'grid grid-cols-3 items-center gap-2 md:gap-4 md:*:text-xl [&>p:last-child]:text-right [&>p:nth-child(2)]:text-center'
									)}
								>
									<p className={cn('col-start-1 capitalize')}>
										{format(new Date(item), 'EEEE')}
									</p>
									<p
										className={cn(
											'col-start-2 flex items-center justify-center gap-2'
										)}
									>
										<img
											src={`https://cdn.meteocons.com/3.0.0-next.10/svg-static/monochrome/${weatherMap[weather.daily.weather_code[index]]?.icon}.svg`}
											alt=""
											width="42"
											height="42"
											className={cn('invert')}
										/>
										{`${weather.daily.precipitation_probability_min[index]}${weather.daily_units.precipitation_probability_min}`}
									</p>
									<p>{`${weather.daily.temperature_2m_min[index]}${weather.daily_units.temperature_2m_min} / ${weather.daily.temperature_2m_max[index]}${weather.daily_units.temperature_2m_max}`}</p>
								</div>
							))}
						</>
					)}
				</div>
				<div className={cn('md:mt-14')}>
					{!city.id || !weather ? (
						<Skeleton className={cn('h-36')} />
					) : (
						<ChartContainer config={chartConfig} className="aspect-auto h-62.5 w-full">
							<AreaChart
								data={weather.daily.time.map((item, index) => ({
									date: item,
									max: weather.daily.temperature_2m_max[index],
								}))}
							>
								<defs>
									<linearGradient id="fillMax" x1="0" y1="0" x2="0" y2="1">
										<stop
											offset="5%"
											stopColor="var(--color-max)"
											stopOpacity={0.8}
										/>
										<stop
											offset="95%"
											stopColor="var(--color-max)"
											stopOpacity={0.1}
										/>
									</linearGradient>
								</defs>
								<CartesianGrid vertical={false} />
								<XAxis
									dataKey="date"
									tickLine={false}
									axisLine={false}
									tickMargin={8}
									interval={0}
									minTickGap={32}
									tickFormatter={(value) => format(new Date(value), 'E')}
									tick={{ fill: 'white' }}
									padding={{ left: 20, right: 20 }}
								/>
								<YAxis width="auto" tick={{ fill: 'white' }} stroke="white" />
								<ChartTooltip
									cursor={false}
									content={
										<ChartTooltipContent
											hideIndicator
											labelFormatter={(value) =>
												format(new Date(value), 'EEEE')
											}
											indicator="dot"
										/>
									}
								/>
								<Area
									dataKey="max"
									type="natural"
									fill="url(#fillMax)"
									stroke="var(--color-max)"
									stackId="a"
								/>
							</AreaChart>
						</ChartContainer>
					)}
				</div>
			</section>
			<p className={cn('col-span-full text-xs')}>Bóta Dávid</p>
		</main>
	);
}
