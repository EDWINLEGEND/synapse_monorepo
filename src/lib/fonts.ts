import { Inter, Oswald } from 'next/font/google'

// Inter font for general use
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

// Oswald for headings
export const oswald = Oswald({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-oswald',
  weight: ['200', '300', '400', '500', '600', '700'],
})