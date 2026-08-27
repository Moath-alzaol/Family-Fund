import { useQuery } from '@tanstack/react-query';

import { fetchRequests } from '@/api/queries';
import { localizeProfile } from '@/domain/profile';
import type { RequestStatus } from '@/domain/types';

export function useRequests(status?: RequestStatus) {
  return useQuery({
    queryKey: ['requests', status ?? 'all'],
    queryFn: () => fetchRequests(status),
    select: (requests) => requests.map((request) => ({
      ...request,
      requester: request.requester ? localizeProfile(request.requester) : null,
    })),
  });
}
