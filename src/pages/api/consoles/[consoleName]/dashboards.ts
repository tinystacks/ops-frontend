import { Dashboard, TinyStacksError } from '@tinystacks/ops-model'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getOpsApiClient } from '../../../../utils/get-ops-api-client.js';
import { handleResponse } from '../../../../utils/handle-response.js';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Dashboard[] | Dashboard | TinyStacksError>
) {
  try {
    const client = await getOpsApiClient();
    const dashboardClient = client.dashboard;
    const consoleName = req.query.consoleName as string;
    const method = req.method;

    switch (method) {
      case 'POST':
        const createResponse = await dashboardClient.createDashboard(consoleName, req.body);
        handleResponse<Dashboard | TinyStacksError>(createResponse, res);
        break;
      case 'GET':
        const getResponse = await dashboardClient.getDashboards(consoleName);
        handleResponse<Dashboard[] | TinyStacksError>(getResponse, res);
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