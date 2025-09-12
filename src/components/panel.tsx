import { type PropsWithChildren } from 'react'

type Props = PropsWithChildren<{ title: string; className?: string }>

export default function Panel({ title, children, className = '' }: Props) {
  return (
    <section className={`border rounded bg-white p-3 ${className}`}>
      <div className="panel-title mb-2">{title}</div>
      <div>{children}</div>
    </section>
  )
}