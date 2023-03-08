import { Console, TinyStacksError } from '@tinystacks/ops-model'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getOpsApiClient } from 'ops-frontend/utils/get-ops-api-client';
import { handleResponse } from 'ops-frontend/utils/handle-response';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Console[] | Console | TinyStacksError>
) {
  try {
    const client = await getOpsApiClient();
    const consoleClient = client.console;
    const method = req.method;

    switch (method) {
      case 'POST':
        const createResponse = await consoleClient.createConsole(req.body);
        handleResponse<Console | TinyStacksError>(createResponse, res);
        break;
      case 'GET':
        const retrieveResponse = await consoleClient.getConsoles();
        handleResponse<Console[] | TinyStacksError>(retrieveResponse, res);
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