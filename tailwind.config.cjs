/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        'brand-purple': {
          '50': '#fbf2ff',
          '100': '#f6e2ff',
          '200': '#eecaff',
          '300': '#e1a1ff',
          '400': '#d166ff',
          '500': '#c02cff',
          '600': '#b005ff',
          '700': '#9c00f9',
          '800': '#8400ca',
          '900': '#660198',
        },
        'brand-yellow': {
          '50': '#fefbe8',
          '100': '#fdf6c4',
          '200': '#fcec8c',
          '300': '#fad94a',
          '400': '#f7c51e',
          '500': '#e7ab0b',
          '600': '#c78307',
          '700': '#9f5e09',
          '800': '#834a10',
          '900': '#703c13',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
