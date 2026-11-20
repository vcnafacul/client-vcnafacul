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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModals } from "@/hooks/useModal";
import { useToastAsync } from "@/hooks/useToastAsync";
import { getUserByName, SearchUser } from "@/services/auth/getUserByName";
import { getGeoByName, SearchGeo } from "@/services/geolocation/getGeoByName";
import { createPrepCourse } from "@/services/prepCourse/prepCourse/createPrepCourse";
import { useAuthStore } from "@/store/auth";
import { CreatePrepCoursePage } from "@/types/partnerPrepCourse/manager/createPrepCouse";
import { PartnerPrepCourse } from "@/types/partnerPrepCourse/partnerPrepCourse";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

export interface ModalCreateProps {
  handleClose?: () => void;
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

  const executeAsync = useToastAsync();

  const [formData, setFormData] = useState<CreatePrepCoursePage>({
    geoId: "",
    prepCourseName: "",
    representativeId: "",
    coordinator: "",
  });

  // Estados para busca de usuário (coordenador)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null,
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
  const [pendingData, setPendingData] = useState<{
    geoId: string;
    representative: string;
  } | null>(null);

  const modals = useModals(["modalForceCreate"]);

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

  const handleCreatePrepCourse = async () => {
    const id = toast.loading("Criando cursinho parceiro...");

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

    await executeAsync({
      action: () =>
        createPrepCourse(token, {
          geoId: selectedGeo.id,
          representative: selectedUser.id,
        }),
      loadingMessage: "Criando cursinho parceiro...",
      successMessage: "Cursinho parceiro criado com sucesso!",
      errorMessage: "Erro ao criar cursinho parceiro",
      onSuccess: (prep) => {
        onSuccess?.(prep);
      },
      onError: (error) => {
        if (
          error.message &&
          error.message.includes("Representante já cadastrado")
        ) {
          setPendingData({
            geoId: selectedGeo.id,
            representative: selectedUser.id,
          });
          modals.modalForceCreate.open();
          return "Representante já é colaborador";
        }
        return "Erro ao criar cursinho parceiro";
      },
    });
  };

  // Função para forçar criação do curso de preparação
  const handleForceCreate = async () => {
    if (!pendingData) {
      return;
    }

    await executeAsync({
      action: () => createPrepCourse(token, pendingData, true),
      loadingMessage: "Forçando criação do cursinho parceiro...",
      successMessage: "Cursinho parceiro criado com sucesso!",
      errorMessage: "Erro ao forçar criação do cursinho parceiro",
      onSuccess: (prep) => {
        onSuccess?.(prep);
        // Fechar modal e limpar dados pendentes
        modals.modalForceCreate.close();
        setPendingData(null);
      },
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
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose?.()}>
      <DialogContent size="lg" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Cadastro de Cursinho</DialogTitle>
        </DialogHeader>
        {/* Campos de formulário em duas colunas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coluna esquerda */}
          <div className="space-y-4">
            {/* Campo Geolocalização com busca */}
            <div className="relative">
              <label
                className="absolute p-0 top-1.5 left-2 text-caption text-muted-foreground font-semibold"
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
                className="h-16 pt-4 w-full px-3 py-1 text-body border border-border rounded-md bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                placeholder="Digite o nome da geolocalização..."
              />

              {/* Dropdown de resultados */}
              {showGeoDropdown && geoSearchResults.length > 0 && (
                <div className="absolute z-raised w-full mt-1 bg-white border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {geoSearchResults.map((geo) => (
                    <button
                      type="button"
                      key={geo.id}
                      className="block w-full text-left px-3 py-2 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                      onClick={() => selectGeo(geo)}
                    >
                      <span className="block font-medium text-body text-foreground">
                        {geo.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Loading indicator */}
              {isGeoSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-border border-t-cta rounded-full animate-spin"></div>
                </div>
              )}
            </div>
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
                className="h-16 pt-4 w-full px-3 py-1 text-body border border-border rounded-md bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                placeholder="Digite o nome do coordenador..."
              />

              {/* Dropdown de resultados */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-raised w-full mt-1 bg-white border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((user) => (
                    <button
                      type="button"
                      key={user.id}
                      className="block w-full text-left px-3 py-2 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                      onClick={() => selectUser(user)}
                    >
                      <span className="block font-medium text-body text-foreground">
                        {user.name}
                      </span>
                      <span className="block text-caption text-muted-foreground">
                        {user.email} • {user.phone}
                      </span>
                    </button>
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
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleCreatePrepCourse}>Confirmar Cadastro</Button>
        </DialogFooter>

        {/* Modal de confirmação para forçar criação */}
        <AlertDialog
          open={modals.modalForceCreate.isOpen}
          onOpenChange={() => modals.modalForceCreate.close()}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">
                Representante já é colaborador
              </AlertDialogTitle>
              <AlertDialogDescription>
                Este usuário já está cadastrado como colaborador. Deseja forçar
                a criação do curso de preparação com este representante?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                className="border border-cta text-foreground hover:bg-cta hover:border-cta/20 hover:text-cta-foreground"
                onClick={() => {
                  modals.modalForceCreate.close();
                  setPendingData(null);
                }}
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-cta text-cta-foreground hover:bg-cta/80"
                onClick={handleForceCreate}
              >
                Forçar Criação
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
};
