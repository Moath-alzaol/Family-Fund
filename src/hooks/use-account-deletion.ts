import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchMyAccountDeletionRequest, requestAccountDeletion } from '@/api/account-deletion';

const queryKey = ['account-deletion-request'] as const;

export function useAccountDeletionRequest() {
  return useQuery({ queryKey, queryFn: fetchMyAccountDeletionRequest });
}

export function useRequestAccountDeletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestAccountDeletion,
    onSuccess: (request) => queryClient.setQueryData(queryKey, request),
  });
}
