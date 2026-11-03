import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { cn } from '@/lib/cn'

const controlBase =
  'w-full rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink-900 ' +
  'placeholder:text-ink-300 outline-none transition ' +
  'focus:border-signal-500 focus:ring-4 focus:ring-signal-500/12 disabled:bg-canvas disabled:text-ink-400'

interface FieldProps {
  label: string
  hint?: string
  required?: boolean
  children: ReactNode
  className?: string
}

export function Field({ label, hint, required, children, className }: FieldProps) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 flex items-center gap-1 text-[12px] font-bold text-ink-700">
        {label}
        {required && <span className="text-bad-500">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1.5 block text-[11px] text-ink-400">{hint}</span>}
    </label>
  )
}

export function Input({
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlBase, className)} {...rest} />
}

export function Textarea({
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={cn(controlBase, 'resize-y', className)} {...rest} />
  )
}

export function Select({
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(controlBase, 'cursor-pointer appearance-none bg-no-repeat pr-9', className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235b6577' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
        backgroundPosition: 'right 0.75rem center',
      }}
      {...rest}
    >
      {children}
    </select>
  )
}
