import { OpenAPIConfig, OpsApiClient } from '@tinystacks/ops-model';
import { fetchApiKey } from 'ops-frontend/utils/fetch-api-key';


function trimTrailingSlash (url: string): string {
  if (url?.endsWith('/')) {
    const trimmedUrl = url.substring(0, url.length - 1);
    return trimTrailingSlash(trimmedUrl);
  }
  return url;
}

export async function getOpsApiClient () {
  const apiEndpoint = process.env.API_ENDPOINT;
  const baseEndpoint = trimTrailingSlash(apiEndpoint!);
    const apiSecret = await fetchApiKey();
    const clientOptions: Partial<OpenAPIConfig> = {
      BASE: baseEndpoint
    };
    if (apiSecret) {
      clientOptions['HEADERS'] = {
        Authorization: apiSecret
      };
    }
    return new OpsApiClient(clientOptions);
}