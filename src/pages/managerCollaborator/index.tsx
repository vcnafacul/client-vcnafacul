import Button from "@/components/molecules/button";
import { useModals } from "@/hooks/useModal";
import { useToastAsync } from "@/hooks/useToastAsync";
import { changeActive } from "@/services/prepCourse/collaborator/change-active";
import { changeDescription } from "@/services/prepCourse/collaborator/change-description";
import { getCollaborator } from "@/services/prepCourse/collaborator/get-collaborator";
import { getPhotoCollaborator } from "@/services/prepCourse/collaborator/get-photo";
import { getRoles } from "@/services/prepCourse/getRoles";
import { updateUserRole } from "@/services/roles/updateUserRole";
import { useAuthStore } from "@/store/auth";
import { Role } from "@/types/roles/role";
import { phoneMask } from "@/utils/phoneMask";
import { IconButton } from "@mui/material";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { IoEyeSharp } from "react-icons/io5";
import { toast } from "react-toastify";
import ModalEditRole from "./modals/ModalEditRole";
import ModalNewRole from "./modals/ModalNewRole";
import ModalUpdateRoleUser from "./modals/ModalUpdateRoleUser";
import { ShowInfo } from "./modals/showInfo";
import { TempInviteMember } from "./modals/temp-invite-member";

export interface CollaboratorColumns {
  id: string;
  photo: string;
  description: string;
  actived: boolean;
  lastAccess: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: {
    id: string;
    name: string;
  };
}

export default function ManagerCollaborator() {
  const [collaborator, setCollaborator] = useState<CollaboratorColumns[]>([]);
  const [collaboratorSelected, setCollaboratorSelected] =
    useState<CollaboratorColumns | null>(null);
  const [limit, setLimit] = useState<number>(100);
  const [totalItems, setTotalItems] = useState<number>(100);
  const [roles, setRoles] = useState<Role[]>([]);
  const [collaboratorPhotos, setCollaboratorPhotos] = useState<
    Record<string, string>
  >({});

  const modals = useModals([
    "modalInviteMember",
    "modalShowInfo",
    "modalShowNewRole",
    "modalShowEditRole",
    "modalUserRole",
  ]);

  const {
    data: { token },
  } = useAuthStore();

  const executeAsync = useToastAsync();
  const VITE_FTP_PROFILE = import.meta.env.VITE_FTP_PROFILE;

  const loadCollaboratorPhoto = async (photoKey: string) => {
    try {
      const blob = await getPhotoCollaborator(photoKey);
      const url = URL.createObjectURL(blob);
      return url;
    } catch (error) {
      console.error(`Erro ao carregar foto do colaborador:`, error);
      // Fallback para a URL do FTP caso falhe
      return `${VITE_FTP_PROFILE}${photoKey}`;
    }
  };

  const columns: GridColDef[] = [
    {
      field: "actions",
      headerName: "Ações",
      width: 170,
      disableColumnMenu: true,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <div className="flex gap-2 justify-center">
          <Tooltip title="Visualizar">
            <IconButton onClick={() => onClickCard(params.row.id)}>
              <IoEyeSharp className="h-6 w-6 fill-gray-500 opacity-60 hover:opacity-100" />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
    {
      field: "name",
      headerName: "Nome",
      width: 150,
      minWidth: 150,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "email",
      headerName: "Email",
      width: 250,
      minWidth: 250,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "role",
      headerName: "Função",
      width: 150,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => params.row.role.name,
    },
    {
      field: "phone",
      headerName: "Telefone",
      width: 250,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => phoneMask(params.row.phone),
    },
    {
      field: "actived",
      headerName: "Status",
      width: 150,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (params.row.actived ? "Ativo" : "Inativo"),
    },
    {
      field: "createdAt",
      headerName: "Criado em",
      width: 250,
      align: "center",
      headerAlign: "center",
      renderCell: (params) =>
        new Date(params.row.createdAt).toLocaleDateString("pt-BR"),
    },
  ];

  const onClickCard = (userId: string) => {
    const coll = collaborator.find((c) => c.id === userId);
    if (!coll) {
      toast.error("Erro ao tentar visualizar o colaborador");
      return;
    }
    setCollaboratorSelected(coll);
    modals.modalShowInfo.open();
  };

  const handleUpdateUserRole = async (roleId: string) => {
    await executeAsync({
      action: () => updateUserRole(collaboratorSelected!.userId, roleId, token),
      loadingMessage: "Atualizando permissão...",
      successMessage: "Permissão atualizada com sucesso!",
      errorMessage: (error: Error) => error.message,
      onSuccess: () => {
        setCollaboratorSelected({
          ...collaboratorSelected!,
          role: {
            id: roleId,
            name: roles.find((r) => r.id === roleId)?.name || "",
          },
        });
        const updateCollaborator = collaborator.map((c) => {
          if (c.id === collaboratorSelected?.id) {
            return {
              ...c,
              role: {
                id: roleId,
                name: roles.find((r) => r.id === roleId)?.name || "",
              },
            };
          }
          return c;
        });
        setCollaborator(updateCollaborator);
        modals.modalUserRole.close();
      },
    });
  };

  const handleNewRole = (role: Role) => {
    setRoles([...roles, role]);
  };

  const ModalInviteMember = () => {
    return modals.modalInviteMember.isOpen ? (
      <TempInviteMember
        isOpen={modals.modalInviteMember.isOpen}
        handleClose={() => modals.modalInviteMember.close()}
      />
    ) : null;
  };

  const ModalShowInfo = () => {
    return modals.modalShowInfo.isOpen ? (
      <ShowInfo
        isOpen={modals.modalShowInfo.isOpen}
        handleClose={() => modals.modalShowInfo.close()}
        collaborator={collaboratorSelected!}
        photoUrl={
          collaboratorSelected?.photo
            ? collaboratorPhotos[collaboratorSelected.photo]
            : undefined
        }
        handleActive={handleChangeActive}
        handleDescription={handleDescription}
        openUpdateRole={() => {
          if (roles.length === 0) {
            toast.error("Não há funções cadastradas");
            return;
          }
          modals.modalUserRole.open();
        }}
      />
    ) : null;
  };

  const ShowUserRole = () => {
    if (!modals.modalUserRole.isOpen) return null;
    return !modals.modalUserRole.isOpen ? null : (
      <ModalUpdateRoleUser
        roles={roles}
        updateUserRole={handleUpdateUserRole}
        role={collaboratorSelected?.role as Role}
        isOpen={modals.modalUserRole.isOpen}
        handleClose={() => modals.modalUserRole.close()}
      />
    );
  };

  const ModalShowNewRole = () => {
    return modals.modalShowNewRole.isOpen ? (
      <ModalNewRole
        isOpen={modals.modalShowNewRole.isOpen}
        handleClose={() => modals.modalShowNewRole.close()}
        handleNewRole={handleNewRole}
      />
    ) : null;
  };

  const ModalShowEditRole = () => {
    return modals.modalShowEditRole.isOpen ? (
      <ModalEditRole
        isOpen={modals.modalShowEditRole.isOpen}
        handleClose={() => modals.modalShowEditRole.close()}
      />
    ) : null;
  };

  const handleChangeActive = async (id: string) => {
    changeActive(token, id).then(() => {
      const collaboratorAux = collaborator.map((c) => {
        if (c.id === id) {
          setCollaboratorSelected({ ...c, actived: !c.actived });
          return { ...c, actived: !c.actived };
        }
        return c;
      });
      setCollaborator(collaboratorAux);
    });
  };

  const handleDescription = async (id: string, description: string) => {
    const _id = toast.loading("Alterando informação de colaborador...");
    changeDescription(token, id, description)
      .then(() => {
        const collaboratorAux = collaborator.map((c) => {
          if (c.id === id) {
            setCollaboratorSelected({ ...c, description });
            return { ...c, description };
          }
          return c;
        });
        setCollaborator(collaboratorAux);
        toast.update(_id, {
          render: "Informação alterada com sucesso!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      })
      .catch((error: Error) => {
        toast.update(_id, {
          render: error.message,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
  };

  useEffect(() => {
    getCollaborator(token, 1, limit)
      .then((c) => {
        setCollaborator(
          c.data.map((col) => ({
            id: col.id,
            photo: col.photo,
            description: col.description,
            actived: col.actived,
            lastAccess: col.user.lastAccess,
            createdAt: col.createdAt,
            updatedAt: col.updatedAt,
            userId: col.user.id,
            name: col.user.name,
            email: col.user.email,
            phone: col.user.phone,
            role: {
              id: col.user.role.id,
              name: col.user.role.name,
            },
          }))
        );
        setTotalItems(c.totalItems);
      })
      .catch((error) => toast.error(error.message));
  }, [token]);

  useEffect(() => {
    getRoles(token)
      .then((res) => {
        setRoles(res);
      })
      .catch((error: Error) => {
        toast.error(error.message);
        setRoles([]);
      });
  }, []);

  useEffect(() => {
    const loadPhotos = async () => {
      const photoUrls: Record<string, string> = {};

      for (const col of collaborator) {
        if (col.photo) {
          const url = await loadCollaboratorPhoto(col.photo);
          photoUrls[col.photo] = url;
        }
      }

      setCollaboratorPhotos(photoUrls);
    };

    if (collaborator.length > 0) {
      loadPhotos();
    }

    // Cleanup das URLs criadas
    return () => {
      Object.values(collaboratorPhotos).forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [collaborator]);

  const paginationModel = { page: 0, pageSize: limit };

  return (
    <div className="flex flex-col gap-4 w-full justify-center">
      <div className="w-full px-4">
        <h1 className="text-3xl font-bold text-center text-marine">
          Colaboradores
        </h1>
      </div>
      <div className="flex justify-end">
        <Button
          onClick={() => modals.modalInviteMember.open()}
          size="small"
          typeStyle="quaternary"
          className="w-fit mx-4"
        >
          Convidar Colaborador
        </Button>
        <Button
          onClick={() => modals.modalShowNewRole.open()}
          size="small"
          typeStyle="quaternary"
          className="w-fit mx-4"
        >
          Nova Função
        </Button>
        <Button
          onClick={() => modals.modalShowEditRole.open()}
          size="small"
          typeStyle="primary"
          className="w-fit mx-4"
        >
          Editar Função
        </Button>
      </div>
      <Paper sx={{ height: "100%", width: "100%" }}>
        <DataGrid
          rows={collaborator}
          columns={columns}
          rowCount={totalItems}
          paginationMode="server"
          initialState={{ pagination: { paginationModel } }}
          rowHeight={40}
          pageSizeOptions={[5, 10, 15, 30, 50, 100]}
          onPaginationModelChange={(newPageSize) => {
            setLimit(newPageSize.pageSize);
            getCollaborator(token, newPageSize.page + 1, newPageSize.pageSize);
          }}
          sx={{ border: 0 }}
        />
      </Paper>
      <ModalInviteMember />
      <ModalShowInfo />
      <ModalShowNewRole />
      <ShowUserRole />
      <ModalShowEditRole />
    </div>
  );
}
