import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        'custom-gradient': 'linear-gradient(to right, #92c7eb, #8380eb, #6b5be5)',
        'background-gradient': 'linear-gradient(to bottom, #000000 , #342B6F)',
        'text-gradient': 'linear-gradient(to right, #2B0FE8 , #A20BFF)',
        'button-gradient': 'linear-gradient(to right, #4A30FF, #A10DFF)',
      },
      colors:{
        'selection-primary': '#C3BCF5',
        'text-primary': '#262626',
        'primary': '#6c5be7',
        'primary-dark': '#4C40A7',
        'secondary': '#8380eb',
        'secondary-light': '#DBD7FF',
        'secondary-lighter': '#efedff',
        'secondary-lighter-light': '#ECEAFF',
        'tertiary': '#ffa8a7',
        'custom-gray': '#e6e8ec',
        'custom-gray-light': '#f5f6fa',
        'google': '#4285f4',
        'google-hover': '#3880F4',
        'side-blue': '#EFF4FF',
        'cus-yellow': '#E4FF3C',
        'cus-green': '#05FF00',
        'cus-orange': '#FF5C00',
        'cus-purple': '#6C5BE7',
        'off-white': '#F5F8FA',
        'disabled' : '#fafafa'
      }
    },
  },
  variants: {
    extend: {
      backgroundColor: ['group-hover'],
      backgroundImage: ['group-hover'], // This is important for custom gradients
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
export default config;
