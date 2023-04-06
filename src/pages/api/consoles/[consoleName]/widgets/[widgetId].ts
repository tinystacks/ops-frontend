
import { TinyStacksError, Widget } from '@tinystacks/ops-model'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Json } from 'ops-frontend/types';
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
    const widgetId = req.query.widgetId as string;
    const overrides = req.query.overrides as any;
    const parameters = req.query.parameters as Json;
    const dashboardId = req.query.dashboardId as string;
    const method = req.method;

    switch (method) {
      case 'GET':
        const createResponse = await widgetClient.getWidget(consoleName, widgetId, overrides, parameters, dashboardId);
        handleResponse<Widget | TinyStacksError>(createResponse, res);
        break;
      case 'PUT':
        const updateResponse = await widgetClient.updateWidget(consoleName, widgetId, req.body);
        handleResponse<Widget | TinyStacksError>(updateResponse, res);
        break;
      case 'DELETE':
        const deleteResponse = await widgetClient.deleteWidget(consoleName, widgetId);
        handleResponse<Widget | TinyStacksError>(deleteResponse, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
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