# Exemplos de Código - Refatoração Account

## 📁 Estrutura de Arquivos Proposta

```
src/pages/account/
├── index.tsx
├── components/
│   ├── AccountHeader.tsx
│   ├── AccountFormSection.tsx
│   └── CollaboratorFrentes.tsx
├── hooks/
│   ├── useAccountData.ts
│   ├── useImageUpload.ts
│   └── useFrentesSelection.ts
└── utils/
    └── accountHelpers.ts
```

---

## 🎣 Hook: useAccountData

```typescript
// hooks/useAccountData.ts
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { UserMe } from '@/types/user/userMe';
import { me } from '@/services/auth/me';
import { useAuthStore } from '@/store/auth';

export function useAccountData() {
  const { data: { token }, updateAccount } = useAuthStore();
  const [userAccount, setUserAccount] = useState<UserMe | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        const data = await me(token);
        setUserAccount(data);
        updateAccount(data);
      } catch (error) {
        toast.error((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [token, updateAccount]);

  const updateUserAccount = (updates: Partial<UserMe>) => {
    const updated = { ...userAccount!, ...updates };
    setUserAccount(updated);
    updateAccount(updated);
  };

  return {
    userAccount,
    isLoading,
    updateUserAccount,
  };
}
```

---

## 🎣 Hook: useImageUpload

```typescript
// hooks/useImageUpload.ts
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useToastAsync } from '@/hooks/useToastAsync';
import { changeImageProfileCollaborator } from '@/services/auth/changeImageProfileCollaborator';
import { removeImageProfileCollaborator } from '@/services/auth/removeImageProfileCollaborator';
import { getPhotoCollaborator } from '@/services/prepCourse/collaborator/get-photo';

const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const VITE_FTP_PROFILE = import.meta.env.VITE_FTP_PROFILE;

export function useImageUpload(token: string, onSuccess?: (fileName: string) => void) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [hasImageChange, setHasImageChange] = useState(false);
  const executeAsync = useToastAsync();

  // Cleanup de blob URLs
  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const loadCollaboratorPhoto = useCallback(async (photoKey: string) => {
    try {
      // Limpar URL anterior
      if (imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }

      const blob = await getPhotoCollaborator(photoKey);
      const url = URL.createObjectURL(blob);
      setImagePreview(url);
    } catch (error) {
      console.error('Erro ao carregar foto:', error);
      setImagePreview(`${VITE_FTP_PROFILE}${photoKey}`);
    }
  }, [imagePreview]);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.warn('O arquivo pode ter no máximo 1MB', { theme: 'dark' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
    setFile(selectedFile);
    setHasImageChange(true);
  }, []);

  const uploadImage = useCallback(async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    await executeAsync({
      action: () => changeImageProfileCollaborator(formData, token),
      loadingMessage: 'Upload de Imagem de Perfil...',
      successMessage: 'Upload feito com sucesso',
      errorMessage: (error: Error) => error.message,
      onSuccess: async (fileName) => {
        await loadCollaboratorPhoto(fileName);
        setFile(null);
        setHasImageChange(false);
        onSuccess?.(fileName);
      },
    });
  }, [file, token, executeAsync, loadCollaboratorPhoto, onSuccess]);

  const deleteImage = useCallback(async () => {
    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    try {
      const success = await removeImageProfileCollaborator(token);
      if (success) {
        setImagePreview(null);
        setFile(null);
        setHasImageChange(false);
      } else {
        toast.error('Não foi possível remover sua imagem');
      }
    } catch (error) {
      toast.error((error as Error).message);
    }
  }, [imagePreview, token]);

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
```

---

## 🎣 Hook: useFrentesSelection

```typescript
// hooks/useFrentesSelection.ts
import { useState, useEffect, useMemo } from 'react';
import { FrenteDto } from '@/dtos/content/contentDtoInput';
import { Materias } from '@/enums/content/materias';
import { getFrentes } from '@/services/content/getFrentes';

export function useFrentesSelection(
  token: string,
  initialSelectedIds: string[] = []
) {
  const [allFrentes, setAllFrentes] = useState<FrenteDto[]>([]);
  const [selectedFrentesIds, setSelectedFrentesIds] = useState<string[]>(initialSelectedIds);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar todas as frentes de todas as matérias
  useEffect(() => {
    const loadAllFrentes = async () => {
      try {
        setIsLoading(true);
        const materias = Object.values(Materias).filter(
          (v) => typeof v === 'number'
        ) as Materias[];

        const promises = materias.map((materia) => getFrentes(materia, token));
        const results = await Promise.all(promises);
        const flatFrentes = results.flat();
        setAllFrentes(flatFrentes);
      } catch (error) {
        console.error('Erro ao carregar frentes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllFrentes();
  }, [token]);

  // Frentes disponíveis (não selecionadas)
  const availableFrentes = useMemo(() => {
    return allFrentes.filter((frente) => !selectedFrentesIds.includes(frente.id));
  }, [allFrentes, selectedFrentesIds]);

  // Frentes selecionadas (com dados completos)
  const selectedFrentes = useMemo(() => {
    return allFrentes.filter((frente) => selectedFrentesIds.includes(frente.id));
  }, [allFrentes, selectedFrentesIds]);

  const selectFrente = (frenteId: string) => {
    setSelectedFrentesIds((prev) => [...prev, frenteId]);
  };

  const removeFrente = (frenteId: string) => {
    setSelectedFrentesIds((prev) => prev.filter((id) => id !== frenteId));
  };

  const hasChanges = useMemo(() => {
    const initialSet = new Set(initialSelectedIds);
    const currentSet = new Set(selectedFrentesIds);
    
    if (initialSet.size !== currentSet.size) return true;
    
    return ![...initialSet].every((id) => currentSet.has(id));
  }, [initialSelectedIds, selectedFrentesIds]);

  return {
    availableFrentes,
    selectedFrentes,
    selectedFrentesIds,
    isLoading,
    hasChanges,
    selectFrente,
    removeFrente,
    reset: () => setSelectedFrentesIds(initialSelectedIds),
  };
}
```

---

## 🧩 Componente: CollaboratorFrentes

```typescript
// components/CollaboratorFrentes.tsx
import { useState } from 'react';
import { FrenteDto } from '@/dtos/content/contentDtoInput';
import { useFrentesSelection } from '../hooks/useFrentesSelection';

interface CollaboratorFrentesProps {
  token: string;
  initialSelectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

export function CollaboratorFrentes({
  token,
  initialSelectedIds = [],
  onSelectionChange,
}: CollaboratorFrentesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const {
    availableFrentes,
    selectedFrentes,
    isLoading,
    selectFrente,
    removeFrente,
  } = useFrentesSelection(token, initialSelectedIds);

  // Filtrar frentes disponíveis por busca
  const filteredFrentes = availableFrentes.filter((frente) =>
    frente.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (frenteId: string) => {
    selectFrente(frenteId);
    onSelectionChange?.([...selectedFrentes.map((f) => f.id), frenteId]);
  };

  const handleRemove = (frenteId: string) => {
    removeFrente(frenteId);
    onSelectionChange?.(
      selectedFrentes.filter((f) => f.id !== frenteId).map((f) => f.id)
    );
  };

  if (isLoading) {
    return <div>Carregando frentes...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Frentes de Afinidade
        </label>
        <p className="text-xs text-gray-500 mb-4">
          Selecione as frentes com as quais você tem mais afinidade
        </p>

        {/* Input de busca e seleção */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar e selecionar frentes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            list="frentes-list"
          />
          <datalist id="frentes-list">
            {filteredFrentes.map((frente) => (
              <option
                key={frente.id}
                value={frente.name}
                onClick={() => handleSelect(frente.id)}
              />
            ))}
          </datalist>
        </div>

        {/* Dropdown customizado (alternativa ao datalist) */}
        {searchTerm && filteredFrentes.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {filteredFrentes.map((frente) => (
              <button
                key={frente.id}
                type="button"
                onClick={() => {
                  handleSelect(frente.id);
                  setSearchTerm('');
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              >
                <div className="font-medium">{frente.name}</div>
                <div className="text-xs text-gray-500">
                  {frente.materia}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Frentes selecionadas */}
      {selectedFrentes.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Frentes Selecionadas ({selectedFrentes.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedFrentes.map((frente) => (
              <span
                key={frente.id}
                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {frente.name}
                <button
                  type="button"
                  onClick={() => handleRemove(frente.id)}
                  className="hover:text-blue-600 focus:outline-none"
                  aria-label={`Remover ${frente.name}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 🧩 Componente: AccountHeader

```typescript
// components/AccountHeader.tsx
import { ReactComponent as LogoIcon } from '@/assets/images/home/logo.svg';
import ImageProfile from '@/components/molecules/imageProfile';
import { UserMe } from '@/types/user/userMe';

interface AccountHeaderProps {
  userAccount: UserMe | null;
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteImage: () => void;
}

export function AccountHeader({
  userAccount,
  imagePreview,
  onImageChange,
  onDeleteImage,
}: AccountHeaderProps) {
  const displayName = userAccount?.useSocialName
    ? userAccount?.socialName
    : userAccount?.firstName;

  return (
    <div className="flex px-6 py-4 w-full md:w-[300px] rounded-bl-3xl shadow-sm">
      <div className="flex flex-row md:flex-col gap-4">
        {userAccount?.collaborator ? (
          <ImageProfile
            deleteImage={onDeleteImage}
            onChange={onImageChange}
            src={imagePreview}
          />
        ) : (
          <LogoIcon className="w-24 h-24 p-2 bg-white border rounded-full animate-rotate" />
        )}
      </div>
      
      {/* Nome (mobile) */}
      <div className="flex flex-col px-8 pt-4 md:hidden justify-center">
        <span className="text-marine text-2xl font-extrabold leading-tight">
          {displayName}
        </span>
        <span className="text-marine text-lg font-medium">
          {userAccount?.lastName}
        </span>
        {userAccount?.collaborator && (
          <span className="text-marine text-sm font-semibold mt-1 opacity-80">
            {userAccount?.collaboratorDescription}
          </span>
        )}
      </div>
    </div>
  );
}
```

---

## 📄 Componente Principal Refatorado (index.tsx)

```typescript
// index.tsx (versão refatorada)
import { AccountForm } from '@/components/organisms/accountForm';
import { AccountHeader } from './components/AccountHeader';
import { CollaboratorFrentes } from './components/CollaboratorFrentes';
import { useAccountData } from './hooks/useAccountData';
import { useImageUpload } from './hooks/useImageUpload';
import { useModals } from '@/hooks/useModal';
import { useToastAsync } from '@/hooks/useToastAsync';
import ModalConfirmCancel from '@/components/organisms/modalConfirmCancel';
import { updateUser } from '@/services/auth/updateUser';
import { AuthUpdate, Gender, useAuthStore } from '@/store/auth';

function Account() {
  const { data: { token }, updateAccount } = useAuthStore();
  const { userAccount, updateUserAccount } = useAccountData();
  const executeAsync = useToastAsync();
  const modals = useModals(['deleteImage']);

  const {
    imagePreview,
    hasImageChange,
    loadCollaboratorPhoto,
    handleImageChange,
    uploadImage,
    deleteImage,
  } = useImageUpload(token, async (fileName) => {
    if (userAccount) {
      updateUserAccount({ collaboratorPhoto: fileName });
    }
  });

  // Carregar foto inicial
  useEffect(() => {
    if (userAccount?.collaboratorPhoto) {
      loadCollaboratorPhoto(userAccount.collaboratorPhoto);
    }
  }, [userAccount?.collaboratorPhoto, loadCollaboratorPhoto]);

  const updateData = async (
    authUpdate: AuthUpdate,
    frentesIds?: string[],
    onSuccess?: () => void
  ) => {
    // Upload de imagem primeiro (se houver)
    if (hasImageChange) {
      await uploadImage();
    }

    // Atualizar dados do usuário
    await executeAsync({
      action: () => updateUser(token, authUpdate),
      loadingMessage: 'Atualizando Informações...',
      successMessage: 'Atualização feita com sucesso',
      errorMessage: (error: Error) => error.message,
      onSuccess: () => {
        updateUserAccount(authUpdate);
        // TODO: Salvar frentes quando API estiver pronta
        // if (frentesIds) {
        //   await updateCollaboratorFrentes(frentesIds, token);
        // }
        onSuccess?.();
      },
    });
  };

  const handleDeleteImage = () => {
    modals.deleteImage.open();
  };

  const handleConfirmDelete = async () => {
    await deleteImage();
    if (userAccount) {
      updateUserAccount({ collaboratorPhoto: null });
    }
    modals.deleteImage.close();
  };

  if (!userAccount) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <div className="pb-20 flex flex-col md:flex-row w-full">
        <AccountHeader
          userAccount={userAccount}
          imagePreview={imagePreview}
          onImageChange={handleImageChange}
          onDeleteImage={handleDeleteImage}
        />

        <div className="w-full">
          {/* Nome (desktop) */}
          <div className="md:flex flex-col px-8 pt-4 hidden">
            <span className="text-marine text-2xl md:text-4xl font-extrabold leading-tight">
              {userAccount.useSocialName
                ? userAccount.socialName
                : userAccount.firstName}
            </span>
            <span className="text-marine text-lg md:text-xl font-medium">
              {userAccount.lastName}
            </span>
            {userAccount.collaborator && (
              <span className="text-marine text-sm font-semibold mt-1 opacity-80">
                {userAccount.collaboratorDescription}
              </span>
            )}
          </div>

          {/* Formulário */}
          <div className="px-6 py-6 w-full space-y-6">
            <AccountForm
              update={updateData}
              userAccount={userAccount}
              hasImageChange={hasImageChange}
            />

            {/* Seção de Frentes (apenas para colaboradores) */}
            {userAccount.collaborator && (
              <div className="mt-6">
                <CollaboratorFrentes
                  token={token}
                  initialSelectedIds={userAccount.collaboratorFrentes || []}
                  onSelectionChange={(frentesIds) => {
                    // Atualizar estado local
                    updateUserAccount({ collaboratorFrentes: frentesIds });
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <ModalConfirmCancel
        isOpen={modals.deleteImage.isOpen}
        handleClose={modals.deleteImage.close}
        handleConfirm={handleConfirmDelete}
        text="Tem certeza que deseja deletar sua imagem?"
      />
    </>
  );
}

export default Account;
```

---

## 🔧 Utilitários

```typescript
// utils/accountHelpers.ts
import { UserMe } from '@/types/user/userMe';
import { AuthUpdate } from '@/store/auth';

export function hasFormChanges(
  userAccount: UserMe,
  formData: AuthUpdate
): boolean {
  return (
    formData.firstName !== userAccount.firstName ||
    formData.lastName !== userAccount.lastName ||
    formData.socialName !== userAccount.socialName ||
    new Date(formData.birthday).toISOString() !== userAccount.birthday ||
    formData.city !== userAccount.city ||
    formData.state !== userAccount.state ||
    formData.phone !== userAccount.phone ||
    formData.gender !== userAccount.gender ||
    formData.about !== userAccount.about ||
    formData.useSocialName !== userAccount.useSocialName
  );
}

export function validateFileSize(file: File, maxSizeMB: number = 1): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}
```

---

## 📝 Notas de Implementação

1. **Tipos**: Remover todos os `any` e usar tipos adequados
2. **Error Handling**: Melhorar tratamento de erros em todos os hooks
3. **Loading States**: Adicionar estados de loading apropriados
4. **Acessibilidade**: Adicionar ARIA labels e suporte a teclado
5. **Performance**: Usar `useMemo` e `useCallback` onde apropriado
6. **Testes**: Criar testes unitários para hooks e componentes

