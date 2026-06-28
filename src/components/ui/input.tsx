import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				'h-8 w-full min-w-0 rounded-lg border border-black bg-transparent px-2.5 py-1 text-base text-black transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-black placeholder:text-gray-500 focus-visible:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-black/50 disabled:opacity-50 aria-invalid:border-red-500 aria-invalid:ring-3 aria-invalid:ring-red-500/20 md:text-sm dark:bg-black/30 dark:disabled:bg-black/80 dark:aria-invalid:border-red-500/50 dark:aria-invalid:ring-red-500/40',
				className
			)}
			{...props}
		/>
	);
}

export { Input };
