import { useAuthStore } from "@/store/auth";
import { getQuestionImage } from "@/services/question/getQuestionImage";
import { useEffect, useState } from "react";

interface AssetImageProps {
  assetId: string;
  alt?: string;
  className?: string;
  /**
   * Estilo de dimensão já resolvido pelo `RichTextRenderer`. A regra de
   * tamanho mora lá, num lugar só, porque ela precisa bater com a do editor.
   */
  style?: React.CSSProperties;
  fetchAsset?: (key: string, token: string) => Promise<Blob>;
}

export function AssetImage({
  assetId,
  alt = "",
  className,
  style,
  fetchAsset = getQuestionImage,
}: AssetImageProps) {
  const [src, setSrc] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const {
    data: { token },
  } = useAuthStore();

  useEffect(() => {
    let objectUrl = "";

    fetchAsset(assetId, token)
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
  }, [assetId, token, fetchAsset]);

  if (loading) {
    return (
      <span className="inline-block w-32 h-20 bg-gray-200 animate-pulse rounded" />
    );
  }

  if (!src) {
    return <span className="text-red-500 text-sm">[Imagem indisponível]</span>;
  }

  return <img src={src} alt={alt} className={className} style={style} />;
}

export default AssetImage;
