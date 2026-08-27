import { useQuery } from '@tanstack/react-query';

import { fetchLedger } from '@/api/queries';
import { localizeProfile } from '@/domain/profile';

export function useLedger(accountType: 'personal' | 'fund', accountOwner?: string) {
  return useQuery({
    queryKey: ['ledger', accountType, accountOwner ?? 'fund'],
    queryFn: () => fetchLedger(accountType, accountOwner),
    select: (ledger) => ledger.map((entry) => ({
      ...entry,
      request: entry.request
        ? {
            ...entry.request,
            requester: entry.request.requester ? localizeProfile(entry.request.requester) : null,
          }
        : null,
    })),
  });
}
