/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AcademicCapIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
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
import { ObjDefault } from "../../../dtos/question/questionDTO";
import { ITipoSimulado } from "../../../dtos/simulado/tipoSimulado";
import { Edicao, edicaoArray } from "../../../enums/prova/edicao";
import { createProva } from "../../../services/prova/createProva";
import { getInfosQuestion } from "../../../services/question/getInfosQuestion";
import { useAuthStore } from "../../../store/auth";

interface NewProvaProps extends ModalProps {
  addProva: (data: Prova) => void;
  tipos: ITipoSimulado[];
  isOpen: boolean;
}

function NewProva({ addProva, tipos, handleClose, isOpen }: NewProvaProps) {
  const { register, handleSubmit, watch } = useForm();
  const [exames, setExames] = useState<ObjDefault[]>([]);
  const {
    data: { token },
  } = useAuthStore();
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadGabarito, setUploadGabarito] = useState(null);

  const getInfors = useCallback(async () => {
    getInfosQuestion(token)
      .then((infos: any) => {
        setExames(infos.exames);
      })
      .catch((erro: Error) => {
        toast.error(erro.message);
      });
  }, [token]);

  let examesOptions: FormFieldOption[] = [];
  examesOptions.push({ label: "", value: "" });
  examesOptions = examesOptions.concat(
    exames.map((f) => ({ label: f.nome, value: f._id }))
  );

  const tiposOptions: FormFieldOption[] = [];
  tiposOptions.push({ label: "", value: "" });
  tipos.map((f) => {
    if (f.nome.includes("Enem")) {
      tiposOptions.push({ label: f.nome, value: f._id });
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

  useEffect(() => {
    getInfors();
  }, [getInfors]);

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
      id: "tipo",
      type: "option",
      options: tiposOptions,
      value: "",
      label: "Tipo",
      disabled: false,
    },
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

  const exame = watch("exame");
  const tipo = watch("tipo");

  const create = (data: any) => {
    if (!uploadFile) {
      toast.error("É necessaria fazer o upload do arquivo da prova");
    } else {
      const id = toast.loading("Criando Prova ... ");
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
      formData.append("exame", info.exame);
      formData.append("tipo", info.tipo);
      formData.append("edicao", info.edicao);
      formData.append("ano", info.ano.toString());
      formData.append("aplicacao", info.aplicacao.toString());
      formData.append("file", uploadFile!, `${fileName}.pdf`);

      // Adicionar gabarito se foi enviado
      if (uploadGabarito) {
        formData.append(
          "gabarito",
          uploadGabarito!,
          `${fileName}_gabarito.pdf`
        );
      }

      createProva(formData, token)
        .then((res) => {
          addProva(res);
          const title = `${info.exame}_${info.ano}_${info.edicao}_${info.aplicacao}`;
          toast.update(id, {
            render: `Prova ${title} criada com sucesso`,
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
          handleClose!();
        })
        .catch((error: Error) => {
          toast.update(id, {
            render: error.message,
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        });
    }
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose!}
      className="w-full max-w-3xl rounded-lg bg-white shadow-xl"
    >
      <div className="p-6">
        {/* Header */}
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
          {/* Informações Básicas */}
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

          {/* Upload de Arquivos */}
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
                />
                {uploadGabarito && (
                  <p className="text-xs text-green-700 mt-2">
                    ✓ Arquivo selecionado: {(uploadGabarito as File).name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Botão de Criação */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button
              type="submit"
              variant="contained"
              disabled={!exame || !tipo || !uploadFile}
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
