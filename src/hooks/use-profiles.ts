import { useQuery } from '@tanstack/react-query';

import { fetchProfiles } from '@/api/queries';
import { useSession } from '@/hooks/use-session';

export function useProfiles() {
  return useQuery({ queryKey: ['profiles'], queryFn: fetchProfiles });
}

export function useMyProfile() {
  const { session } = useSession();
  const profiles = useProfiles();
  const myProfile = profiles.data?.find((p) => p.id === session?.user.id) ?? null;
  return { ...profiles, data: myProfile };
}
