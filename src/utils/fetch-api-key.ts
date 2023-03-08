import cached from 'cached';
import { APIGateway, APIGatewayClientConfig } from '@aws-sdk/client-api-gateway';
import { fromIni } from '@aws-sdk/credential-providers';

const fiveMinutes = 5 * 60;
const cache = cached('apiKey', {
  backend: {
    type: 'memory'
  },
  defaults: {
    expire: fiveMinutes
  }
});

async function getApiKey () {
  try {
    const config: APIGatewayClientConfig = {};
    const regionOverride = process.env.AWS_REGION_OVERRIDE;
    if (regionOverride) {
      config.region = regionOverride;
    }
    const profile = process.env.AWS_PROFILE_OVERRIDE;
    if (profile) {
      config.credentials = fromIni({ profile });
    }
    const apigClient = new APIGateway(config);
    const response = await apigClient.getApiKey({
      apiKey: process.env.API_KEY_ID,
      includeValue: true
    });
    return response.value;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to get api key!', error);
    throw { status: 401, message: 'Unauthorized' };
  }
}

export async function fetchApiKey () {
  const apiKeyId = process.env.API_KEY_ID;
  if (apiKeyId) {
    const apiKeySecret = await cache.getOrElse(apiKeyId, getApiKey);
    // eslint-disable-next-line no-console
    return apiKeySecret as string;
  }
}