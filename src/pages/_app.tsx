import 'ops-frontend/i18n/i18n';
import 'ops-frontend/styles/globals.css'
import type { AppProps } from 'next/app'
import { Provider } from 'react-redux';
import { store } from 'ops-frontend/store/store';
import { ChakraProvider, CSSReset } from '@chakra-ui/react';
import { AppLayout } from 'ops-frontend/components/layout/app-layout';
import { extendTheme } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

export const PURPLE_GRADIENT = 'linear(to-r, lightpurple.500, purple.500)';
export const PURPLE_GRADIENT_HOVER =
  'linear(to-r, lightpurple.600, purple.600)';

const theme = extendTheme({
  initialColorMode: 'light',
  useSystemColorMode: true,
  colors: {
    primary: '#111111',
    secondary: '#222222',
    secondaryHover: '#333333',
    purple: {
      500: '#8E42FF',
      600: '#8E52FF',
    },
    lightpurple: {
      500: '#B583FF',
      600: '#B593FF',
    },
    gray: {
      50: '#F7FAFC',
      100: '#EDF2F7',
      900: '#101828'
    },
    foregroundGray: '#444444',
    highlightGray: '#777777',
    primaryTextWhite: '#FFFFFF',
    secondaryTextGray: '#999999',
  },
  components: {
    Tag: {
      variants: {
        purple: {
          bg: 'purple.500',
          color: 'white',
        },
      },
    },
    Button: {
      variants: {
        purple: {
          bgGradient: PURPLE_GRADIENT,
          _hover: { bgGradient: PURPLE_GRADIENT_HOVER },
          color: 'white',
          rounded: '3xl',
          px: '25px',
        },
        secondary: {
          bg: 'secondary',
          _hover: { bg: 'secondaryHover' },
          color: 'white',
          rounded: '3xl',
        },
      },
    },
    Heading: {
      variants: {
        purple: {
          fontWeight: 'semibold',
          bgGradient: PURPLE_GRADIENT,
          bgClip: 'text',
          lineHeight: '1.2',
        },
      },
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  const content = (
    <Provider store={store}>
      <ChakraProvider theme={theme}>
        <CSSReset />
          <AppLayout>
            <Component {...pageProps} />
          </AppLayout>
      </ChakraProvider>
    </Provider>
  );
  const [render, setRender] = useState(false);
  useEffect(() => setRender(true), []);
  return render ? content : null;
};
