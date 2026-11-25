import { ConfigService } from '@nestjs/config';
import { MachineTranslate, TRANSLATION_ERROR } from './machine-translate';

const make = (env: Record<string, string>) =>
  new MachineTranslate({
    get: (k: string) => env[k],
  } as unknown as ConfigService);

describe('MachineTranslate', () => {
  const realFetch = global.fetch;
  afterEach(() => {
    global.fetch = realFetch;
  });

  it('uses Azure when its key is set, Google otherwise, nothing without keys', () => {
    expect(
      make({ AZURE_TRANSLATOR_KEY: 'a', GOOGLE_TRANSLATE_API_KEY: 'g' })
        .provider,
    ).toBe('azure');
    expect(make({ GOOGLE_TRANSLATE_API_KEY: 'g' }).provider).toBe('google');
    expect(make({}).enabled).toBe(false);
  });

  it('asks Azure with the key and region in headers, and keeps the order', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          { translations: [{ text: 'Bonjour' }] },
          { translations: [{ text: 'Gorilles' }] },
        ]),
    });
    global.fetch = fetchMock;
    const translator = make({
      AZURE_TRANSLATOR_KEY: 'secret',
      AZURE_TRANSLATOR_REGION: 'switzerlandnorth',
    });

    await expect(
      translator.translate(['Hello', 'Gorillas'], 'fr'),
    ).resolves.toEqual(['Bonjour', 'Gorilles']);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/translate?api-version=3.0&from=en&to=fr');
    expect(url).not.toContain('secret');
    expect(init.headers).toMatchObject({
      'Ocp-Apim-Subscription-Key': 'secret',
      'Ocp-Apim-Subscription-Region': 'switzerlandnorth',
    });
    expect(JSON.parse(init.body as string)).toEqual([
      { Text: 'Hello' },
      { Text: 'Gorillas' },
    ]);
  });

  it('explains an Azure error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () =>
        Promise.resolve({ error: { code: 401000, message: 'Access denied' } }),
    });
    await expect(
      make({ AZURE_TRANSLATOR_KEY: 'bad' }).translate(['Hi'], 'sw'),
    ).rejects.toThrow(`${TRANSLATION_ERROR} (Azure 401): Access denied`);
  });
});
