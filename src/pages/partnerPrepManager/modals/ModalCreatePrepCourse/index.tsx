import ModalTemplate, {
  ModalProps,
} from "@/components/templates/modalTemplate";
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
import { createPrepCourse } from "@/services/prepCourse/prepCourse/createPrepCourse";
import {
  getGeoByName,
  SearchGeo,
} from "@/services/prepCourse/prepCourse/getGeoByName";
import {
  getUserByName,
  SearchUser,
} from "@/services/prepCourse/prepCourse/getUserByName";
import { useAuthStore } from "@/store/auth";
import { CreatePrepCoursePage } from "@/types/partnerPrepCourse/manager/createPrepCouse";
import { PartnerPrepCourse } from "@/types/partnerPrepCourse/partnerPrepCourse";
import { Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

export interface ModalCreateProps extends ModalProps {
  isOpen: boolean;
  onSuccess: (prep: PartnerPrepCourse) => void;
}

export const ModalCreatePrepCourse = ({
  isOpen,
  handleClose,
  onSuccess,
}: ModalCreateProps) => {
  const {
    data: { token },
  } = useAuthStore();

  const [formData, setFormData] = useState<CreatePrepCoursePage>({
    geoId: "",
    prepCourseName: "",
    representativeId: "",
    coordinator: "",
  });

  // Estados para busca de usuário (coordenador)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);

  // Estados para busca de geolocalização
  const [geoSearchTimeout, setGeoSearchTimeout] =
    useState<NodeJS.Timeout | null>(null);
  const [geoSearchResults, setGeoSearchResults] = useState<SearchGeo[]>([]);
  const [showGeoDropdown, setShowGeoDropdown] = useState<boolean>(false);
  const [isGeoSearching, setIsGeoSearching] = useState<boolean>(false);
  const [selectedGeo, setSelectedGeo] = useState<SearchGeo | null>(null);
  const [geoName, setGeoName] = useState<string>("");
  const [showForceCreateModal, setShowForceCreateModal] =
    useState<boolean>(false);
  const [pendingData, setPendingData] = useState<{
    geoId: string;
    representative: string;
  } | null>(null);

  const updateField = (fieldName: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

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

  const selectUser = (user: SearchUser) => {
    setSelectedUser(user);
    updateField("coordinator", user.name);
    updateField("representativeId", user.id);
    setShowDropdown(false);
    setSearchResults([]);
  };

  // Função para buscar geolocalizações
  const searchGeos = async (name: string) => {
    if (name.length < 2) {
      setGeoSearchResults([]);
      setShowGeoDropdown(false);
      return;
    }

    setIsGeoSearching(true);
    try {
      const results = await getGeoByName(token, name);
      setGeoSearchResults(results);
      setShowGeoDropdown(true);
    } catch (error) {
      console.error("Erro ao buscar geolocalizações:", error);
      setGeoSearchResults([]);
      setShowGeoDropdown(false);
    } finally {
      setIsGeoSearching(false);
    }
  };

  // Função para lidar com mudança no input de geolocalização
  const handleGeoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGeoName(value);

    // Limpar timeout anterior
    if (geoSearchTimeout) {
      clearTimeout(geoSearchTimeout);
    }

    // Definir novo timeout para busca
    const timeout = setTimeout(() => {
      searchGeos(value);
    }, 500);

    setGeoSearchTimeout(timeout);
  };

  // Função para selecionar geolocalização
  const selectGeo = (geo: SearchGeo) => {
    setSelectedGeo(geo);
    setGeoName(geo.name);
    updateField("geoId", geo.id);
    setShowGeoDropdown(false);
    setGeoSearchResults([]);
  };

  const coordinatorInputRef = useRef<HTMLInputElement>(null);
  const geoInputRef = useRef<HTMLInputElement>(null);

  const handleCreatePrepCourse = () => {
    const id = toast.loading("Criando curso de preparação...");

    // Validação dos campos obrigatórios
    if (!selectedGeo) {
      toast.update(id, {
        render: "Por favor, selecione uma geolocalização da lista.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      return;
    }

    if (!selectedUser) {
      toast.update(id, {
        render: "Por favor, selecione um coordenador da lista.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      return;
    }

    createPrepCourse(token, {
      geoId: selectedGeo.id,
      representative: selectedUser.id,
    })
      .then((prep) => {
        toast.update(id, {
          render: "Curso de preparação criado com sucesso!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        onSuccess?.(prep);
      })
      .catch((error) => {
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
          // Armazenar os dados pendentes e mostrar modal de confirmação
          setPendingData({
            geoId: selectedGeo.id,
            representative: selectedUser.id,
          });
          setShowForceCreateModal(true);
        } else {
          toast.update(id, {
            render: "Erro ao criar curso de preparação. Tente novamente.",
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        }
      });
  };

  // Função para forçar criação do curso de preparação
  const handleForceCreate = () => {
    if (!pendingData) {
      return;
    }

    const id = toast.loading("Forçando criação do curso de preparação...");

    createPrepCourse(token, pendingData, true)
      .then((prep) => {
        console.log(prep);
        toast.update(id, {
          render: "Curso de preparação criado com sucesso!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });

        onSuccess?.(prep);

        // Fechar modal e limpar dados pendentes
        setShowForceCreateModal(false);
        setPendingData(null);
      })
      .catch((error) => {
        toast.update(id, {
          render: `Erro ao forçar criação do curso de preparação. ${error.message}`,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
  };

  // Cleanup dos timeouts
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      if (geoSearchTimeout) {
        clearTimeout(geoSearchTimeout);
      }
    };
  }, [searchTimeout, geoSearchTimeout]);

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose!}
      className="space-y-6 bg-white p-4 rounded-md w-[90vw] h-[90vh]  sm:w-[800px] sm:h-fit"
    >
      <Typography variant="h4" className="font-bold text-marine">
        Cadastro de Cursinho
      </Typography>
      {/* Campos de formulário em duas colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Coluna esquerda */}
        <div className="space-y-4">
          {/* Campo Geolocalização com busca */}
          <div className="relative">
            <label
              className="absolute p-0 top-1.5 left-2 text-xs text-grey font-semibold"
              htmlFor="geo"
            >
              Geolocalização
            </label>
            <input
              ref={geoInputRef}
              id="geo"
              type="text"
              autoComplete="off"
              value={geoName}
              onChange={handleGeoChange}
              className="h-16 pt-4 w-full px-3 py-1 text-sm border border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:ring-1 focus:ring-orange disabled:opacity-50"
              placeholder="Digite o nome da geolocalização..."
            />

            {/* Dropdown de resultados */}
            {showGeoDropdown && geoSearchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {geoSearchResults.map((geo) => (
                  <div
                    key={geo.id}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => selectGeo(geo)}
                  >
                    <div className="font-medium text-sm text-gray-900">
                      {geo.name}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Loading indicator */}
            {isGeoSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-orange rounded-full animate-spin"></div>
              </div>
            )}
          </div>
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
              autoComplete="off"
              value={formData.coordinator}
              onChange={handleCoordinatorChange}
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
        </div>
      </div>

      {/* Botão de atualizar */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={handleCreatePrepCourse}
          className="bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200 px-8"
        >
          Confirmar Cadastro
        </Button>
      </div>

      {/* Modal de confirmação para forçar criação */}
      <AlertDialog
        open={showForceCreateModal}
        onOpenChange={setShowForceCreateModal}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-marine">
              Representante já é colaborador
            </AlertDialogTitle>
            <AlertDialogDescription>
              Este usuário já está cadastrado como colaborador. Deseja forçar a
              criação do curso de preparação com este representante?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border border-orange text-orange hover:bg-orange hover:border-orange/20 hover:text-white"
              onClick={() => {
                setShowForceCreateModal(false);
                setPendingData(null);
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-orange text-white hover:bg-orange/80"
              onClick={handleForceCreate}
            >
              Forçar Criação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ModalTemplate>
  );
};
