// client-vcnafacul/src/pages/homeV2/sections/AboutSection/AboutVideoModal.tsx
import * as Dialog from "@radix-ui/react-dialog";
import Youtube from "react-youtube";
import { ReactNode } from "react";

interface Props {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
}

export function AboutVideoModal({ videoId, open, onOpenChange, trigger }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 z-[60]" />
        <Dialog.Content className="fixed inset-0 z-[70] flex items-center justify-center p-4 outline-none">
          <div className="w-full max-w-4xl aspect-video">
            {open && (
              <Youtube
                videoId={videoId}
                className="w-full h-full"
                iframeClassName="w-full h-full"
                opts={{
                  height: "100%",
                  width: "100%",
                  playerVars: { autoplay: 1, rel: 0 },
                }}
              />
            )}
          </div>
          <Dialog.Close className="absolute top-4 right-4 text-white text-2xl">
            ✕
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
