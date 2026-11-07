import * as yup from "yup";

// Links do cursinho (site e redes): cada rede só aceita link do próprio domínio.
// Sem "https://" o link é completado, porque o mapa usa o valor direto no href.

const comProtocolo = (value?: string | null) => {
  const link = value?.trim();
  if (!link) return link;
  return /^https?:\/\//i.test(link) ? link : `https://${link}`;
};

const linkDe = (dominios: string[], mensagem: string) => {
  const hosts = dominios.map((d) => d.replace(/\./g, "\\.")).join("|");
  // Aceita subdomínio (www., m., br.) e exige o caminho do perfil depois do domínio.
  const formato = new RegExp(`^https?://([\\w-]+\\.)*(${hosts})/\\S+$`, "i");
  return yup
    .string()
    .nullable()
    .transform(comProtocolo)
    .test("link", mensagem, (value) => !value || formato.test(value));
};

export const socialLinksSchema = {
  site: yup
    .string()
    .nullable()
    .transform(comProtocolo)
    .test(
      "link",
      "Link inválido, ex.: https://seucursinho.org.br",
      (value) =>
        !value || /^https?:\/\/[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(value),
    ),
  instagram: linkDe(
    ["instagram.com"],
    "Cole o link do Instagram, ex.: https://instagram.com/seucursinho",
  ),
  facebook: linkDe(
    ["facebook.com", "fb.com"],
    "Cole o link do Facebook, ex.: https://facebook.com/seucursinho",
  ),
  youtube: linkDe(
    ["youtube.com", "youtu.be"],
    "Cole o link do Youtube, ex.: https://youtube.com/@seucursinho",
  ),
  linkedin: linkDe(
    ["linkedin.com"],
    "Cole o link do Linkedin, ex.: https://linkedin.com/company/seucursinho",
  ),
  twitter: linkDe(
    ["twitter.com", "x.com"],
    "Cole o link do Twitter/X, ex.: https://x.com/seucursinho",
  ),
  tiktok: linkDe(
    ["tiktok.com"],
    "Cole o link do TikTok, ex.: https://tiktok.com/@seucursinho",
  ),
};
