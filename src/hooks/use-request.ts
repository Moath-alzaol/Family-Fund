import { useQuery } from '@tanstack/react-query';

import { fetchRequestById } from '@/api/queries';

export function useRequest(id: string) {
  return useQuery({ queryKey: ['request', id], queryFn: () => fetchRequestById(id) });
}
