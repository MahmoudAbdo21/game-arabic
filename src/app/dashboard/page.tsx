import { ChildDashboard } from '@/features/dashboard/components/ChildDashboard';
import '@/features/dashboard/styles/dashboard.css';
import { getActiveProfile } from '@/features/player/actions';
import { getDashboardMetrics } from '@/features/dashboard/actions';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const profile = await getActiveProfile();
  if (!profile) {
    redirect('/profiles');
  }

  const metrics = await getDashboardMetrics();

  const mappedProfile = {
    ...profile,
    avatarId: profile.avatarId || undefined
  };

  return <ChildDashboard initialProfile={mappedProfile} metrics={metrics} />;
}
