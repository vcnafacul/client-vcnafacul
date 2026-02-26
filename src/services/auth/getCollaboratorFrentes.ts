import { me } from './me';

export async function getCollaboratorFrentes(token: string): Promise<string[]> {
  const user = await me(token);
  return user.collaboratorFrentes ?? [];
}
