import { Console } from 'ops-frontend/components/console';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();
  return (
    <>
      <main>
        <div>
          <h1>{t('home.title')}</h1>
        </div>
        <Console
          pageContents={<div></div>}
        />
      </main>
    </>
  );
}
