import { useQuery } from '@tanstack/react-query';

import { fetchRequests } from '@/api/queries';
import type { RequestStatus } from '@/domain/types';

export function useRequests(status?: RequestStatus) {
  return useQuery({ queryKey: ['requests', status ?? 'all'], queryFn: () => fetchRequests(status) });
}
