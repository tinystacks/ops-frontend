import { Console } from 'ops-frontend/components/console';
import { useTranslation } from 'react-i18next';
import { Box } from '@chakra-ui/react';

export default function Home() {
  const { t } = useTranslation();
  return (
    <>
      <main>
          <Box>
            <h1>{t('home.title')}</h1>
          </Box>
          <Console
            pageContents={<Box></Box>}
          />
      </main>
    </>
  );
}
