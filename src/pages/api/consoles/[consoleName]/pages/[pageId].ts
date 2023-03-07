
import { TinyStacksError, Page } from '@tinystacks/ops-model'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getOpsApiClient } from 'ops-frontend/utils/get-ops-api-client';
import { handleResponse } from 'ops-frontend/utils/handle-response';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Page | TinyStacksError>
) {
  try {
    const client = await getOpsApiClient();
    const pageClient = client.page;
    const consoleName = req.query.consoleName as string;
    const pageId = req.query.pageId as string;
    const method = req.method;

    switch (method) {
      case 'PUT':
        const updateResponse = await pageClient.updatePage(consoleName, pageId, req.body);
        handleResponse<Page | TinyStacksError>(updateResponse, res);
        break;
      case 'DELETE':
        const deleteResponse = await pageClient.deletePage(consoleName, pageId);
        handleResponse<Page | TinyStacksError>(deleteResponse, res);
        break;
      default:
        res.setHeader('Allow', ['PUT', 'DELETE']);
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