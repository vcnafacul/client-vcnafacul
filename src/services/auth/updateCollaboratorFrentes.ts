import fetchWrapper from '../../utils/fetchWrapper';
import { collaborator } from '../urls';

export async function updateCollaboratorFrentes(
  frentesIds: string[],
  token: string,
): Promise<void> {
  const response = await fetchWrapper(`${collaborator}/me/frentes`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ frenteIds: frentesIds }),
  });
  if (response.status !== 200) {
    throw new Error('Erro ao salvar frentes de afinidade');
  }
}
