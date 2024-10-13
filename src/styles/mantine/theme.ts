import { createTheme, MantineColorsTuple } from '@mantine/core';

const brandPurple: MantineColorsTuple = [
  '#fde9ff',
  '#f2cfff',
  '#e09cff',
  '#ce64ff',
  '#bf37fe',
  '#b61afe',
  '#b109ff',
  '#9b00e4',
  '#8b00cc',
  '#7900b3',
];

const theme = createTheme({
  fontFamily: 'Poppins, sans-serif',
  primaryColor: 'brand-purple',
  colors: {
    'brand-purple': brandPurple,
    primaryColor: brandPurple,
  },
  focusClassName: 'focus:border-brand-purple-900 focus:ring-brand-purple-900',
});

export default theme;
