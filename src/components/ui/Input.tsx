'use client';

import type { InputHTMLAttributes, ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  rightSlot?: ReactNode;
}

export function Input({ label, hint, error, rightSlot, className = '', id, ...rest }: InputProps) {
  const inputId = id || rest.name;
  return (
    <label className="block space-y-1.5">
      {label && (
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
      )}
      <div className="relative">
        <input
          id={inputId}
          className={`w-full px-4 py-3 rounded-xl bg-slate-950/80 border outline-none transition text-sm ${
            error
              ? 'border-red-500/60 focus:ring-2 focus:ring-red-500/20'
              : 'border-slate-700/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
          } ${rightSlot ? 'pr-20' : ''} ${className}`}
          {...rest}
        />
        {rightSlot && (
          <div className="absolute inset-y-0 right-2 flex items-center">{rightSlot}</div>
        )}
      </div>
      {error ? (
        <span className="text-xs text-red-400">{error}</span>
      ) : hint ? (
        <span className="text-xs text-slate-500">{hint}</span>
      ) : null}
    </label>
  );
}
