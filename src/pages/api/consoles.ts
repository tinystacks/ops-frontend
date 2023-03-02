import { Console, OpenAPIConfig, OpsApiClient, TinyStacksError } from '@tinystacks/ops-model'
import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchApiKey } from 'ops-frontend/utils/fetch-api-key';
import { isTinyStacksError } from 'ops-frontend/utils/is-tinystacks-error';

function handleResponse (
  clientResponse: Console[] | Console | TinyStacksError,
  res: NextApiResponse<Console[] | Console | TinyStacksError>
  ) {
    if (isTinyStacksError(clientResponse)) {
      throw clientResponse;
    }
    res.status(200).send(clientResponse)
  }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Console[] | Console | TinyStacksError>
) {
  try {
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
    const client = new OpsApiClient(clientOptions);
    const consoleClient = client.console;
    const method = req.method;

    switch (method) {
      case 'POST':
        const createResponse = await consoleClient.createConsole(req.body);
        handleResponse(createResponse, res);
        break;
      case 'GET':
        const retrieveResponse = await consoleClient.getConsoles();
        handleResponse(retrieveResponse, res);
        break;
      default:
        res.setHeader('Allow', ['POST', 'GET']);
        res.status(405).end(`Method ${method} Not Allowed`);
        break;
    }
  } catch (e) {
    const error = e as any;
    // eslint-disable-next-line no-console
    console.error(e);
    res.status(error.status || 500).send(error);
  }
}