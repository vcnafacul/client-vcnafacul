import { InputFactory } from "@/components/organisms/inputFactory";
import { ModalProps } from "@/components/templates/modalTemplate";
import { Button } from "@/components/ui/button";
import { changeLogo } from "@/services/prepCourse/prepCourse/changeLogo";
import { useAuthStore } from "@/store/auth";
import { PartnerPrepCourse } from "@/types/partnerPrepCourse/partnerPrepCourse";
import { useRef, useState } from "react";
import { IoMdClose, IoMdCloudOutline, IoMdCreate } from "react-icons/io";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    console.log(file);
    const id = toast.loading("Fazendo upload da imagem...");
    try {
      const result = await changeLogo(token, prepCourse.id, file);

      // Atualizar o thumbnail com o resultado
      console.log(result);
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
            disabled={!editable}
            className="bg-gray-100 border-gray-300 h-14"
          />
          <InputFactory
            id="city"
            label="Cidade"
            type="text"
            value={formData.city}
            onChange={handleInputChange("city")}
            disabled={!editable}
            className="bg-gray-100 border-gray-300 h-14"
          />
          <InputFactory
            id="state"
            label="Estado"
            type="text"
            value={formData.state}
            onChange={handleInputChange("state")}
            disabled={!editable}
            className="bg-gray-100 border-gray-300 h-14"
          />
        </div>

        {/* Coluna direita */}
        <div className="space-y-4">
          <InputFactory
            id="coordinator"
            label="Coordenador"
            type="text"
            value={formData.coordinator}
            onChange={handleInputChange("coordinator")}
            disabled={!editable}
            className="bg-gray-100 border-gray-300 h-14"
          />
          <InputFactory
            id="coordinatorEmail"
            label="Email do Coordenador"
            type="email"
            value={formData.coordinatorEmail}
            onChange={handleInputChange("coordinatorEmail")}
            disabled={!editable}
            className="bg-gray-100 border-gray-300 h-14"
          />
          <InputFactory
            id="coordinatorPhone"
            label="Telefone do Coordenador"
            type="text"
            value={formData.coordinatorPhone}
            onChange={handleInputChange("coordinatorPhone")}
            disabled={!editable}
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
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span className="text-sm text-gray-600">
                flipper.contract (26.71kb)
              </span>
              <IoMdClose className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            <Button
              variant="outline"
              disabled={!editable}
              className="bg-gray-50 w-fit border-gray-300 text-gray-600 hover:bg-gray-100 flex items-center gap-2"
            >
              <IoMdCloudOutline className="w-4 h-4" />
              Atualizar contrato
            </Button>
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
    </div>
  );
};
