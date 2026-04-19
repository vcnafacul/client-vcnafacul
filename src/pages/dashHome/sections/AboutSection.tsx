import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { RichTextEditor } from "@/components/molecules/richTextEditor/RichTextEditor";
import Button from "@/components/molecules/button";
import { useAuthStore } from "../../../store/auth";
import { getHomeAbout } from "../../../services/home/getHomeAbout";
import { updateHomeAbout } from "../../../services/home/updateHomeAbout";
import { uploadHomeAboutThumbnail } from "../../../services/home/uploadHomeAboutThumbnail";
import { homeContentFile } from "../../../services/urls";
import PhotoEditor from "@/components/atoms/photoEditor";
import { HOME_IMAGE_ASPECT, HOME_IMAGE_SIZE } from "../constants";

export default function AboutSection() {
  const {
    data: { token },
  } = useAuthStore();
  const [videoUrl, setVideoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [pendingCrop, setPendingCrop] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getHomeAbout()
      .then((about) => {
        if (about) {
          setVideoUrl(about.videoUrl ?? "");
          setDescription(about.description ?? "");
          setThumbnailUrl(about.thumbnailUrl);
        }
      })
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const onSave = async () => {
    setSaving(true);
    try {
      const updated = await updateHomeAbout({ videoUrl, description }, token);
      setThumbnailUrl(updated.thumbnailUrl);
      toast.success("Quem Somos atualizado");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const uploadCropped = async (file: File) => {
    try {
      const updated = await uploadHomeAboutThumbnail(file, token);
      setThumbnailUrl(updated.thumbnailUrl);
      toast.success("Thumbnail atualizada");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  if (loading) return <div className="p-4">Carregando...</div>;

  return (
    <section className="flex flex-col gap-4 p-4 border rounded-lg bg-white">
      <h2 className="text-xl font-semibold">Quem Somos</h2>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-semibold">ID do vídeo YouTube</span>
        <input
          className="border rounded px-2 py-1"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="Ex.: LiNm9JxvNOM"
        />
      </label>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold">Thumbnail</span>
        {thumbnailUrl ? (
          <img
            src={homeContentFile(thumbnailUrl)}
            alt="thumbnail atual"
            className="max-w-xs rounded"
          />
        ) : (
          <span className="text-sm text-gray-500">Sem thumbnail</span>
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
          Proporção: 4:3 (a imagem será recortada e redimensionada para caber no
          tablet).
        </span>
      </div>
      {pendingCrop && (
        <PhotoEditor
          isOpen
          photo={pendingCrop}
          aspect={HOME_IMAGE_ASPECT.aboutThumbnail}
          targetSize={HOME_IMAGE_SIZE.aboutThumbnail}
          handleClose={() => setPendingCrop(null)}
          onConfirm={async (cropped) => {
            setPendingCrop(null);
            await uploadCropped(cropped);
          }}
        />
      )}
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold">Descrição (markdown)</span>
        <RichTextEditor
          content={description}
          onChange={setDescription}
          minHeight="200px"
        />
      </div>
      <div>
        <Button
          typeStyle="primary"
          size="small"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </section>
  );
}
