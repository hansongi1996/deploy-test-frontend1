import { type ButtonHTMLAttributes } from 'react'

type Props = {
  size?: 'sm' | 'xs'
  variant?: 'default' | 'outline' | 'subtle'
  className?: string
} & ButtonHTMLAttributes<HTMLButtonElement>

export default function Button({ children, size='sm', variant='default', className='', ...rest }: Props) {
  const sizes = { sm: 'text-sm px-3 py-1.5', xs: 'text-xs px-2 py-1' } as const
  const variants = {
    default: 'bg-gray-800 text-white hover:bg-gray-700',
    outline: 'border hover:bg-gray-50',
    subtle: 'hover:bg-gray-100'
  } as const
  return (
    <button className={`${sizes[size]} ${variants[variant]} rounded ${className}`} {...rest}>
      {children}
    </button>
  )
}