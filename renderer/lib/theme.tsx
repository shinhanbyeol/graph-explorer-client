import {
  Button,
  StyleFunctionProps,
  background,
  baseTheme,
  border,
  extendTheme,
} from '@chakra-ui/react';
import { color } from 'framer-motion';
import { scale } from 'sigma/utils';

const fonts = { mono: `'Menlo', monospace` };

const breakpoints = {
  sm: '40em',
  md: '52em',
  lg: '64em',
  xl: '80em',
};

const theme = extendTheme({
  colors: {
    black: '#16161D',
    background: '#FBFCF8',
    gray: '#A0A0A0',
    'black.alpha.80': '#16161D80',
    'black.alpha.60': '#16161D60',
    'black.alpha.40': '#16161D40',
    'black.alpha.20': '#16161D20',
    'black.alpha.10': '#16161D10',
  },
  fonts,
  breakpoints,
  components: {
    Button: {
      // 1. We can update the base styles
      baseStyle: {
        fontWeight: 'bold', // Normally, it is "semibold"
      },
      // 2. We can add a new button size or extend existing
      sizes: {
        xl: {
          h: '56px',
          fontSize: 'lg',
          px: '32px',
        },
      },
      // 3. We can add a new visual variant
      variants: {
        button: {
          bg: 'transparent',
          color: 'black',
          _hover: {
            bg: 'black',
            color: 'white',
          },
        },
        item: {
          bg: 'transparent',
          color: 'black',
          _hover: {
            bg: '#F3F4F6',
          },
        },
        ghost: {
          bg: 'transparent',
          color: 'black',
          _hover: {
            bg: '#F3F4F6',
          },
        },
        submit: {
          bg: 'black',
          color: 'white',
          border: 'none',
          _hover: {
            bg: 'black',
            boxShadow: 'inset 0px 2px 16px 0px rgb(209, 209, 237);',
            color: 'white',
          },
          _active: {
            bg: 'black',
            boxShadow: '0px 2px 16px 0px rgb(209, 209, 237);',
            color: 'white',
          },
        },
        outline: {
          bg: 'transparent',
          color: 'black',
          border: '1px solid black',
          _hover: {
            bg: 'black',
            color: 'white',
          },
        },
      },
      // 6. We can overwrite defaultProps
      defaultProps: {
        variant: 'button', // default is solid
      },
    },
  },
});

export default theme;
