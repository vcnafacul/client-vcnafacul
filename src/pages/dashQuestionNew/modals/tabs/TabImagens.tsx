import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Question } from "@/dtos/question/questionDTO";
import { useToastAsync } from "@/hooks/useToastAsync";
import { getQuestionImage } from "@/services/question/getQuestionImage";
import { uploadImage } from "@/services/question/uploadImage";
import { useAuthStore } from "@/store/auth";
import { Download, Loader2, Upload, ZoomIn } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface TabImagensProps {
  question: Question;
  canEdit?: boolean;
}

export function TabImagens({ question, canEdit = false }: TabImagensProps) {
  const {
    data: { token },
  } = useAuthStore();
  const executeAsync = useToastAsync();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [currentImageId, setCurrentImageId] = useState<string | null>(
    question.imageId
  );

  const hasImage = !!currentImageId;

  // Carregar imagem quando o componente montar ou imageId mudar
  useEffect(() => {
    if (currentImageId) {
      loadImage();
    } else {
      setImageUrl(null);
    }

    // Cleanup: revogar URL do blob quando o componente desmontar ou imageId mudar
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [currentImageId]);

  // Função para carregar a imagem do backend
  const loadImage = async () => {
    if (!currentImageId) return;

    setIsLoadingImage(true);
    try {
      const blob = await getQuestionImage(currentImageId, token);
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
    } catch (error) {
      console.error("Erro ao carregar imagem:", error);
      setImageUrl(null);
    } finally {
      setIsLoadingImage(false);
    }
  };

  // Função para fazer upload de nova imagem
  const handleUpload = async (file: File) => {
    if (!file) return;

    // Validar tipo de arquivo
    const validTypes = ["image/png", "image/jpg", "image/jpeg", "image/heic"];
    if (!validTypes.includes(file.type)) {
      alert("Formato de arquivo inválido! Use PNG, JPG, JPEG ou HEIC.");
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Arquivo muito grande! O tamanho máximo é 5MB.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    await executeAsync({
      action: () => uploadImage(question._id, formData, token),
      loadingMessage: "Fazendo upload da imagem...",
      successMessage: "✅ Imagem enviada com sucesso!",
      errorMessage: "Erro ao fazer upload da imagem",
      onSuccess: (newImageId) => {
        setCurrentImageId(newImageId);
      },
      onFinally: () => {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
    });
  };

  // Abrir seletor de arquivo
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  // Handler para quando um arquivo é selecionado
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Imagem Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🖼️ Imagem da Questão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input de arquivo oculto */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpg,image/jpeg,image/heic"
            onChange={handleFileChange}
            className="hidden"
          />

          {hasImage ? (
            <div className="space-y-4">
              {/* Preview da Imagem */}
              <div className="relative group">
                <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                  {isLoadingImage ? (
                    <div className="flex items-center justify-center min-h-[300px]">
                      <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-sm text-gray-600">
                          Carregando imagem...
                        </p>
                      </div>
                    </div>
                  ) : imageUrl ? (
                    <div className="rounded-lg overflow-hidden">
                      <img
                        src={imageUrl}
                        alt="Imagem da questão"
                        className="w-full h-auto object-contain max-h-[500px]"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center min-h-[300px]">
                      <p className="text-sm text-gray-500">
                        Erro ao carregar imagem
                      </p>
                    </div>
                  )}
                </div>

                {/* Overlay com ações no hover */}
                {imageUrl && !isLoadingImage && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-white/90 hover:bg-white"
                      onClick={() => window.open(imageUrl, "_blank")}
                    >
                      <ZoomIn className="h-4 w-4 mr-2" />
                      Ampliar
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-white/90 hover:bg-white"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = imageUrl;
                        link.download = `questao-${question.numero}.png`;
                        link.click();
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar
                    </Button>
                  </div>
                )}
              </div>

              {/* Informações da Imagem */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <p className="text-xs text-gray-600">ID da Imagem</p>
                  <p className="text-sm font-semibold truncate">
                    {currentImageId}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Status</p>
                  <p className="text-sm font-semibold text-green-600">
                    ✓ Disponível
                  </p>
                </div>
              </div>

              {/* Botões de Ação */}
              {canEdit && (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={openFileSelector}
                    disabled={isUploading || isRemoving}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Substituir Imagem
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            // Estado sem imagem
            <div
              className={`border-2 border-dashed border-gray-300 rounded-lg p-12 text-center transition-colors ${
                canEdit
                  ? "hover:border-primary cursor-pointer"
                  : "cursor-not-allowed opacity-60"
              }`}
              onClick={canEdit ? openFileSelector : undefined}
            >
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-12 w-12 mx-auto text-primary mb-4 animate-spin" />
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    Enviando imagem...
                  </p>
                  <p className="text-sm text-gray-500">
                    Por favor, aguarde enquanto processamos sua imagem
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    Nenhuma imagem enviada
                  </p>
                  {canEdit ? (
                    <>
                      <p className="text-sm text-gray-500 mb-4">
                        Clique para fazer upload de uma imagem
                      </p>
                      <div className="text-xs text-gray-400">
                        <p>Formatos aceitos: PNG, JPG, JPEG, HEIC</p>
                        <p>Tamanho máximo: 5MB</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Você não tem permissão para adicionar imagens
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Informação sobre conversão HEIC */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <span className="font-semibold">💡 Dica:</span> Imagens no formato
              HEIC serão automaticamente convertidas para PNG
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Imagens por Alternativa - Futuro */}
      <Card className="border-dashed border-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span>🔮</span>
            <span>Imagens por Alternativa</span>
            <span className="text-xs font-normal text-gray-500 ml-2">
              (Em breve)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {["A", "B", "C", "D", "E"].map((letra) => (
              <div
                key={letra}
                className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 opacity-50"
              >
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-400">{letra}</p>
                  <Upload className="h-6 w-6 mx-auto text-gray-300 mt-2" />
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 text-center mt-4">
            Funcionalidade para adicionar imagens específicas para cada
            alternativa
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
