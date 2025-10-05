import { InputFactory } from "@/components/organisms/inputFactory";
import { ModalProps } from "@/components/templates/modalTemplate";
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
import { changeAgreement } from "@/services/prepCourse/prepCourse/changeAgreement";
import { changeLogo } from "@/services/prepCourse/prepCourse/changeLogo";
import { getAgreement } from "@/services/prepCourse/prepCourse/getAgreement";
import {
  getUserByName,
  SearchUser,
} from "@/services/prepCourse/prepCourse/getUserByName";
import { updateRepresentative } from "@/services/prepCourse/prepCourse/updateRepresentative";
import { useAuthStore } from "@/store/auth";
import { PartnerPrepCourse } from "@/types/partnerPrepCourse/partnerPrepCourse";
import { useEffect, useRef, useState } from "react";
import {
  IoMdClose,
  IoMdCloudOutline,
  IoMdCreate,
  IoMdDownload,
} from "react-icons/io";
import { toast } from "react-toastify";

export interface ModalPrincipalProps extends ModalProps {
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
  const [showForceUpdateModal, setShowForceUpdateModal] =
    useState<boolean>(false);
  const [pendingUser, setPendingUser] = useState<SearchUser | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const agreementInputRef = useRef<HTMLInputElement>(null);
  const coordinatorInputRef = useRef<HTMLInputElement>(null);

  const {
    data: { token },
  } = useAuthStore();

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
    const id = toast.loading("Fazendo upload da imagem...");
    try {
      const result = await changeLogo(token, prepCourse.id, file);

      // Atualizar o thumbnail com o resultado
      setCurrentThumbnail(result);

      toast.update(id, {
        render: "Upload concluído!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.update(id, {
        render:
          "Erro ao fazer upload da imagem. Tente novamente." + error.message,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
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

    try {
      const id = toast.loading("Fazendo upload do contrato...");

      await changeAgreement(token, prepCourse.id, selectedAgreement);

      toast.update(id, {
        render: "Contrato atualizado com sucesso!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      // Limpar o arquivo selecionado após upload bem-sucedido
      setSelectedAgreement(null);
      setAgreementFileName("flipper.contract (26.71kb)");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error("Erro ao fazer upload do contrato. Tente novamente.");
      console.error("Erro no upload do contrato:", error);
    }
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

    const id = toast.loading("Baixando contrato...");
    try {
      const blob = await getAgreement(token, prepCourse.id);

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

      toast.update(id, {
        render: "Contrato baixado com sucesso!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.update(id, {
        render: "Erro ao baixar o contrato. Tente novamente.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      console.error("Erro no download do contrato:", error);
    }
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
    setShowDropdown(false);
    setSearchResults([]);
  };

  // Função para atualizar representante
  const handleUpdateRepresentative = async () => {
    if (!selectedUser) {
      toast.error("Por favor, selecione um usuário da lista.");
      return;
    }

    const id = toast.loading("Atualizando representante...");
    try {
      await updateRepresentative(token, prepCourse.id, selectedUser.id);

      toast.update(id, {
        render: "Representante atualizado com sucesso!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      // Atualizar o prepCourse com o novo representante
      prepCourse.representative = {
        ...prepCourse.representative,
        id: selectedUser.id,
        name: selectedUser.name,
        email: selectedUser.email,
        phone: selectedUser.phone,
      };

      // Atualizar o formData com os novos valores
      setFormData((prev) => ({
        ...prev,
        coordinator: selectedUser.name,
        coordinatorEmail: selectedUser.email,
        coordinatorPhone: selectedUser.phone,
      }));

      // Fechar modo de edição
      setEditable(false);

      // Limpar seleção
      setSelectedUser(null);
      setSearchResults([]);
      setShowDropdown(false);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // Verificar se é o erro específico de representante já cadastrado como colaborador
      if (
        error.message &&
        error.message.includes("Representante já cadastrado")
      ) {
        toast.update(id, {
          render: "",
          type: "error",
          isLoading: false,
          autoClose: 0,
        });
        // Armazenar o usuário pendente e mostrar modal de confirmação
        setPendingUser(selectedUser);
        setShowForceUpdateModal(true);
      } else {
        toast.update(id, {
          render: `Erro ao atualizar representante. ${error.message}`,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        console.error(error);
      }
    }
  };

  // Função para forçar atualização do representante
  const handleForceUpdate = async () => {
    if (!pendingUser) {
      return;
    }

    const id = toast.loading("Forçando atualização do representante...");
    try {
      await updateRepresentative(token, prepCourse.id, pendingUser.id, true);

      toast.update(id, {
        render: "Representante atualizado com sucesso!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      // Atualizar o prepCourse com o novo representante
      prepCourse.representative = {
        ...prepCourse.representative,
        id: pendingUser.id,
        name: pendingUser.name,
        email: pendingUser.email,
        phone: pendingUser.phone,
      };

      // Atualizar o formData com os novos valores
      setFormData((prev) => ({
        ...prev,
        coordinator: pendingUser.name,
        coordinatorEmail: pendingUser.email,
        coordinatorPhone: pendingUser.phone,
      }));

      // Fechar modo de edição
      setEditable(false);

      // Limpar seleção
      setSelectedUser(null);
      setSearchResults([]);
      setShowDropdown(false);

      // Fechar modal e limpar usuário pendente
      setShowForceUpdateModal(false);
      setPendingUser(null);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.update(id, {
        render: `Erro ao forçar atualização do representante. ${error.message}`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      console.error(error);

      // Fechar modal mesmo em caso de erro
      setShowForceUpdateModal(false);
      setPendingUser(null);
    }
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
    <div className="space-y-6">
      {/* Header com título e botões */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-marine">
            Informações Básicas
          </h1>
          <div className="w-16 h-1 bg-green-500 mt-2"></div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleEdit}
            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
          >
            <IoMdCreate className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
          >
            <IoMdClose className="w-4 h-4 text-gray-600" />
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
            className="bg-gray-100 border-gray-300 h-14"
          />
          <InputFactory
            id="city"
            label="Cidade"
            type="text"
            value={formData.city}
            onChange={handleInputChange("city")}
            disabled
            className="bg-gray-100 border-gray-300 h-14"
          />
          <InputFactory
            id="state"
            label="Estado"
            type="text"
            value={formData.state}
            onChange={handleInputChange("state")}
            disabled
            className="bg-gray-100 border-gray-300 h-14"
          />
        </div>

        {/* Coluna direita */}
        <div className="space-y-4">
          {/* Campo Coordenador com busca */}
          <div className="relative">
            <label
              className="absolute p-0 top-1.5 left-2 text-xs text-grey font-semibold"
              htmlFor="coordinator"
            >
              Coordenador
            </label>
            <input
              ref={coordinatorInputRef}
              id="coordinator"
              type="text"
              value={formData.coordinator}
              onChange={handleCoordinatorChange}
              disabled={!editable}
              className="h-16 pt-4 w-full px-3 py-1 text-sm border border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:ring-1 focus:ring-orange disabled:opacity-50"
              placeholder="Digite o nome do coordenador..."
            />

            {/* Dropdown de resultados */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => selectUser(user)}
                  >
                    <div className="font-medium text-sm text-gray-900">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.email} • {user.phone}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Loading indicator */}
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-orange rounded-full animate-spin"></div>
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
            className="bg-gray-100 border-gray-300 h-14"
          />
          <InputFactory
            id="coordinatorPhone"
            label="Telefone do Coordenador"
            type="text"
            value={formData.coordinatorPhone}
            onChange={handleInputChange("coordinatorPhone")}
            disabled
            className="bg-gray-100 border-gray-300 h-14"
          />
        </div>
      </div>

      {/* Seção de Logo e Contrato */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seção de Logo */}
        <div className="space-y-3 flex justify-between">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Logomarca do cursinho
            </label>
            <p className="text-xs text-gray-500">Recomendado 300x300</p>
            <Button
              variant="outline"
              disabled={!editable}
              onClick={openFileSelector}
              className="bg-gray-50 w-28 h-10 border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              Mudar
            </Button>
          </div>
          <div>
            {currentThumbnail ? (
              <img src={currentThumbnail} alt="Logo" />
            ) : (
              <span className="text-gray-500 text-sm font-medium">Logo</span>
            )}
          </div>
        </div>

        {/* Seção de Contrato */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Contrato
          </label>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md group">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span
                className={`text-sm text-gray-600 flex items-center gap-1 ${
                  prepCourse.agreement && !selectedAgreement
                    ? "cursor-pointer hover:text-blue-600 hover:underline"
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
                  <IoMdDownload className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </span>
              {selectedAgreement && (
                <IoMdClose
                  className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600"
                  onClick={removeSelectedAgreement}
                />
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!editable}
                onClick={openAgreementFileSelector}
                className="bg-gray-50 w-fit border-gray-300 text-gray-600 hover:bg-gray-100 flex items-center gap-2"
              >
                <IoMdCloudOutline className="w-4 h-4" />
                Selecionar arquivo
              </Button>
              {selectedAgreement && (
                <Button
                  variant="outline"
                  disabled={!editable}
                  onClick={handleAgreementUpload}
                  className="bg-gray-50 w-fit border-gray-300 text-gray-600 hover:bg-gray-100"
                >
                  Atualizar contrato
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4 items-end">
        {/* Informações de parceria */}
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Ano de parceria: {new Date(prepCourse.updatedAt).getFullYear()}
          </p>
          <p className="text-sm text-gray-600">
            Última atualização:{" "}
            {new Date(prepCourse.updatedAt).toLocaleDateString("pt-BR")}
          </p>
        </div>

        {/* Botão de atualizar */}
        <div className={editable ? "flex justify-end" : "hidden"}>
          <Button
            variant="outline"
            onClick={handleUpdateRepresentative}
            className="bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200 px-8"
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
        open={showForceUpdateModal}
        onOpenChange={setShowForceUpdateModal}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-marine">
              Representante já é colaborador
            </AlertDialogTitle>
            <AlertDialogDescription>
              Este usuário já está cadastrado como colaborador. Deseja forçar a
              atualização para representante?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border border-orange text-orange hover:bg-orange hover:border-orange/20 hover:text-white"
              onClick={() => {
                setShowForceUpdateModal(false);
                setPendingUser(null);
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-orange text-white hover:bg-orange/80"
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
