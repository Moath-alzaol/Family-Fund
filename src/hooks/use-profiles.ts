import { useQuery } from '@tanstack/react-query';

import { fetchProfiles } from '@/api/queries';
import { localizeProfile } from '@/domain/profile';
import { useSession } from '@/hooks/use-session';

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: fetchProfiles,
    select: (profiles) => profiles.map(localizeProfile),
  });
}

export function useMyProfile() {
  const { session } = useSession();
  const profiles = useProfiles();
  const myProfile = profiles.data?.find((p) => p.id === session?.user.id) ?? null;
  return { ...profiles, data: myProfile };
}
