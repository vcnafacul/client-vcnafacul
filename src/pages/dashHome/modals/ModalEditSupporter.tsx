import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Button from "@/components/molecules/button";
import ModalTemplate from "@/components/templates/modalTemplate";
import { useAuthStore } from "../../../store/auth";
import { HomeSupporter } from "../../../dtos/homeContent/homeSupporter";
import { createHomeSupporter } from "../../../services/home/createHomeSupporter";
import { updateHomeSupporter } from "../../../services/home/updateHomeSupporter";
import { uploadHomeSupporterLogo } from "../../../services/home/uploadHomeSupporterLogo";
import { homeContentFile } from "../../../services/urls";
import PhotoEditor from "@/components/atoms/photoEditor";
import { HOME_IMAGE_ASPECT, HOME_IMAGE_SIZE } from "../constants";

interface Props {
  isOpen: boolean;
  handleClose: () => void;
  supporter: HomeSupporter | null;
  onCreated: (supporter: HomeSupporter) => void;
  onUpdated: (supporter: HomeSupporter) => void;
}

function isValidUrl(value: string): boolean {
  try {
    // eslint-disable-next-line no-new
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export default function ModalEditSupporter({
  isOpen,
  handleClose,
  supporter,
  onCreated,
  onUpdated,
}: Props) {
  const {
    data: { token },
  } = useAuthStore();
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pendingCrop, setPendingCrop] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(supporter?.name ?? "");
      setLink(supporter?.link ?? "");
      setFile(null);
      setPendingCrop(null);
    }
  }, [isOpen, supporter]);

  const isCreateMode = supporter === null;

  const onSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedLink = link.trim();
    if (!trimmedName) {
      toast.error("Nome é obrigatório");
      return;
    }
    if (!trimmedLink) {
      toast.error("Link é obrigatório");
      return;
    }
    if (!isValidUrl(trimmedLink)) {
      toast.error("Link inválido. Use uma URL válida (ex: https://exemplo.com)");
      return;
    }
    setSaving(true);
    try {
      if (isCreateMode) {
        let created: HomeSupporter;
        try {
          created = await createHomeSupporter(
            { name: trimmedName, link: trimmedLink },
            token,
          );
        } catch (err) {
          toast.error((err as Error).message);
          setSaving(false);
          return;
        }
        if (file) {
          try {
            const withLogo = await uploadHomeSupporterLogo(
              created.id,
              file,
              token,
            );
            onCreated(withLogo);
            toast.success("Apoiador criado");
          } catch (err) {
            toast.error(
              `Apoiador criado, mas falha no upload do logo: ${
                (err as Error).message
              }`,
            );
            onCreated(created);
          }
        } else {
          onCreated(created);
          toast.success("Apoiador criado");
        }
        handleClose();
      } else {
        let current: HomeSupporter = supporter;
        const payload: { name?: string; link?: string } = {};
        if (trimmedName !== supporter.name) payload.name = trimmedName;
        if (trimmedLink !== supporter.link) payload.link = trimmedLink;
        if (Object.keys(payload).length > 0) {
          current = await updateHomeSupporter(supporter.id, payload, token);
        }
        if (file) {
          current = await uploadHomeSupporterLogo(supporter.id, file, token);
        }
        onUpdated(current);
        toast.success("Apoiador atualizado");
        handleClose();
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="bg-white p-6 rounded-md w-[90vw] max-w-[500px]"
    >
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">
          {isCreateMode ? "Adicionar apoiador" : "Editar apoiador"}
        </h3>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Nome</span>
          <input
            className="border rounded px-2 py-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do apoiador"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Link</span>
          <input
            className="border rounded px-2 py-1"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://exemplo.com"
          />
        </label>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold">
            Logo {isCreateMode ? "(opcional)" : "(opcional — substitui atual)"}
          </span>
          {!isCreateMode && supporter?.logoUrl && !file && (
            <img
              src={homeContentFile(supporter.logoUrl)}
              alt={supporter.name}
              className="w-24 h-24 object-contain rounded bg-white"
            />
          )}
          {file && (
            <span className="text-xs text-green-700">
              Logo recortado pronto para upload.
            </span>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const picked = e.target.files?.[0];
              if (picked) {
                setPendingCrop(picked);
                e.target.value = "";
              }
            }}
          />
          <span className="text-xs text-gray-500">
            Proporção: 1:1 (quadrado). Salvo como PNG — fundo transparente é preservado.
          </span>
        </div>
        {pendingCrop && (
          <PhotoEditor
            isOpen
            photo={pendingCrop}
            aspect={HOME_IMAGE_ASPECT.supporter}
            targetSize={HOME_IMAGE_SIZE.supporter}
            outputFormat="image/png"
            handleClose={() => setPendingCrop(null)}
            onConfirm={(cropped) => {
              setFile(cropped);
              setPendingCrop(null);
            }}
          />
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            size="small"
            className="w-32"
            onClick={handleClose}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            typeStyle="primary"
            size="small"
            className="w-32"
            onClick={onSubmit}
            disabled={saving}
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </ModalTemplate>
  );
}
