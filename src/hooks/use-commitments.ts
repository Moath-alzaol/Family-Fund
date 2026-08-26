import { useQuery } from '@tanstack/react-query';

import { fetchCommitments } from '@/api/queries';

export function useCommitments(period: string) {
  return useQuery({ queryKey: ['commitments', period], queryFn: () => fetchCommitments(period) });
}
