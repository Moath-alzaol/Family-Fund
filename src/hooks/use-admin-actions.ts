import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { addMember, setAdminDepositRequiresApproval } from '@/api/mutations';
import { fetchAppSettings } from '@/api/queries';

export function useAppSettings() {
  return useQuery({ queryKey: ['app-settings'], queryFn: fetchAppSettings });
}

export function useAddMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ displayName, commitmentFils }: { displayName: string; commitmentFils: number }) =>
      addMember(displayName, commitmentFils),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profiles'] }),
  });
}

export function useSetAdminDepositRequiresApproval() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setAdminDepositRequiresApproval,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['app-settings'] }),
  });
}
