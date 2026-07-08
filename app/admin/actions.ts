'use server';

import { revalidatePath } from 'next/cache';
import { publishPost, reclassifyPost, discardPost, updatePost } from '@/lib/admin';

function refresh() {
  revalidatePath('/admin');
  revalidatePath('/');
}

export async function publishAction(id: string) {
  await publishPost(id);
  refresh();
}

export async function reclassifyAction(id: string, editoriaSlug: string) {
  await reclassifyPost(id, editoriaSlug);
  refresh();
}

export async function discardAction(id: string) {
  await discardPost(id);
  refresh();
}

export async function updateAction(
  id: string,
  data: { title?: string; excerpt?: string; body?: string; coverImageUrl?: string },
) {
  await updatePost(id, data);
  refresh();
}
