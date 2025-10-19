// Mock function - implementar depois
export async function deleteCoursePeriod(
  token: string,
  id: string
): Promise<void> {
  // Simular delay da API
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock success - não retorna nada
  console.log(`Mock: Deletando course period ${id}`);
}
