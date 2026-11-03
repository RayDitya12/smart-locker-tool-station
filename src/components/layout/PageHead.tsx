import type { ReactNode } from 'react'

interface PageHeadProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function PageHead({ title, subtitle, action }: PageHeadProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-ink-950 sm:text-2xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-[13px] text-ink-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
