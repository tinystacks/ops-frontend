import { Page, TinyStacksError } from '@tinystacks/ops-model'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getOpsApiClient } from 'ops-frontend/utils/get-ops-api-client';
import { handleResponse } from 'ops-frontend/utils/handle-response';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Page[] | Page | TinyStacksError>
) {
  try {
    const client = await getOpsApiClient();
    const pageClient = client.page;
    const consoleName = req.query.consoleName as string;
    const method = req.method;

    switch (method) {
      case 'POST':
        const createResponse = await pageClient.createPage(consoleName, req.body);
        handleResponse<Page | TinyStacksError>(createResponse, res);
        break;
      case 'GET':
        const getResponse = await pageClient.getPages(consoleName);
        handleResponse<Page[] | TinyStacksError>(getResponse, res);
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