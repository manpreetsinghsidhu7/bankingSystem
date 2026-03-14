import React, { useState } from 'react';
import { cn } from './Button';
import { Eye, EyeOff } from 'lucide-react';

export const Input = React.forwardRef(({ className, label, error, icon: Icon, type, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-surface-500 dark:text-surface-400 mb-2 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-surface-400 dark:text-surface-500 group-focus-within:text-brand-500 transition-colors duration-200">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          ref={ref}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          className={cn(
            "block w-full rounded-xl border bg-surface-100/50 dark:bg-surface-800/50 border-surface-200 dark:border-surface-700/50 px-4 py-3 text-surface-900 dark:text-surface-100 placeholder-surface-400 dark:placeholder-surface-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm transition-all duration-200 outline-none",
            Icon && "pl-11",
            isPassword && "pr-11",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-300 focus:outline-none transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';
