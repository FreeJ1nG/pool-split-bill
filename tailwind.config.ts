import type { Config } from 'tailwindcss'
import tailwindAnimatePlugin from 'tailwindcss-animate'
import { withUt } from 'uploadthing/tw'

export default withUt({
  darkMode: ['class'],
  content: ['./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {},
    },
  },
  plugins: [tailwindAnimatePlugin],
}) satisfies Config
