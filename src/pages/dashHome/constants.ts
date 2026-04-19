// Proporções padrão para recorte de imagens das seções da home.
// Ajuste aqui para alterar em todos os modals de upload.
export const HOME_IMAGE_ASPECT = {
  feature: 16 / 9,
  supporter: 3 / 1,
  aboutThumbnail: 4 / 3,
} as const;

// Tamanho final (px) das imagens após crop — garante resolução consistente
// independente do arquivo original escolhido pelo admin.
export const HOME_IMAGE_SIZE = {
  feature: { width: 1280, height: 720 },
  supporter: { width: 900, height: 300 },
  aboutThumbnail: { width: 1280, height: 960 },
} as const;
