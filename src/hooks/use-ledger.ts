import { useQuery } from '@tanstack/react-query';

import { fetchLedger } from '@/api/queries';

export function useLedger(accountType: 'personal' | 'fund', accountOwner?: string) {
  return useQuery({
    queryKey: ['ledger', accountType, accountOwner ?? 'fund'],
    queryFn: () => fetchLedger(accountType, accountOwner),
  });
}
