import en from 'i18n/en/en';

export type LocaleMessageType = { [key: string]: (string | (() => any) | LocaleMessageType)};

const messages: { [lang: string]: LocaleMessageType } = {
  en: en,
};

export default messages;
