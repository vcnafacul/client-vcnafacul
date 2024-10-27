import ModalConfirmCancel from "@/components/organisms/modalConfirmCancel";
import ModalConfirmCancelMessage from "@/components/organisms/modalConfirmCancelMessage";
import { ModalProps } from "@/components/templates/modalTemplate";
import { Question } from "@/dtos/question/questionDTO";
import { CreateQuestion, UpdateQuestion } from "@/dtos/question/updateQuestion";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { Roles } from "@/enums/roles/roles";
import { getMissingNumber } from "@/services/prova/getMissingNumber";
import { deleteQuestion } from "@/services/question/deleteQuestion";
import { useAuthStore } from "@/store/auth";
import { BtnProps } from "@/types/generic/btnProps";
import { InfoQuestion } from "@/types/question/infoQuestion";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { IoMdTrash } from "react-icons/io";
import { toast } from "react-toastify";
import * as yup from "yup";
import { questionContent, questionInfo } from "../../data";
import { QuestionButton } from "./fields/questionButtons";
import { QuestionContent } from "./fields/questionContent";
import { QuestionImage } from "./fields/questionImage";
import { QuestionInfo } from "./fields/questionInfo";
import { QuestionReview } from "./fields/questionReview";

interface ModalDetalhesProps extends ModalProps {
  question?: Question;
  infos: InfoQuestion;
  handleUpdateQuestionStatus: (status: StatusEnum, message?: string) => void;
  handleUpdateQuestion: (questionUpdate: UpdateQuestion) => void;
  handleAddQuestion: (question: Question) => void;
  handleRemoveQuestion: (id: string) => void;
}

function ModalCreateEdit({
  question,
  infos,
  handleClose,
  handleUpdateQuestionStatus,
  handleUpdateQuestion,
  handleAddQuestion,
  handleRemoveQuestion,
}: ModalDetalhesProps) {
  const schema = yup
    .object()
    .shape({
      prova: yup
        .string()
        .required("Prova é obrigatoria")
        .typeError("Por favor, selecione uma prova")
        .default(question?.prova),
      numero: yup
        .number()
        .required("Número da questão é obrigatório")
        .typeError("Por favor, insira um número válido"),
      enemArea: yup
        .string()
        .required("Área do Conhecimento é obrigatorio")
        .typeError("Área do Conhecimento é obrigatorio")
        .default(question?.enemArea),
      materia: yup
        .string()
        .typeError("Materia é obrigatoria")
        .default(question?.materia),
      frente1: yup
        .string()
        .typeError("A Frente Principal é obrigatorio")
        .default(question?.frente1),
      frente2: yup.string().nullable().default(question?.frente2),
      frente3: yup.string().nullable().default(question?.frente3),
      textoQuestao: yup
        .string()
        .typeError("Texto da questão é obrigatorio")
        .default(question?.textoQuestao),
      textoAlternativaA: yup.string().default(question?.textoAlternativaA),
      textoAlternativaB: yup.string().default(question?.textoAlternativaA),
      textoAlternativaC: yup.string().default(question?.textoAlternativaA),
      textoAlternativaD: yup.string().default(question?.textoAlternativaA),
      textoAlternativaE: yup.string().default(question?.textoAlternativaA),
      alternativa: yup.string().required().default(question?.alternativa),
      imageId: yup.string().default(question?.imageId),
      provaClassification: yup.bool().default(question?.provaClassification),
      subjectClassification: yup
        .bool()
        .default(question?.subjectClassification),
      textClassification: yup.bool().default(question?.textClassification),
      imageClassfication: yup.bool().default(question?.imageClassfication),
      alternativeClassfication: yup
        .bool()
        .default(question?.alternativeClassfication),
      reported: yup.bool().default(question?.reported),
    })
    .required();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [refuse, setRefuse] = useState<boolean>(false);
  const [modified, setModified] = useState<boolean>(false);
  const [comeBack, setComeback] = useState<boolean>(false);
  const [numberMissing, setNumberMissing] = useState<number[]>([]);
  const [tryDelete, setTryDelete] = useState<boolean>(false);

  const [numberValue, setNumberValue] = useState<number | undefined>(
    question?.numero
  );

  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(
    null
  );
  const [uploadFile, setUploadFile] = useState<Blob | null>(null);

  //WATCHERS
  const prova = watch("prova");
  //END WATCHERS

  const previewImage = (file: Blob) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file: Blob = e.target.files![0];
    previewImage(file);
    setUploadFile(file);
  };

  const {
    data: { permissao, token },
  } = useAuthStore();

  const resetAsyncForm = useCallback(async () => {
    reset(question); // asynchronously reset your form values
  }, [question, reset]);

  const handleUpdateClose = (data: UpdateQuestion) => {
    handleUpdateQuestion(data);
  };

  const handleSave = (data: CreateQuestion) => {
    const dataQuestion = data as UpdateQuestion;
    if (!dataQuestion.materia || !dataQuestion.frente1) {
      dataQuestion.subjectClassification = true;
    }
    if (!dataQuestion.textoQuestao) {
      dataQuestion.textClassification = true;
    }
    console.log(dataQuestion);
    // if (question) {
    //   dataQuestion._id = question._id;
    //   if (uploadFile) {
    //     const formData = new FormData();
    //     formData.append("file", uploadFile);
    //     uploadImage(formData, token)
    //       .then((res: string) => {
    //         dataQuestion.imageId = res;
    //         handleUpdateClose(dataQuestion);
    //       })
    //       .catch((error: Error) => {
    //         toast.error(error.message);
    //       });
    //   } else {
    //     handleUpdateClose(dataQuestion);
    //   }
    // } else {
    //   const formData = new FormData();
    //   formData.append("file", uploadFile as Blob);
    //   uploadImage(formData, token)
    //     .then((res: string) => {
    //       data.imageId = res;
    //       createQuestion(data, token)
    //         .then((res: Question) => {
    //           handleAddQuestion(res);
    //           handleClose!();
    //           toast.success(`Cadastro realizado com sucesso. Id: ${res._id}`);
    //         })
    //         .catch((error: Error) => {
    //           toast.error(error.message);
    //         });
    //     })
    //     .catch((error: Error) => {
    //       toast.error(error.message);
    //     });
    // }
  };

  const handleDelete = () => {
    deleteQuestion(question!._id, token)
      .then(() => {
        handleClose!();
        handleRemoveQuestion(question!._id);
        toast.success(`Questão ${question?._id} deletada com sucess`);
      })
      .catch((erro: Error) => {
        toast.error(`Erro ao deletar questão ${erro.message}`);
      });
  };

  const ModalRefused = () => {
    return (
      <ModalConfirmCancelMessage
        isOpen={refuse}
        handleClose={() => {
          setRefuse(false);
        }}
        text="Descreva o motivo da rejeição:"
        handleConfirm={(message?: string) => {
          setRefuse(false);
          handleUpdateQuestionStatus(StatusEnum.Rejected, message);
        }}
      />
    );
  };

  const ModalComeBack = () => {
    return (
      <ModalConfirmCancel
        isOpen={comeBack && modified}
        handleClose={() => {
          setComeback(false);
        }}
        text="Suas alterações ainda não foram salvas. Se você sair agora, perderá todas as alterações. Deseja continuar?"
        handleConfirm={() => {
          setComeback(false);
          resetAsyncForm();
          setModified(false);
          setIsEditing(false);
        }}
      />
    );
  };

  const ModalDeleteQuestion = () => {
    return (
      <ModalConfirmCancel
        isOpen={tryDelete}
        handleClose={() => {
          setTryDelete(false);
        }}
        text="Ao confirmar a ação, a questão será excluida e não haverá volta. Deseja continuar?"
        handleConfirm={() => {
          handleDelete();
        }}
      />
    );
  };

  const btns: BtnProps[] = [
    {
      children: "Aceitar",
      type: "button",
      onClick: () => {
        handleUpdateQuestionStatus(StatusEnum.Approved);
      },
      status: StatusEnum.Approved,
      typeStyle: "accepted",
      editing: false,
      disabled:
        !permissao[Roles.validarQuestao] ||
        question?.status === StatusEnum.Approved,
    },
    {
      children: "Rejeitar",
      type: "button",
      onClick: () => {
        setRefuse(true);
      },
      status: StatusEnum.Rejected,
      editing: false,
      typeStyle: "refused",
      disabled:
        !permissao[Roles.validarQuestao] ||
        question?.status === StatusEnum.Rejected,
    },
    {
      children: "Editar",
      type: "button",
      onClick: () => {
        setIsEditing(true);
      },
      editing: false,
      className: "col-span-2",
      disabled: !permissao[Roles.validarQuestao],
    },
    {
      children: "Fechar",
      type: "button",
      onClick: handleClose,
      editing: false,
      className: "col-span-2",
    },
    {
      children: "Salvar",
      type: "submit",
      editing: true,
      className: "col-span-2",
      disabled: !modified,
    },
    {
      children: "Voltar",
      type: "button",
      onClick: () => {
        modified ? setComeback(true) : setIsEditing(false);
      },
      editing: true,
      className: "col-span-2",
    },
  ];

  const getMissing = useCallback(async () => {
    if (prova) {
      getMissingNumber(prova, token)
        .then((res) => {
          if (question?.numero && res.includes(question.numero)) {
            setNumberMissing(res);
            setValue("numero", question.numero);
            setNumberValue(question.numero);
          } else if (
            question?.numero &&
            !res.includes(question.numero) &&
            prova === question.prova
          ) {
            setNumberMissing([question.numero, ...res]);
            setValue("numero", question.numero);
            setNumberValue(question.numero);
          } else {
            console.log(res[0]);
            setNumberMissing(res);
            setValue("numero", res[0]);
            setNumberValue(res[0]);
          }
        })
        .catch((erro: Error) => {
          toast.error(erro.message);
        });
    } else {
      if (question) setNumberMissing([question.numero]);
      else setNumberMissing([]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prova, token]);

  useEffect(() => {
    const subscription = watch(() => {
      setModified(true);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    getMissing();
  }, [getMissing, prova]);

  return (
    <>
      <form
        onSubmit={handleSubmit(handleSave)}
        className="grid grid-cols-1 md:grid-cols-4 gap-x-4"
      >
        <div className="col-span-1 flex flex-col">
          <QuestionInfo
            form={questionInfo}
            setValue={setValue}
            question={question}
            infos={infos}
            numberMissing={numberMissing}
            numberValue={numberValue}
            edit={!question ? false : !isEditing}
            errors={errors}
          />
        </div>
        <div className="col-span-1 md:col-span-2">
          <QuestionContent
            form={questionContent}
            setValue={setValue}
            question={question}
            edit={!question ? false : !isEditing}
            errors={errors}
          />
        </div>
        <div className="col-span-1 md:col-span-1">
          <div className="flex flex-col gap-4">
            <QuestionImage
              imageId={question?.imageId}
              imagePreview={imagePreview}
              hasQuestion={!!question}
              handleImageChange={handleImageChange}
              edit={isEditing}
            />
            <QuestionReview />
            <div className="grid grid-cols-2 gap-1 w-full">
              <QuestionButton
                hasQuestion={!!question}
                isEditing={isEditing}
                btns={btns}
                handleClose={handleClose!}
                disabled={
                  imagePreview === null || !permissao[Roles.criarQuestao]
                }
              />
            </div>
          </div>
        </div>
      </form>
      {permissao.validarQuestao && question && question.status !== 1 && (
        <div
          className={`flex justify-end cursor-pointer my-4 md:my-0 ${
            !question && "hidden"
          }`}
          onClick={() => setTryDelete(true)}
        >
          <IoMdTrash className="w-10 h-10 fill-white p-1 rounded shadow shadow-zinc-300" />
        </div>
      )}
      <ModalRefused />
      <ModalComeBack />
      <ModalDeleteQuestion />
    </>
  );
}

export default ModalCreateEdit;
