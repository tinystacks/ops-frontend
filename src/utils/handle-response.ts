import { TinyStacksError } from '@tinystacks/ops-core';
import type { NextApiResponse } from 'next'


export function handleResponse<T> (
  clientResponse: T,
  res: NextApiResponse<T>
  ) {
    if (TinyStacksError.isTinyStacksError(clientResponse)) {
      throw clientResponse;
    }
    res.status(200).send(clientResponse)
  }