import { ReactComponent as TrashIcon } from "@/assets/icons/trash.svg";
import Button from "@/components/molecules/button";
import ModalTemplate from "@/components/templates/modalTemplate";
import { Inscription } from "@/types/partnerPrepCourse/inscription";
import { MdOutlineFileDownload } from "react-icons/md";
import { FaRegCopy } from "react-icons/fa6";
import { useState } from "react";
import { Calendar } from "primereact/calendar";

interface InscriptionInfoModalProps {
  isOpen: boolean;
  handleClose: () => void;
  inscription?: Inscription;
}

export function InscriptionInfoModal({
  isOpen,
  handleClose,
  inscription,
}: InscriptionInfoModalProps) {
  const [dates, setDates] = useState<Date[] | null>(null);
  return (
    <ModalTemplate isOpen={isOpen} handleClose={handleClose}>
      <div className=" max-w-2xl flex flex-col gap-4">
        <h1 className="text-left text-marine text-3xl font-black">
          Processo Seletivo
        </h1>
        <h3 className="font-black text-xl text-marine">Cursinho UFSCar</h3>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla ac
          molestie ipsum. Morbi bibendum pellentesque purus ac tempus. Sed ipsum
          velit, consectetur sit amet ipsum at, blandit commodo metus.
          Suspendisse potenti. Vestibulum ante ipsum primis in faucibus orci
          luctus et ultrices posuere cubilia curae; In blandit convallis erat,
          et tempor nisi iaculis nec. Integer malesuada ut diam nec gravida.
          Duis et risus libero. Praesent dignissim orci a tellus pharetra, sed
          interdum nisi iaculis. Donec ultricies nisl at urna pretium feugiat
          dapibus at nisi. In eu vulputate nibh. Mauris non facilisis quam, et
          aliquam orci. Aenean augue enim, auctor eget interdum a, ullamcorper
          eu metus. Aliquam laoreet hendrerit lacus quis lacinia. Sed posuere
          enim vel odio ullamcorper condimentum. Aliquam at feugiat nisi, at
          commodo orci.
        </p>
        <h3 className="font-black text-xl text-marine">Data</h3>
        <div className="flex gap-4">
          <p>
            <strong>Início:</strong> DD/MM/AAAA
          </p>
          <p>
            <strong>Final:</strong> DD/MM/AAAA
          </p>
          <Calendar
            value={dates}
            onChange={(e) => setDates(e.value as Date[] | null)}
            selectionMode="range"
            readOnlyInput
            hideOnRangeSelection
          />
          teste
        </div>
        <h3 className="font-black text-xl text-marine">Número de Vagas</h3>
        <div className="flex gap-4">
          <p>
            <strong>Incritos:</strong> 000
          </p>
          <p>
            <strong>Vagas:</strong> 000
          </p>
        </div>
        <div className="flex gap-1.5 items-center justify-end">
          <p className="font-medium">Link de inscrição</p>
          <FaRegCopy />
        </div>
        <div className="flex justify-between">
          <Button className="h-8 w-36 ">
            <div className="flex justify-center gap-1.5">
              <MdOutlineFileDownload />
              <p className="text-sm w-fit">Lista de Alunos</p>
            </div>
          </Button>
          <div className="flex flex-1 justify-end gap-4">
            <Button className="w-24 h-8 bg-red border-red">
              <div className="flex justify-center gap-1.5">
                <TrashIcon />
                <p className="text-sm w-fit">Deletar</p>
              </div>
            </Button>
            <Button typeStyle="secondary" className="w-24 h-8">
              Editar
            </Button>
          </div>
        </div>
      </div>
    </ModalTemplate>
  );
}
