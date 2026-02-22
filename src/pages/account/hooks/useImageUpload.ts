import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useToastAsync } from '@/hooks/useToastAsync';
import { changeImageProfileCollaborator } from '@/services/auth/changeImageProfileCollaborator';
import { removeImageProfileCollaborator } from '@/services/auth/removeImageProfileCollaborator';
import { getPhotoCollaborator } from '@/services/prepCourse/collaborator/get-photo';

const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const VITE_FTP_PROFILE = import.meta.env.VITE_FTP_PROFILE;

interface UseImageUploadOptions {
  token: string;
  onUploadSuccess?: (fileName: string) => void;
  onDeleteSuccess?: () => void;
}

export function useImageUpload({
  token,
  onUploadSuccess,
  onDeleteSuccess,
}: UseImageUploadOptions) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [hasImageChange, setHasImageChange] = useState(false);
  const executeAsync = useToastAsync();
  const previousBlobUrlRef = useRef<string | null>(null);

  // Cleanup de blob URLs
  useEffect(() => {
    return () => {
      if (previousBlobUrlRef.current) {
        URL.revokeObjectURL(previousBlobUrlRef.current);
      }
    };
  }, []);

  const cleanupPreviousBlob = useCallback(() => {
    if (previousBlobUrlRef.current) {
      URL.revokeObjectURL(previousBlobUrlRef.current);
      previousBlobUrlRef.current = null;
    }
  }, []);

  const loadCollaboratorPhoto = useCallback(async (photoKey: string) => {
    try {
      cleanupPreviousBlob();

      const blob = await getPhotoCollaborator(photoKey);
      const url = URL.createObjectURL(blob);
      previousBlobUrlRef.current = url;
      setImagePreview(url);
    } catch (error) {
      console.error('Erro ao carregar foto do colaborador:', error);
      // Fallback para a URL do FTP caso falhe
      setImagePreview(`${VITE_FTP_PROFILE}${photoKey}`);
    }
  }, [cleanupPreviousBlob]);

  const previewImage = useCallback((selectedFile: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // Limpar blob anterior se existir (mas não limpar data URLs)
      cleanupPreviousBlob();
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  }, [cleanupPreviousBlob]);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.warn('O arquivo pode ter no máximo 1mb', { theme: 'dark' });
      return;
    }

    previewImage(selectedFile);
    setFile(selectedFile);
    setHasImageChange(true);
  }, [previewImage]);

  const uploadImage = useCallback(async (): Promise<string | null> => {
    if (!file) return null;

    const formData = new FormData();
    formData.append('file', file);

    let uploadedFileName: string | null = null;

    await executeAsync({
      action: () => changeImageProfileCollaborator(formData, token),
      loadingMessage: 'Upload de Imagem de Perfil Colaborador ... ',
      successMessage: 'Upload feito com sucesso',
      errorMessage: (error: Error) => error.message,
      onSuccess: async (fileName: string) => {
        uploadedFileName = fileName;
        await loadCollaboratorPhoto(fileName);
        setFile(null);
        setHasImageChange(false);
        onUploadSuccess?.(fileName);
      },
    });

    return uploadedFileName;
  }, [file, token, executeAsync, loadCollaboratorPhoto, onUploadSuccess]);

  const deleteImage = useCallback(async () => {
    cleanupPreviousBlob();

    try {
      const success = await removeImageProfileCollaborator(token);
      if (success) {
        setImagePreview(null);
        setFile(null);
        setHasImageChange(false);
        onDeleteSuccess?.();
      } else {
        toast.error('Não foi possível remover sua imagem');
      }
    } catch (error) {
      toast.error((error as Error).message);
    }
  }, [cleanupPreviousBlob, token, onDeleteSuccess]);

  return {
    imagePreview,
    file,
    hasImageChange,
    loadCollaboratorPhoto,
    handleImageChange,
    uploadImage,
    deleteImage,
  };
}

