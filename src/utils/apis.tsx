import { OpsApiClient } from '@tinystacks/ops-model';

// This file mostly exists to make testing easy
const client = new OpsApiClient({ BASE: 'http://localhost:8000' });
const apis = {
  async getWidget(consoleName: string, widgetId: string) {
    return await client.widget.getWidget(consoleName, widgetId);
  },
  async getConsoles() {
    return await client.console.getConsoles();
  }
};

export default apis;