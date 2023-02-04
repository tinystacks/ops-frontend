import messages, { LocaleMessageType } from 'ops-frontend/i18n/messages';

describe('messages', () => {
  it('messages contains all languages', () => {
    expect(Object.keys(messages)).toStrictEqual(['en']);
  })

  it('all locales implement the same message objects', () => {
    const langMessageKeys: Set<string>[] = Object.keys(messages).map((lang: string, index: number) => {
      const messageKeys = new Set<string>();
      getLeafKeys(messages[lang], messageKeys, "");
      return messageKeys;
    });

    langMessageKeys.forEach(langKeys => {
      expect(Array.from(langMessageKeys[0])).toIncludeSameMembers(Array.from(langKeys));
    });
  });
});

function getLeafKeys(localeMessages: LocaleMessageType, messageKeys: Set<string>, prefix: string): void {
  const terminalValueTypes = new Set<string>(['string', 'function'])
  Object.entries(localeMessages).forEach(([key, val]) => {
    if (terminalValueTypes.has(typeof val)) {
      messageKeys.add(prefix + key);
    } else {
      getLeafKeys(val as LocaleMessageType, messageKeys, key + ".");
    }
  })
}