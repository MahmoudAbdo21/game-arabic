import { ProfileSelectionScreen } from '@/features/profile-selection/components/ProfileSelectionScreen';
import '@/features/profile-selection/styles/profiles.css';
import { getActiveProfile, getAllProfiles } from '@/features/player/actions';
import { redirect } from 'next/navigation';
import { ForensicCleanup } from '@/features/player/components/ForensicCleanup';

export default async function ProfilesPage() {
  const activeProfile = await getActiveProfile();
  
  const profiles = await getAllProfiles();
  const mappedProfiles = profiles.map(p => ({
    id: p.id,
    name: p.name,
    avatarId: p.avatarId || undefined,
    avatarUrl: ''
  }));

  return (
    <>
      <ForensicCleanup />
      <ProfileSelectionScreen profiles={mappedProfiles} />
    </>
  );
}
