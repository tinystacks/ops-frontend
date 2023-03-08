import { TinyStacksError, Widget } from '@tinystacks/ops-model'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getOpsApiClient } from 'ops-frontend/utils/get-ops-api-client';
import { handleResponse } from 'ops-frontend/utils/handle-response';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Widget | TinyStacksError>
) {
  try {
    const client = await getOpsApiClient();
    const widgetClient = client.widget;
    const consoleName = req.query.consoleName as string;
    const method = req.method;

    switch (method) {
      case 'POST':
        const createResponse = await widgetClient.createWidget(consoleName, req.body);
        handleResponse<Widget | TinyStacksError>(createResponse, res);
        break;
      default:
        res.setHeader('Allow', ['POST']);
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