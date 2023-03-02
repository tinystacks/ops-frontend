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
    const apiSecret = await fetchApiKey();
    const clientOptions: Partial<OpenAPIConfig> = {
      BASE: process.env.API_ENDPOINT
    };
    if (apiSecret) {
      clientOptions['HEADERS'] = {
        Authorization: apiSecret
      };
    }
    const client = new OpsApiClient(clientOptions);
    const consoleClient = client.console;
    const consoleName = req.query.consoleName as string;
    const method = req.method;

    switch (method) {
      case 'PUT':
        const updateResponse = await consoleClient.updateConsole(consoleName, req.body);
        handleResponse(updateResponse, res);
        break;
      case 'DELETE':
        const deleteResponse = await consoleClient.deleteConsole(consoleName);
        handleResponse(deleteResponse, res);
        break;
      default:
        res.setHeader('Allow', ['PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
        break;
    }
  } catch (e) {
    const error = e as any;
    res.status(error.status || 500).send(error);
  }
}