import Youtube from "react-youtube";
import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
}

export function AboutVideoModal({ videoId, open, onOpenChange, trigger }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="lg">
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent aria-describedby={undefined} className="justify-center">
        <DialogTitle className="sr-only">Assistir vídeo: conheça vcnafacul</DialogTitle>
        <div className="w-full aspect-video">
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
      </DialogContent>
    </Dialog>
  );
}
