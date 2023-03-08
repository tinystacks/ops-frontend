import { TinyStacksError } from '@tinystacks/ops-model';

const TinyStacksErrorName = 'TinyStacksError';

export function isTinyStacksError (error: unknown): boolean {
  const e = error as any;
  const hasTinyStacksErrorName: boolean = e?.name && e?.name === TinyStacksErrorName;
  const hasTinyStacksErrorType: boolean = e?.type && Object.values(TinyStacksError.type).includes(e?.type);
  const hasMessage: boolean = e?.message && typeof e?.message === 'string';
  const hasStatus: boolean = e?.status && typeof e?.status === 'number';
  const isTsError: boolean = (
    hasTinyStacksErrorName &&
    hasTinyStacksErrorType &&
    hasMessage &&
    hasStatus
  );
  return isTsError;
}