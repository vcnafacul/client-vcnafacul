import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader, PageShell } from "@/components/ui/page-header";
import { useEffect, useState } from "react";
import { toast } from "@/lib/toast";
import { ExternalLink } from "lucide-react";
import { Switch } from "@/components/ui/switch";
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

  if (erro)
    return <div className="p-6 text-center text-destructive">{erro}</div>;
  if (!salva) return <div className="p-6 text-center">Carregando...</div>;

  return (
    <PageShell className="max-w-4xl">
      <form onSubmit={salvar} className="space-y-6">
        <PageHeader
          title="Página do cursinho"
          subtitle={salva.nomeDoCursinho}
          actions={
            salva.active ? (
              <a
                href={enderecoPublico(salva.slug)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-body text-foreground hover:underline"
              >
                Ver página pública <ExternalLink size="1em" />
              </a>
            ) : undefined
          }
        />

        <Card className="space-y-6 p-4 sm:p-6">
          <div className="flex items-center gap-3 border rounded-lg p-4">
            <Switch
              aria-label="Página pública"
              aria-describedby="pagina-ativa-rotulo"
              checked={active}
              onCheckedChange={setActive}
            />
            <div>
              <p id="pagina-ativa-rotulo" className="font-semibold text-body">
                Página {active ? "ativa" : "desativada"}
              </p>
              <p className="text-caption text-muted-foreground">
                Desativada, ninguém consegue abrir o endereço. Para ativar, o
                Quem somos é obrigatório.
              </p>
            </div>
          </div>

          <div>
            <label
              htmlFor="slug"
              className="block text-body font-semibold mb-1"
            >
              Endereço da página
            </label>
            <div className="flex items-center border rounded-lg overflow-hidden bg-white">
              <span className="px-2 text-body text-muted-foreground bg-page border-r py-2 whitespace-nowrap">
                …/{PARTNER_PREP}
              </span>
              <input
                id="slug"
                value={slug}
                onChange={(e) =>
                  setSlug(normalizarEnquantoDigita(e.target.value))
                }
                className="flex-1 min-w-0 p-2 outline-none"
              />
            </div>
            <p className="text-caption text-muted-foreground mt-1">
              Se você trocar o endereço, o link antigo deixa de funcionar.
            </p>
          </div>

          <div>
            <span className="block text-body font-semibold mb-1">
              Quem somos <span className="text-destructive">*</span>
            </span>
            {/* Sem `onImageUpload`: o editor não mostra o botão de imagem (R4). */}
            <RichTextEditor
              content={quemSomos}
              onChange={setQuemSomos}
              placeholder="Conte quem é o cursinho, sua história e como funciona."
              minHeight="200px"
              error={avisoAtivar}
            />
            {avisoAtivar && (
              <p role="alert" className="text-caption text-destructive mt-1">
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
            <Button type="submit" variant="primary" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </Card>
      </form>
    </PageShell>
  );
}
