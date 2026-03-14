import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      disabled={isLoading || props.disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:ring-offset-2 dark:focus:ring-offset-surface-900 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
        {
          'bg-brand-500 text-surface-900 hover:bg-brand-400 shadow-lg shadow-brand-500/25 hover:shadow-brand-400/40': variant === 'primary',
          'bg-surface-200/80 dark:bg-surface-800/80 text-surface-700 dark:text-surface-300 border border-surface-300 dark:border-surface-700 hover:bg-surface-300/80 dark:hover:bg-surface-700/80': variant === 'outline',
          'bg-transparent text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800': variant === 'ghost',
          'h-9 px-4 py-2 text-sm': size === 'sm',
          'h-11 px-6 py-2.5 text-base': size === 'md',
          'h-14 px-8 py-3 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : null}
      {children}
    </button>
  );
});
Button.displayName = 'Button';
