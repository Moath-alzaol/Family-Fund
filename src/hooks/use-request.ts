import { useQuery } from '@tanstack/react-query';

import { fetchRequestById } from '@/api/queries';
import { localizeProfile } from '@/domain/profile';

export function useRequest(id: string) {
  return useQuery({
    queryKey: ['request', id],
    queryFn: () => fetchRequestById(id),
    select: (request) => ({
      ...request,
      requester: request.requester ? localizeProfile(request.requester) : null,
      decider: request.decider ? localizeProfile(request.decider) : null,
    }),
  });
}
