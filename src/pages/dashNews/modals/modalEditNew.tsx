/* eslint-disable @typescript-eslint/no-explicit-any */
import ModalTemplate from "../../../components/templates/modalTemplate";
import { useCallback, useState } from "react";
import { ReactComponent as IconPreview } from "../../../assets/icons/Icon-preview.svg";
import Content from "../../../components/atoms/content";
import Filter from "../../../components/atoms/filter";
import Text from "../../../components/atoms/text";
import Button from "../../../components/molecules/button";
import UploadButton from "../../../components/molecules/uploadButton";
import { News } from "../../../dtos/news/news";

interface ModalEditNewProps {
  news: News;
  create: (session: string, title: string, file: any) => void;
  deleteFunc: (id: string) => void;
  isOpen: boolean;
  handleClose: () => void;
}

function ModalEditNew({
  news,
  create,
  deleteFunc,
  isOpen,
  handleClose,
}: ModalEditNewProps) {
  const [arrayBuffer, setArrayBufer] = useState<ArrayBuffer>();
  const [upload, setUpload] = useState<boolean>(news ? true : false);

  const [session, setSession] = useState<string>(news ? news.session : "");
  const [title, setTitle] = useState<string>(news ? news.title : "");

  const [uploadFile, setUploadFile] = useState(null);

  const VITE_BASE_FTP = import.meta.env.VITE_BASE_FTP;

  const MyContent = useCallback(() => {
    if (news) {
      return (
        <Content
          className=""
          docxFilePath={`${VITE_BASE_FTP}${news.fileName}`}
        />
      );
    } else if (upload) {
      return <Content arrayBuffer={arrayBuffer} />;
    }
    return <IconPreview />;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upload]);

  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const arrayBuffer = event.target.result;
        setUpload(true);
        setArrayBufer(arrayBuffer);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const createNew = () => {
    if (!!news || (upload && !!session && !!title)) {
      create(session, title, uploadFile);
    }
  };

  const deleteNew = () => {
    if (news) {
      deleteFunc(news.id);
    }
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="w-full max-w-6xl bg-white p-4 rounded-md"
    >
      
      <div className="p-10 max-h-[90vh] w-full flex flex-col items-center">
        <Text size="secondary">Informações Básicas</Text>
        <div className="flex gap-4">
          <Filter
            disabled={!!news}
            defaultValue={session}
            search={false}
            className="border rounded-md"
            filtrar={(e: any) => {
              setSession(e.target.value);
            }}
            placeholder="Sessão"
          />
          <Filter
            disabled={!!news}
            defaultValue={title}
            search={false}
            className="border rounded-md"
            filtrar={(e: any) => {
              setTitle(e.target.value);
            }}
            placeholder="Título"
          />
        </div>
        <Text size="secondary">Preview Docs</Text>
        <div className="overflow-y-auto scrollbar-hide w-full max-h-[50vh] border my-4 p-4 relative">
          <MyContent />
        </div>
        {news ? (
          <></>
        ) : (
          <UploadButton
            placeholder="Upload Novidades"
            onChange={handleFileUpload}
          />
        )}
        <div className="flex gap-4 w-full mt-4">
          {news ? (
            <Button className="bg-red border-red" onClick={deleteNew}>
              Deletar
            </Button>
          ) : (
            <Button
              className="bg-green2 border-green2"
              hover
              onClick={createNew}
            >
              Salvar
            </Button>
          )}
        </div>
      </div>
    </ModalTemplate>
  );
}

export default ModalEditNew;
