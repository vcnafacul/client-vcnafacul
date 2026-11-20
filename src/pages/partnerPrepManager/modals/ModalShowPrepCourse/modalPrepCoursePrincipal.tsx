import { InputFactory } from "@/components/organisms/inputFactory";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useModals } from "@/hooks/useModal";
import { useToastAsync } from "@/hooks/useToastAsync";
import { getUserByName, SearchUser } from "@/services/auth/getUserByName";
import { changeAgreement } from "@/services/prepCourse/prepCourse/changeAgreement";
import { changeLogo } from "@/services/prepCourse/prepCourse/changeLogo";
import { getAgreement } from "@/services/prepCourse/prepCourse/getAgreement";
import { updateRepresentative } from "@/services/prepCourse/prepCourse/updateRepresentative";
import { useAuthStore } from "@/store/auth";
import { PartnerPrepCourse } from "@/types/partnerPrepCourse/partnerPrepCourse";
import { useEffect, useRef, useState } from "react";
import { Cloud, Download, Pencil, X } from "lucide-react";
import { toast } from "react-toastify";

export interface ModalPrincipalProps {
  handleClose?: () => void;
  prepCourse: PartnerPrepCourse;
}

export const ModalPrepCoursePrincipal = ({
  prepCourse,
  handleClose,
}: ModalPrincipalProps) => {
  const [editable, setEditable] = useState<boolean>(false);
  const [currentThumbnail, setCurrentThumbnail] = useState<string | null>(
    prepCourse.thumbnail
  );
  const [selectedAgreement, setSelectedAgreement] = useState<File | null>(null);
  const [agreementFileName, setAgreementFileName] = useState<string>(
    prepCourse.agreement || "flipper.contract (26.71kb)"
  );

  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const [pendingUser, setPendingUser] = useState<SearchUser | null>(null);
  const [hasCoordinatorChanges, setHasCoordinatorChanges] =
    useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const agreementInputRef = useRef<HTMLInputElement>(null);
  const coordinatorInputRef = useRef<HTMLInputElement>(null);

  const {
    data: { token },
  } = useAuthStore();

  const modals = useModals(["modalForceUpdate"]);

  const executeAsync = useToastAsync();

  // Estados para controlar os valores dos campos
  const [formData, setFormData] = useState({
    prepCourseName: prepCourse.geo.name,
    city: prepCourse.geo.city,
    state: prepCourse.geo.state,
    coordinator: prepCourse.representative.name,
    coordinatorEmail: prepCourse.representative.email,
    coordinatorPhone: prepCourse.representative.phone,
  });

  // Valores originais para reset
  const originalData = {
    prepCourseName: prepCourse.geo.name,
    city: prepCourse.geo.city,
    state: prepCourse.geo.state,
    coordinator: prepCourse.representative.name,
    coordinatorEmail: prepCourse.representative.email,
    coordinatorPhone: prepCourse.representative.phone,
  };

  // Função para resetar valores aos originais
  const resetToOriginal = () => {
    setFormData(originalData);
  };

  // Função para alternar modo de edição
  const toggleEdit = () => {
    if (editable) {
      // Se estava editando, cancela e reseta
      resetToOriginal();
      // Limpar seleção de usuário
      setSelectedUser(null);
      setSearchResults([]);
      setShowDropdown(false);
      // Resetar estado de mudanças
      setHasCoordinatorChanges(false);
    }
    setEditable(!editable);
  };

  // Função para atualizar um campo específico
  const updateField = (fieldName: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // Função para lidar com mudanças nos inputs
  const handleInputChange =
    (fieldName: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      updateField(fieldName, e.target.value);
    };

  // Função para validar arquivo de imagem
  const validateImageFile = (file: File): boolean => {
    // Verificar se é uma imagem
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione apenas arquivos de imagem.");
      return false;
    }

    // Verificar tamanho (2MB = 2 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("O arquivo deve ter no máximo 2MB.");
      return false;
    }

    return true;
  };

  // Função para lidar com upload de imagem
  const handleImageUpload = async (file: File) => {
    if (!validateImageFile(file)) {
      return;
    }

    await executeAsync({
      action: () => changeLogo(token, prepCourse.id, file),
      loadingMessage: "Fazendo upload da imagem...",
      successMessage: "Upload concluído!",
      errorMessage: "Erro ao fazer upload da imagem",
      onSuccess: (result) => {
        setCurrentThumbnail(result);
      },
    });
  };

  // Função para lidar com mudança de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Função para abrir seletor de arquivos
  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Função para validar arquivo de contrato
  const validateAgreementFile = (file: File): boolean => {
    // Verificar se é um PDF
    if (file.type !== "application/pdf") {
      toast.error("Por favor, selecione apenas arquivos PDF.");
      return false;
    }

    // Verificar tamanho (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("O arquivo deve ter no máximo 5MB.");
      return false;
    }

    return true;
  };

  // Função para lidar com seleção de arquivo de contrato
  const handleAgreementFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (validateAgreementFile(file)) {
        setSelectedAgreement(file);
        setAgreementFileName(
          `${file.name} (${(file.size / 1024).toFixed(1)}kb)`
        );
      }
    }
    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    if (agreementInputRef.current) {
      agreementInputRef.current.value = "";
    }
  };

  // Função para abrir seletor de arquivos de contrato
  const openAgreementFileSelector = () => {
    if (agreementInputRef.current) {
      agreementInputRef.current.click();
    }
  };

  // Função para lidar com upload de contrato
  const handleAgreementUpload = async () => {
    if (!selectedAgreement) {
      toast.error("Por favor, selecione um arquivo de contrato primeiro.");
      return;
    }

    await executeAsync({
      action: () => changeAgreement(token, prepCourse.id, selectedAgreement),
      loadingMessage: "Fazendo upload do contrato...",
      successMessage: "Contrato atualizado com sucesso!",
      errorMessage: "Erro ao fazer upload do contrato",
      onSuccess: () => {
        // preciso atualizar o prepCourse com o novo contrato
        setSelectedAgreement(null);
        setAgreementFileName("flipper.contract (26.71kb)");
      },
    });
  };

  // Função para remover arquivo de contrato selecionado
  const removeSelectedAgreement = () => {
    setSelectedAgreement(null);
    setAgreementFileName("flipper.contract (26.71kb)");
  };

  // Função para fazer download do contrato
  const handleDownloadAgreement = async () => {
    if (!prepCourse.agreement) {
      toast.error("Nenhum contrato disponível para download.");
      return;
    }

    await executeAsync({
      action: () => getAgreement(token, prepCourse.id),
      loadingMessage: "Baixando contrato...",
      successMessage: "Contrato baixado com sucesso!",
      errorMessage: "Erro ao baixar o contrato",
      onSuccess: (blob) => {
        // Criar URL do blob e fazer download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `contrato_${prepCourse.geo.name.replace(
          /\s+/g,
          "_"
        )}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
    });
  };

  // Função para buscar usuários
  const searchUsers = async (name: string) => {
    if (name.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await getUserByName(token, name);
      setSearchResults(results);
      setShowDropdown(true);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      setSearchResults([]);
      setShowDropdown(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Função para lidar com mudança no input do coordenador
  const handleCoordinatorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateField("coordinator", value);

    // Verificar se houve mudança em relação ao valor original
    const hasChanged = value !== originalData.coordinator;
    setHasCoordinatorChanges(hasChanged);

    // Limpar timeout anterior
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Definir novo timeout para busca
    const timeout = setTimeout(() => {
      searchUsers(value);
    }, 500);

    setSearchTimeout(timeout);
  };

  // Função para selecionar usuário
  const selectUser = (user: SearchUser) => {
    setSelectedUser(user);
    updateField("coordinator", user.name);
    updateField("coordinatorEmail", user.email);
    updateField("coordinatorPhone", user.phone);

    // Verificar se houve mudança em relação ao valor original
    const hasChanged = user.name !== originalData.coordinator;
    setHasCoordinatorChanges(hasChanged);

    setShowDropdown(false);
    setSearchResults([]);
  };

  const onSuccessUpdateRepresentative = () => {
    // Atualizar o prepCourse com o novo representante
    prepCourse.representative = {
      ...prepCourse.representative,
      id: selectedUser!.id,
      name: selectedUser!.name,
      email: selectedUser!.email,
      phone: selectedUser!.phone,
    };

    // Atualizar o formData com os novos valores
    setFormData((prev) => ({
      ...prev,
      coordinator: selectedUser!.name,
      coordinatorEmail: selectedUser!.email,
      coordinatorPhone: selectedUser!.phone,
    }));

    // Fechar modo de edição
    setEditable(false);

    // Limpar seleção
    setSelectedUser(null);
    setSearchResults([]);
    setShowDropdown(false);

    // Resetar estado de mudanças
    setHasCoordinatorChanges(false);
  };

  // Função para atualizar representante
  const handleUpdateRepresentative = async () => {
    if (!selectedUser) {
      toast.error("Por favor, selecione um usuário da lista.");
      return;
    }

    await executeAsync({
      action: () => updateRepresentative(token, prepCourse.id, selectedUser.id),
      loadingMessage: "Atualizando representante...",
      successMessage: "Representante atualizado com sucesso!",
      errorMessage: "Erro ao atualizar representante",
      onSuccess: onSuccessUpdateRepresentative,
    });
  };

  // Função para forçar atualização do representante
  const handleForceUpdate = async () => {
    if (!pendingUser) {
      return;
    }

    await executeAsync({
      action: () =>
        updateRepresentative(token, prepCourse.id, pendingUser.id, true),
      loadingMessage: "Forçando atualização do representante...",
      successMessage: "Representante atualizado com sucesso!",
      errorMessage: "Erro ao forçar atualização do representante",
      onSuccess: onSuccessUpdateRepresentative,
      onError: () => {
        modals.modalForceUpdate.close();
        setPendingUser(null);
      },
    });
  };

  // Cleanup do timeout
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <div className="space-y-6 px-0.5">
      {/* Header com título e botões */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-h1 font-bold text-foreground">
            Informações Básicas
          </h1>
          <div className="w-16 h-1 bg-success mt-2"></div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleEdit}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors"
          >
            <Pencil className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Campos de formulário em duas colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Coluna esquerda */}
        <div className="space-y-4">
          <InputFactory
            id="prepCourseName"
            label="Nome do Cursinho"
            type="text"
            value={formData.prepCourseName}
            onChange={handleInputChange("prepCourseName")}
            disabled
            className="bg-muted border-border h-14"
          />
          <InputFactory
            id="city"
            label="Cidade"
            type="text"
            value={formData.city}
            onChange={handleInputChange("city")}
            disabled
            className="bg-muted border-border h-14"
          />
          <InputFactory
            id="state"
            label="Estado"
            type="text"
            value={formData.state}
            onChange={handleInputChange("state")}
            disabled
            className="bg-muted border-border h-14"
          />
        </div>

        {/* Coluna direita */}
        <div className="space-y-4">
          {/* Campo Coordenador com busca */}
          <div className="relative">
            <label
              className="absolute p-0 top-1.5 left-2 text-caption text-muted-foreground font-semibold"
              htmlFor="coordinator"
            >
              Coordenador
            </label>
            <input
              ref={coordinatorInputRef}
              id="coordinator"
              type="text"
              autoComplete="off"
              value={formData.coordinator}
              onChange={handleCoordinatorChange}
              disabled={!editable}
              className="h-16 pt-4 w-full px-3 py-1 text-body border border-border rounded-md bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
              placeholder="Digite o nome do coordenador..."
            />

            {/* Dropdown de resultados */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute z-raised w-full mt-1 bg-white border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="px-3 py-2 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                    onClick={() => selectUser(user)}
                  >
                    <div className="font-medium text-body text-foreground">
                      {user.name}
                    </div>
                    <div className="text-caption text-muted-foreground">
                      {user.email} • {user.phone}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Loading indicator */}
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-border border-t-cta rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <InputFactory
            id="coordinatorEmail"
            label="Email do Coordenador"
            type="email"
            value={formData.coordinatorEmail}
            onChange={handleInputChange("coordinatorEmail")}
            disabled
            className="bg-muted border-border h-14"
          />
          <InputFactory
            id="coordinatorPhone"
            label="Telefone do Coordenador"
            type="text"
            value={formData.coordinatorPhone}
            onChange={handleInputChange("coordinatorPhone")}
            disabled
            className="bg-muted border-border h-14"
          />
        </div>
      </div>

      {/* Seção de Logo e Contrato */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seção de Logo */}
        <div className="space-y-3 flex justify-between">
          <div className="space-y-2">
            <label className="block text-body font-medium text-foreground">
              Logomarca do cursinho
            </label>
            <p className="text-caption text-muted-foreground">Recomendado 300x300</p>
            <Button
              variant="outline"
              disabled={!editable}
              onClick={openFileSelector}
              className="bg-page w-28 h-10 border-border text-muted-foreground hover:bg-muted"
            >
              Mudar
            </Button>
          </div>
          <div>
            {currentThumbnail ? (
              <img src={currentThumbnail} alt="Logo" />
            ) : (
              <span className="text-muted-foreground text-body font-medium">Logo</span>
            )}
          </div>
        </div>

        {/* Seção de Contrato */}
        <div className="space-y-3">
          <label className="block text-body font-medium text-foreground">
            Contrato
          </label>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted border border-border rounded-md group">
              <div className="w-4 h-4 bg-muted-foreground rounded-sm"></div>
              <span
                className={`text-body text-muted-foreground flex items-center gap-1 ${
                  prepCourse.agreement && !selectedAgreement
                    ? "cursor-pointer hover:text-primary hover:underline"
                    : ""
                }`}
                onClick={
                  prepCourse.agreement && !selectedAgreement
                    ? handleDownloadAgreement
                    : undefined
                }
                title={
                  prepCourse.agreement && !selectedAgreement
                    ? "Clique para baixar o contrato"
                    : ""
                }
              >
                {agreementFileName}
                {prepCourse.agreement && !selectedAgreement && (
                  <Download className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </span>
              {selectedAgreement && (
                <X
                  className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={removeSelectedAgreement}
                />
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                disabled={!editable}
                onClick={openAgreementFileSelector}
                className="bg-page w-fit border-border text-muted-foreground hover:bg-muted flex items-center gap-2"
              >
                <Cloud className="w-4 h-4" />
                Selecionar arquivo
              </Button>
              {selectedAgreement && (
                <Button
                  variant="outline"
                  disabled={!editable}
                  onClick={handleAgreementUpload}
                  className="bg-page w-fit border-border text-muted-foreground hover:bg-muted"
                >
                  Atualizar contrato
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-between gap-3 pt-4 items-end">
        {/* Informações de parceria */}
        <div className="space-y-2">
          <p className="text-body text-muted-foreground">
            {/* Era o ano do updatedAt: qualquer edição "mudava" o ano de parceria. */}
            Ano de parceria: {new Date(prepCourse.createdAt).getFullYear()}
          </p>
          <p className="text-body text-muted-foreground">
            Última atualização:{" "}
            {new Date(prepCourse.updatedAt).toLocaleDateString("pt-BR")}
          </p>
        </div>

        {/* Botão de atualizar */}
        <div
          className={
            editable && hasCoordinatorChanges ? "flex justify-end" : "hidden"
          }
        >
          <Button
            variant="outline"
            onClick={handleUpdateRepresentative}
            className="bg-muted border-border text-muted-foreground hover:bg-muted px-8"
          >
            Atualizar
          </Button>
        </div>
      </div>

      {/* Input file hidden para upload de imagem */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {/* Input file hidden para upload de contrato */}
      <input
        ref={agreementInputRef}
        type="file"
        accept=".pdf"
        onChange={handleAgreementFileChange}
        style={{ display: "none" }}
      />

      {/* Modal de confirmação para forçar atualização */}
      <AlertDialog
        open={modals.modalForceUpdate.isOpen}
        onOpenChange={() => modals.modalForceUpdate.close()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Representante já é colaborador
            </AlertDialogTitle>
            <AlertDialogDescription>
              Este usuário já está cadastrado como colaborador. Deseja forçar a
              atualização para representante?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border border-cta text-foreground hover:bg-cta hover:border-cta/20 hover:text-cta-foreground"
              onClick={() => {
                modals.modalForceUpdate.close();
                setPendingUser(null);
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-cta text-cta-foreground hover:bg-cta/80"
              onClick={handleForceUpdate}
            >
              Forçar Atualização
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
