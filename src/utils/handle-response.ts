import type { NextApiResponse } from 'next'
import { isTinyStacksError } from 'ops-frontend/utils/is-tinystacks-error';

export function handleResponse<T> (
  clientResponse: T,
  res: NextApiResponse<T>
  ) {
    if (isTinyStacksError(clientResponse)) {
      throw clientResponse;
    }
    res.status(200).send(clientResponse)
  }