/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AcademicCapIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@mui/material";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  FormFieldInput,
  FormFieldOption,
} from "../../../components/molecules/formField";
import UploadButton from "../../../components/molecules/uploadButton";
import Form from "../../../components/organisms/form";
import ModalTemplate, {
  ModalProps,
} from "../../../components/templates/modalTemplate";
import { CreateProva, Prova } from "../../../dtos/prova/prova";
import { ICategoria } from "../../../dtos/categoria/categoria";
import { Edicao, edicaoArray } from "../../../enums/prova/edicao";
import { useToastAsync } from "../../../hooks/useToastAsync";
import { createProva } from "../../../services/prova/createProva";
import { useAuthStore } from "../../../store/auth";
import { useState } from "react";

interface NewProvaProps extends ModalProps {
  addProva: (data: Prova) => void;
  categorias: ICategoria[];
  isOpen: boolean;
}

function NewProva({ addProva, categorias, handleClose, isOpen }: NewProvaProps) {
  const { register, handleSubmit, watch } = useForm();
  const {
    data: { token },
  } = useAuthStore();
  const executeAsync = useToastAsync();
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadGabarito, setUploadGabarito] = useState(null);

  const categoriasOptions: FormFieldOption[] = [{ label: "", value: "" }];
  categorias.forEach((f) => {
    if (f.selecionavel) {
      categoriasOptions.push({ label: f.nome, value: f._id });
    }
  });

  const edicaoOption: FormFieldOption[] = edicaoArray.map((f) => {
    if (f === Edicao.Reaplicacao) {
      return { label: f, value: "Replicacao" };
    }
    return { label: f, value: f };
  });
  edicaoOption.push({ label: "2ªAplicação", value: "Reaplicação/PPL2" });
  edicaoOption.push({ label: "3ªAplicação", value: "Reaplicação/PPL3" });

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
  const categoriaEscolhida = categorias.find((c) => c._id === categoria);
  const isCustom = categoriaEscolhida?.custom === true;

  const listFieldProva: FormFieldInput[] = [
    {
      id: "categoria",
      type: "option",
      options: categoriasOptions,
      value: "",
      label: "Categoria",
      disabled: false,
    },
    ...(isCustom
      ? ([
          {
            id: "nome",
            type: "text",
            label: "Nome da prova",
            disabled: false,
          },
          {
            id: "nomeSimulado",
            type: "text",
            label: "Nome do simulado",
            disabled: false,
          },
        ] as FormFieldInput[])
      : []),
    {
      id: "edicao",
      type: "option",
      options: edicaoOption,
      label: "Edicao",
      disabled: false,
    },
    {
      id: "ano",
      type: "number",
      label: "Ano de Realização",
      defaultValue: 2023,
      disabled: false,
    },
  ];

  const create = async (data: any) => {
    if (!isCustom && !uploadFile) {
      toast.error("Prova PDF é obrigatória para provas ENEM oficiais");
      return;
    }
    if (isCustom && (!data.nome || !data.nomeSimulado)) {
      toast.error(
        "Nome da prova e do simulado são obrigatórios para provas personalizadas",
      );
      return;
    }

    const info = data as CreateProva;
    info.aplicacao = 1;
    if (info.edicao.includes("2")) {
      info.edicao = Edicao.Regular;
      info.aplicacao = 2;
    }
    if (info.edicao.includes("3")) {
      info.edicao = Edicao.Regular;
      info.aplicacao = 3;
    }

    const fileName = Date.now();
    const formData = new FormData();
    formData.append("categoria", info.categoria);
    formData.append("edicao", info.edicao);
    formData.append("ano", info.ano.toString());
    formData.append("aplicacao", info.aplicacao.toString());

    if (uploadFile) {
      formData.append("file", uploadFile, `${fileName}.pdf`);
    }

    if (uploadGabarito) {
      formData.append("gabarito", uploadGabarito!, `${fileName}_gabarito.pdf`);
    }

    if (isCustom) {
      formData.append("nome", data.nome);
      formData.append("nomeSimulado", data.nomeSimulado);
    }

    const title = isCustom
      ? data.nome
      : `${info.ano}_${info.edicao}_${info.aplicacao}`;

    await executeAsync({
      action: () => createProva(formData, token),
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
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose!}
      className="w-full max-w-3xl rounded-lg bg-white shadow-xl p-2"
    >
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Cadastro de Prova
              </h2>
              <p className="text-sm text-gray-500">
                Preencha os dados da nova prova
              </p>
            </div>
          </div>
        </div>

        <form
          className="flex flex-col w-full gap-6"
          onSubmit={handleSubmit(create)}
        >
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
              <AcademicCapIcon className="h-4 w-4" />
              Informações Gerais
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <Form
                formFields={listFieldProva}
                register={register}
                className="grid grid-cols-2 gap-4"
              />
            </div>
          </div>

          {isCustom && (
            <p className="text-xs text-blue-700 -mt-2">
              Prova personalizada — nome livre, PDF opcional.
            </p>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
              <CloudArrowUpIcon className="h-4 w-4" />
              Arquivos da Prova
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
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
                  <p className="text-xs text-blue-700 mt-2">
                    ✓ Arquivo selecionado: {(uploadFile as File).name}
                  </p>
                )}
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="text-sm font-medium text-green-900 mb-2">
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
                  <p className="text-xs text-green-700 mt-2">
                    ✓ Arquivo selecionado: {(uploadGabarito as File).name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button
              type="submit"
              variant="contained"
              disabled={!categoria || (!isCustom && !uploadFile)}
              sx={{
                backgroundColor: "#3b82f6",
                "&:hover": {
                  backgroundColor: "#2563eb",
                },
                "&:disabled": {
                  backgroundColor: "#9ca3af",
                },
                fontWeight: 600,
              }}
            >
              Criar Prova
            </Button>
          </div>
        </form>
      </div>
    </ModalTemplate>
  );
}

export default NewProva;
