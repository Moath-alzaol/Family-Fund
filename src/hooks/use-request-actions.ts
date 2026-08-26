import { useMutation, useQueryClient } from '@tanstack/react-query';

import { approveRequest, createRequest, rejectRequest } from '@/api/mutations';
import type { fetchRequestById } from '@/api/queries';

type RequestRow = Awaited<ReturnType<typeof fetchRequestById>>;

function useInvalidateMoneyQueries() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['requests'] });
    queryClient.invalidateQueries({ queryKey: ['personal-balances'] });
    queryClient.invalidateQueries({ queryKey: ['fund-balance'] });
    queryClient.invalidateQueries({ queryKey: ['commitments'] });
    queryClient.invalidateQueries({ queryKey: ['ledger'] });
  };
}

export function useCreateRequest() {
  const invalidate = useInvalidateMoneyQueries();
  return useMutation({
    mutationFn: createRequest,
    onSuccess: invalidate,
  });
}

export function useApproveRequest() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateMoneyQueries();
  return useMutation({
    mutationFn: approveRequest,
    onMutate: async (requestId: string) => {
      await queryClient.cancelQueries({ queryKey: ['request', requestId] });
      const previous = queryClient.getQueryData<RequestRow>(['request', requestId]);
      if (previous) {
        queryClient.setQueryData<RequestRow>(['request', requestId], { ...previous, status: 'approved' });
      }
      return { previous, requestId };
    },
    onError: (_err, _requestId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['request', context.requestId], context.previous);
      }
    },
    onSuccess: invalidate,
  });
}

export function useRejectRequest() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateMoneyQueries();
  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason: string }) => rejectRequest(requestId, reason),
    onMutate: async ({ requestId, reason }) => {
      await queryClient.cancelQueries({ queryKey: ['request', requestId] });
      const previous = queryClient.getQueryData<RequestRow>(['request', requestId]);
      if (previous) {
        queryClient.setQueryData<RequestRow>(['request', requestId], {
          ...previous,
          status: 'rejected',
          rejection_reason: reason,
        });
      }
      return { previous, requestId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['request', context.requestId], context.previous);
      }
    },
    onSuccess: invalidate,
  });
}
