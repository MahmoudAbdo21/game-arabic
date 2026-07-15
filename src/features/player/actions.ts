'use server';

import { getSessionId, setSessionId, clearSession } from '@/lib/session';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function loginProfile(profileId: string) {
  const profile = await prisma.playerProfile.findUnique({
    where: { id: profileId }
  });
  if (!profile) throw new Error('Profile not found');
  await setSessionId(profile.id);
  return profile;
}

export async function logoutProfile() {
  await clearSession();
}

export async function getActiveProfile() {
  const sessionId = await getSessionId();
  if (!sessionId) return null;
  const profile = await prisma.playerProfile.findUnique({
    where: { id: sessionId }
  });
  if (!profile) {
    return null;
  }
  return profile;
}

export async function createProfile(name: string, avatarId: string) {
  const profile = await prisma.playerProfile.create({
    data: {
      name,
      avatarId
    }
  });
  await loginProfile(profile.id);
  return profile;
}

export async function getAllProfiles() {
  return await prisma.playerProfile.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function deleteProfile(profileId: string) {
  const sessionId = await getSessionId();
  if (sessionId === profileId) {
    await clearSession();
  }
  
  await prisma.playerProfile.delete({
    where: { id: profileId }
  });
}
