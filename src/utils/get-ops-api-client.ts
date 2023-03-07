import { OpenAPIConfig, OpsApiClient } from '@tinystacks/ops-model';
import { fetchApiKey } from 'ops-frontend/utils/fetch-api-key';

export async function getOpsApiClient () {
  const baseEndpoint = process.env.API_ENDPOINT;
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