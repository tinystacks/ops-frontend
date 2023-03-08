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
    const consoleName = req.query.consoleName as string;
    const method = req.method;

    switch (method) {
      case 'PUT':
        const updateResponse = await consoleClient.updateConsole(consoleName, req.body);
        handleResponse<Console | TinyStacksError>(updateResponse, res);
        break;
      case 'DELETE':
        const deleteResponse = await consoleClient.deleteConsole(consoleName);
        handleResponse<Console | TinyStacksError>(deleteResponse, res);
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