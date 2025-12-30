'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-dark-700 hover:bg-dark-600 text-white border border-dark-600',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    ghost: 'bg-transparent hover:bg-dark-700 text-dark-300 hover:text-white',
  };

  const sizes = {
    sm: 'py-1.5 px-3 text-sm',
    md: 'py-2.5 px-4',
    lg: 'py-3 px-6 text-lg',
  };

  return (
    <button
      className={cn(
        'font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  className,
  label,
  error,
  id,
  ...props
}: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-dark-300">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2.5 text-white placeholder-dark-400',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  className,
  label,
  error,
  id,
  ...props
}: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-dark-300">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          'w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2.5 text-white placeholder-dark-400',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({
  className,
  label,
  error,
  options,
  id,
  ...props
}: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-dark-300">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          'w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2.5 text-white',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        'bg-dark-800/50 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-6',
        className
      )}
    >
      {children}
    </div>
  );
}

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
  children: React.ReactNode;
}

export function Badge({ variant = 'default', className, children }: BadgeProps) {
  const variants = {
    default: 'bg-dark-700 text-dark-300',
    success: 'bg-emerald-500/20 text-emerald-400',
    warning: 'bg-amber-500/20 text-amber-400',
    danger: 'bg-red-500/20 text-red-400',
    info: 'bg-blue-500/20 text-blue-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative bg-dark-800 border border-dark-700 rounded-2xl p-6 w-full max-w-lg shadow-xl">
          {title && (
            <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2 className={cn('w-6 h-6 animate-spin text-primary-500', className)} />
  );
}

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Spinner className="w-12 h-12 mx-auto mb-4" />
        <p className="text-dark-400">Chargement...</p>
      </div>
    </div>
  );
}
