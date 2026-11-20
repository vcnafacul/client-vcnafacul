/* eslint-disable @typescript-eslint/no-explicit-any */
import { GraduationCap, CloudUpload, FileText } from "lucide-react";
import { Button } from "@mui/material";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  FormFieldInput,
  FormFieldOption,
} from "../../../components/molecules/formField";
import UploadButton from "../../../components/molecules/uploadButton";
import Form from "../../../components/organisms/form";
import { ModalProps } from "@/types/modal";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateProva, Prova } from "../../../dtos/prova/prova";
import { ICategoria, isCompartilhada } from "../../../dtos/categoria/categoria";
import { Edicao, edicaoArray } from "../../../enums/prova/edicao";
import { textoDaCompartilhada } from "./textoDaCompartilhada";
import { categoriasDoExame, opcoesDeExame } from "./exameDaCategoria";
import { useToastAsync } from "../../../hooks/useToastAsync";
import { createProva } from "../../../services/prova/createProva";
import { useAuthStore } from "../../../store/auth";
import { useAcimaDeSm } from "@/components/dashV2/useAcimaDeSm";
import { useEffect, useState } from "react";
import { OpcaoNovasVersoes } from "../components/OpcaoNovasVersoes";
import { palette } from "@/lib/palette";

export const TEXTO_CARREGANDO_CATEGORIAS = "Carregando categorias…";
export const TEXTO_ERRO_CATEGORIAS =
  "Não foi possível carregar as categorias. Tente de novo.";

/** Card 40: aplicação é um campo próprio, independente da edição. */
const aplicacaoOptions: FormFieldOption[] = [1, 2, 3].map((n) => ({
  label: `${n}ª aplicação`,
  value: String(n),
}));

interface NewProvaProps extends ModalProps {
  addProva: (data: Prova) => void;
  /**
   * ⚠️ **`undefined` = ainda não chegou ou falhou** (card 40). O modal abria
   * com `categorias!` e o `forEach` estourava na renderização: tela em branco
   * se a busca falhasse, ou se a pessoa clicasse antes de ela responder.
   */
  categorias?: ICategoria[];
  /** A busca das categorias falhou — mostra o aviso com "Tentar de novo". */
  erroCategorias?: boolean;
  onTentarDeNovo?: () => void;
  isOpen: boolean;
  createService?: (data: FormData, token: string) => Promise<Prova>;
}

function NewProva({
  addProva,
  categorias,
  handleClose,
  isOpen,
  createService,
  erroCategorias = false,
  onTentarDeNovo,
}: NewProvaProps) {
  const { register, handleSubmit, watch, setValue } = useForm();
  const [receberNovasVersoes, setReceberNovasVersoes] = useState(false);
  // No celular (abaixo de 768px) os campos ficam compactos, como na tela de Estudantes.
  const acimaDeSm = useAcimaDeSm();
  const {
    data: { token },
  } = useAuthStore();
  const executeAsync = useToastAsync();
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadGabarito, setUploadGabarito] = useState(null);

  /*
    O exame vem primeiro, e a lista de categorias se adapta a ele. Os exames saem das
    categorias selecionáveis — só faz sentido escolher um exame que tenha categoria.
  */
  const selecionaveis = (categorias ?? []).filter((c) => c.selecionavel);
  const exame = watch("exame");
  const examesOptions = opcoesDeExame(selecionaveis);
  const categoriasOptions: FormFieldOption[] = [
    { label: "", value: "" },
    ...categoriasDoExame(selecionaveis, exame).map((c) => ({
      label: c.nome,
      value: c._id,
    })),
  ];

  // Trocar o exame limpa a categoria: a escolhida pode não ser do exame novo.
  useEffect(() => {
    setValue("categoria", "");
  }, [exame, setValue]);

  /*
    ⚠️ Card 40: só as edições. A aplicação ficava aqui dentro ("2ªAplicação")
    e sempre virava edição Regular — Digital ou PPL na 2ª aplicação eram
    impossíveis de cadastrar.
  */
  const edicaoOption: FormFieldOption[] = edicaoArray.map((f) => {
    if (f === Edicao.Reaplicacao) {
      return { label: f, value: "Replicacao" };
    }
    return { label: f, value: f };
  });

  const handleFileUpload = (e: any) => {
    setUploadFile(null);
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const handleGabaritoUpload = (e: any) => {
    setUploadGabarito(null);
    const file = e.target.files[0];
    if (file) {
      setUploadGabarito(file);
    }
  };

  const handleRemoveGabarito = () => {
    setUploadGabarito(null);
  };

  const handleRemoveFile = () => {
    setUploadFile(null);
  };

  const categoria = watch("categoria");
  const categoriaEscolhida = categorias?.find((c) => c._id === categoria);
  /*
    tickets/038: a "Enem Dia 1/2" do cursinho não é custom (a fábrica é a do
    ENEM), mas o cursinho digita o nome e o PDF é opcional, como na custom.
  */
  const compartilhada = isCompartilhada(categoriaEscolhida);
  const isCustom = categoriaEscolhida?.custom === true || compartilhada;

  const listFieldProva: FormFieldInput[] = [
    {
      id: "exame",
      type: "option",
      options: examesOptions,
      value: "",
      label: "Exame",
      disabled: false,
    },
    {
      id: "categoria",
      type: "option",
      options: categoriasOptions,
      value: "",
      label: "Categoria",
      // Sem exame não há lista: escolher a categoria antes do exame.
      disabled: !exame,
    },
    ...(isCustom
      ? ([
          {
            id: "nome",
            type: "text",
            label: "Nome da prova",
            disabled: false,
          },
        ] as FormFieldInput[])
      : []),
    {
      id: "edicao",
      type: "option",
      options: edicaoOption,
      label: "Edição",
      disabled: false,
    },
    {
      id: "aplicacao",
      type: "option",
      options: aplicacaoOptions,
      label: "Aplicação",
      disabled: false,
    },
    {
      id: "ano",
      type: "number",
      label: "Ano de Realização",
      // Card 40: era 2023 fixo, e o ano não se corrige depois.
      defaultValue: new Date().getFullYear(),
      disabled: false,
    },
  ];

  const create = async (data: any) => {
    if (!isCustom && !uploadFile) {
      toast.error("Prova PDF é obrigatória para provas ENEM oficiais");
      return;
    }
    if (isCustom && !data.nome) {
      toast.error("Nome da prova é obrigatório para provas personalizadas");
      return;
    }

    const info = data as CreateProva;
    info.aplicacao = Number(data.aplicacao) || 1;

    const fileName = Date.now();
    const formData = new FormData();
    formData.append("categoria", info.categoria);
    formData.append("edicao", info.edicao);
    formData.append("ano", info.ano.toString());
    formData.append("aplicacao", info.aplicacao.toString());
    // tickets/023, card 09 — desmarcado por padrão.
    formData.append("receberNovasVersoes", String(receberNovasVersoes));

    if (uploadFile) {
      formData.append("file", uploadFile, `${fileName}.pdf`);
    }

    if (uploadGabarito) {
      formData.append("gabarito", uploadGabarito!, `${fileName}_gabarito.pdf`);
    }

    if (isCustom) {
      formData.append("nome", data.nome);
      /*
        ⚠️ **O campo saiu da tela, não da requisição.** O
        `CustomProvaFactory.createSimulados` do ms lança
        `BadRequestException('Nome do simulado é obrigatório')` quando
        `nomeSimulado` vem vazio — parar de enviar daria 400.

        Prova custom gera exatamente 1 simulado, então pedir dois nomes era
        pedir a mesma informação duas vezes.

        ⚠️ O default mora aqui por decisão do time, e o custo é conhecido: a
        regra é do backend e está duplicada no cliente. Outro consumidor da api
        continua obrigado a mandar o campo. Se um dia isso incomodar, o conserto
        é uma linha no ms (`nomeSimulado ?? prova.nome`) e esta some.
      */
      formData.append("nomeSimulado", data.nome);
    }

    const title = isCustom
      ? data.nome
      : `${info.ano}_${info.edicao}_${info.aplicacao}`;

    await executeAsync({
      action: () => (createService ?? createProva)(formData, token),
      loadingMessage: "Criando Prova...",
      successMessage: `Prova ${title} criada com sucesso`,
      errorMessage: (error) => error.message,
      onSuccess: (res) => {
        addProva(res);
        handleClose!();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose?.()}>
      <DialogContent size="lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-info-muted rounded-lg">
              <FileText className="h-6 w-6 text-info" />
            </div>
            <div>
              <DialogTitle>Cadastro de Prova</DialogTitle>
              <DialogDescription>
                Preencha os dados da nova prova
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="-mx-1 px-1 pt-2">
          {!categorias && (
            <div className="flex flex-col items-start gap-2 py-4">
              <p className="text-body text-muted-foreground">
                {erroCategorias
                  ? TEXTO_ERRO_CATEGORIAS
                  : TEXTO_CARREGANDO_CATEGORIAS}
              </p>
              {erroCategorias && onTentarDeNovo && (
                <button
                  type="button"
                  onClick={onTentarDeNovo}
                  className="text-body font-medium text-primary underline-offset-2 hover:underline"
                >
                  Tentar de novo
                </button>
              )}
            </div>
          )}

          {categorias && (
            <form
              id="form-new-prova"
              className="flex flex-col w-full gap-6"
              onSubmit={handleSubmit(create)}
            >
              <div>
                <h3 className="text-body font-medium text-foreground mb-4 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Informações Gerais
                </h3>
                <div className="bg-page p-4 rounded-lg">
                  <Form
                    formFields={listFieldProva}
                    register={register}
                    size={acimaDeSm ? "base" : "small"}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
                  />
                </div>
              </div>

              {isCustom && (
                <p className="text-caption text-info -mt-2">
                  {compartilhada
                    ? textoDaCompartilhada(categoriaEscolhida!.nome)
                    : "Prova personalizada — nome livre, PDF opcional."}
                </p>
              )}

              <OpcaoNovasVersoes
                checked={receberNovasVersoes}
                onChange={setReceberNovasVersoes}
              />

              <div>
                <h3 className="text-body font-medium text-foreground mb-4 flex items-center gap-2">
                  <CloudUpload className="h-4 w-4" />
                  Arquivos da Prova
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-info-muted p-4 rounded-lg border border-info/30">
                    <h4 className="text-body font-medium text-info mb-2">
                      Prova (PDF)
                    </h4>
                    <UploadButton
                      onChange={handleFileUpload}
                      placeholder="Upload da Prova"
                      className="w-full"
                      accept=".pdf"
                      variant="compact"
                      onRemove={handleRemoveFile}
                    />
                    {uploadFile && (
                      <p className="text-caption text-info mt-2 break-all">
                        ✓ Arquivo selecionado: {(uploadFile as File).name}
                      </p>
                    )}
                  </div>

                  <div className="bg-success-muted p-4 rounded-lg border border-success">
                    <h4 className="text-body font-medium text-success mb-2">
                      Gabarito (PDF) - Opcional
                    </h4>
                    <UploadButton
                      onChange={handleGabaritoUpload}
                      placeholder="Upload do Gabarito"
                      className="w-full"
                      accept=".pdf"
                      variant="compact"
                      onRemove={handleRemoveGabarito}
                    />
                    {uploadGabarito && (
                      <p className="text-caption text-success mt-2 break-all">
                        ✓ Arquivo selecionado: {(uploadGabarito as File).name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </form>
          )}
        </DialogBody>
        {categorias && (
          <DialogFooter>
            <Button
              type="submit"
              form="form-new-prova"
              variant="contained"
              disabled={!categoria || (!isCustom && !uploadFile)}
              sx={{
                backgroundColor: palette.marine[700],
                "&:hover": {
                  backgroundColor: palette.marine[800],
                },
                "&:disabled": {
                  backgroundColor: palette.neutral[400],
                },
                fontWeight: 600,
              }}
            >
              Criar Prova
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default NewProva;
