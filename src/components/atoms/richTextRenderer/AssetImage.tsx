import { useAuthStore } from "@/store/auth";
import { getQuestionImage } from "@/services/question/getQuestionImage";
import { useEffect, useState } from "react";

interface AssetImageProps {
  assetId: string;
  alt?: string;
  className?: string;
}

export function AssetImage({ assetId, alt = "", className }: AssetImageProps) {
  const [src, setSrc] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const {
    data: { token },
  } = useAuthStore();

  useEffect(() => {
    let objectUrl = "";

    getQuestionImage(assetId, token)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => {
        setSrc("");
      })
      .finally(() => setLoading(false));

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [assetId, token]);

  if (loading) {
    return (
      <span className="inline-block w-32 h-20 bg-gray-200 animate-pulse rounded" />
    );
  }

  if (!src) {
    return <span className="text-red-500 text-sm">[Imagem indisponível]</span>;
  }

  return <img src={src} alt={alt} className={className} />;
}

export default AssetImage;
