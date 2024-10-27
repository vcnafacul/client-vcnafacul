import React, { ComponentProps } from "react";
import { IoMdClose } from "react-icons/io";
import OutsideClickHandler from "react-outside-click-handler";
import { TabModal } from "../modalTabTemplate";

export interface ModalProps {
  handleClose?: () => void;
}

interface ModalTemplateProps extends ComponentProps<"div"> {
  children: React.ReactNode;
  outSideClose?: boolean;
  isOpen: boolean;
  tabs?: TabModal[];
  indexTabSelect?: number;
  setIndexTabSelect?: React.Dispatch<React.SetStateAction<number>>;
  handleClose: () => void;
}

function ModalTemplate({
  children,
  handleClose,
  outSideClose = false,
  isOpen,
  tabs,
  indexTabSelect,
  setIndexTabSelect,
  ...props
}: ModalTemplateProps) {
  return !isOpen ? null : (
    <div
      className="fixed flex justify-center items-center top-0 left-0 z-50 bg-black/60 w-screen h-screen overflow-y-auto 
        scrollbar-hide"
      {...props}
    >
      {outSideClose ? (
        <OutsideClickHandler
          onOutsideClick={() => {
            handleClose!();
          }}
        >
          {tabs ? (
            <div className="flex top-0 md:left-0 md:z-0 z-50 absolute md:relative">
              {tabs.map((tab, index) => (
                <div
                  onClick={() => setIndexTabSelect!(index)}
                  key={index}
                  className={`${
                    tab.label === tabs[indexTabSelect!].label
                      ? "bg-white"
                      : "bg-lightGray"
                  } px-4 py-1 cursor-pointer text-marine font-black`}
                >
                  {tab.label}
                </div>
              ))}
            </div>
          ) : null}
          <div className="p-4 relative flex flex-col w-fit bg-white rounded-r-md rounded-b-md">
            <IoMdClose
              onClick={handleClose}
              className="self-end md:mt-0 cursor-pointer w-5 h-5"
            />
            {React.cloneElement(children as React.ReactElement, {
              handleClose,
            })}
          </div>
        </OutsideClickHandler>
      ) : (
        <>
          {tabs ? (
            <div className="flex -top-7 left-0 z-0">
              {tabs.map((tab, index) => (
                <div
                  onClick={() => setIndexTabSelect!(index)}
                  key={index}
                  className={`${
                    tab.label === tabs[indexTabSelect!].label
                      ? "bg-white"
                      : "bg-lightGray"
                  } px-4 py-1 cursor-pointer text-marine font-black`}
                >
                  {tab.label}
                </div>
              ))}
            </div>
          ) : null}
          <div className="flex flex-col bg-white w-fit p-4 rounded-md">
            <IoMdClose
              onClick={handleClose}
              className="self-end cursor-pointer w-5 h-5"
            />
            {React.cloneElement(children as React.ReactElement, {
              handleClose,
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default ModalTemplate;
