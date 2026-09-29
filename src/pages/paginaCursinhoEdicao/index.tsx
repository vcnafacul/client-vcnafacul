import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiExternalLink } from "react-icons/fi";
import Toggle from "@/components/atoms/toggle";
import { RichTextEditor } from "@/components/molecules/richTextEditor/RichTextEditor";
import { PARTNER_PREP } from "@/routes/path";
import {
  getMinhaPagina,
  LinkDaPagina,
  PaginaDoCursinho,
  salvarMinhaPagina,
} from "@/services/paginaCursinho";
import { useAuthStore } from "@/store/auth";
import {
  normalizarEnquantoDigita,
  normalizarSlug,
  quemSomosVazio,
  slugValido,
} from "@/utils/regrasDaPagina";
import { ListaDeLinks } from "./ListaDeLinks";

const enderecoPublico = (slug: string) =>
  `${window.location.origin}/${PARTNER_PREP}${slug}`;

/** Edição da página pública do cursinho (tickets/025, card 06). */
export default function PaginaCursinhoEdicao() {
  const {
    data: { token },
  } = useAuthStore();
  const [salva, setSalva] = useState<PaginaDoCursinho | null>(null);
  const [slug, setSlug] = useState("");
  const [quemSomos, setQuemSomos] = useState("");
  const [active, setActive] = useState(false);
  const [linksPublicos, setLinksPublicos] = useState<LinkDaPagina[]>([]);
  const [linksInternos, setLinksInternos] = useState<LinkDaPagina[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const aplicar = (p: PaginaDoCursinho) => {
    setSalva(p);
    setSlug(p.slug);
    setQuemSomos(p.quemSomos ?? "");
    setActive(p.active);
    setLinksPublicos(p.linksPublicos);
    setLinksInternos(p.linksInternos);
  };

  useEffect(() => {
    getMinhaPagina(token)
      .then(aplicar)
      .catch((e: Error) => setErro(e.message));
  }, [token]);

  const avisoAtivar = active && quemSomosVazio(quemSomos);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    const slugFinal = normalizarSlug(slug);
    if (!slugValido(slugFinal)) {
      toast.error(
        "Endereço inválido: use de 3 a 60 letras minúsculas, números e hífen.",
      );
      return;
    }
    if (avisoAtivar) {
      toast.error("Para ativar a página, preencha o Quem somos.");
      return;
    }
    setSalvando(true);
    try {
      const r = await salvarMinhaPagina(token, {
        slug: slugFinal,
        quemSomos: quemSomos.trim() ? quemSomos : null,
        active,
        linksPublicos,
        linksInternos,
      });
      aplicar(r);
      toast.success("Página salva");
    } catch (err) {
      // Mantém o que foi digitado: só avisa.
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  };

  if (erro) return <div className="p-6 text-center text-red-600">{erro}</div>;
  if (!salva) return <div className="p-6 text-center">Carregando...</div>;

  return (
    <form onSubmit={salvar} className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-marine">Página do cursinho</h1>
          <p className="text-sm text-grey">{salva.nomeDoCursinho}</p>
        </div>
        {salva.active && (
          <a
            href={enderecoPublico(salva.slug)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-sm text-marine hover:underline"
          >
            Ver página pública <FiExternalLink />
          </a>
        )}
      </div>

      <div className="flex items-center gap-3 bg-white border rounded-lg p-4">
        <Toggle
          name="active"
          checked={active}
          handleCheck={(_nome, marcado) => setActive(marcado)}
        />
        <div>
          <p className="font-semibold text-sm">
            Página {active ? "ativa" : "desativada"}
          </p>
          <p className="text-xs text-grey">
            Desativada, ninguém consegue abrir o endereço. Para ativar, o Quem somos é
            obrigatório.
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-semibold mb-1">
          Endereço da página
        </label>
        <div className="flex items-center border rounded-lg overflow-hidden bg-white">
          <span className="px-2 text-sm text-grey bg-gray-50 border-r py-2 whitespace-nowrap">
            …/{PARTNER_PREP}
          </span>
          <input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(normalizarEnquantoDigita(e.target.value))}
            className="flex-1 min-w-0 p-2 outline-none"
          />
        </div>
        <p className="text-xs text-grey mt-1">
          Se você trocar o endereço, o link antigo deixa de funcionar.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">
          Quem somos <span className="text-red-600">*</span>
        </label>
        {/* Sem `onImageUpload`: o editor não mostra o botão de imagem (R4). */}
        <RichTextEditor
          content={quemSomos}
          onChange={setQuemSomos}
          placeholder="Conte quem é o cursinho, sua história e como funciona."
          minHeight="200px"
          error={avisoAtivar}
        />
        {avisoAtivar && (
          <p role="alert" className="text-xs text-red-600 mt-1">
            Para ativar a página, preencha o Quem somos.
          </p>
        )}
      </div>

      <ListaDeLinks
        titulo="Links úteis"
        ajuda="Visíveis para qualquer pessoa que acessar a página do cursinho."
        links={linksPublicos}
        onChange={setLinksPublicos}
      />

      <ListaDeLinks
        titulo="Links úteis internos"
        ajuda="Não são públicos: só colaboradores e alunos matriculados deste cursinho, logados, conseguem ver."
        links={linksInternos}
        onChange={setLinksInternos}
      />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={salvando}
          className="px-6 py-2 bg-marine text-white rounded-lg hover:bg-marine/90 disabled:opacity-60"
        >
          {salvando ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
