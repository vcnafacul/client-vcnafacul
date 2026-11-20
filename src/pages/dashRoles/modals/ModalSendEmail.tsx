import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ModalProps } from "@/types/modal";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToastAsync } from "@/hooks/useToastAsync";
import { getUserByName, SearchUser } from "@/services/auth/getUserByName";
import { sendBulkEmail } from "@/services/auth/sendBulkEmail";
import { useAuthStore } from "@/store/auth";
import Button from "@mui/material/Button";
import { useEffect, useRef, useState } from "react";
import { CircleX, Mail, Search } from "lucide-react";
import { toast } from "react-toastify";

interface ModalSendEmailProps extends ModalProps {
  isOpen: boolean;
}

function ModalSendEmail({ handleClose, isOpen }: ModalSendEmailProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<SearchUser[]>([]);
  const [sendToAll, setSendToAll] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showConfirmAll, setShowConfirmAll] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>(null);

  const {
    data: { token },
  } = useAuthStore();

  const executeAsync = useToastAsync();

  // Busca de usuários com debounce
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await getUserByName(token, searchTerm);
        // Filtra usuários já selecionados
        const filteredResults = results.filter(
          (user) => !selectedUsers.some((selected) => selected.id === user.id),
        );
        setSearchResults(filteredResults);
      } catch (error) {
        toast.error("Erro ao buscar usuários");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, token, selectedUsers]);

  // Limpa a seleção quando marca "Enviar para todos"
  useEffect(() => {
    if (sendToAll) {
      setSelectedUsers([]);
    }
  }, [sendToAll]);

  const handleSelectUser = (user: SearchUser) => {
    setSelectedUsers([...selectedUsers, user]);
    setSearchResults(searchResults.filter((u) => u.id !== user.id));
    setSearchTerm("");
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
  };

  const executeSend = async () => {
    setIsSending(true);

    await executeAsync({
      action: async () => {
        return await sendBulkEmail(
          {
            subject: subject.trim(),
            message: message.trim(),
            userIds: sendToAll ? undefined : selectedUsers.map((u) => u.id),
            sendToAll,
          },
          token,
        );
      },
      loadingMessage: "Enviando email...",
      successMessage: sendToAll
        ? "Email enviado para todos os usuários com sucesso!"
        : `Email enviado para ${selectedUsers.length} usuário(s) com sucesso!`,
      errorMessage: "Erro ao enviar email. Tente novamente.",
      onSuccess: () => {
        setSubject("");
        setMessage("");
        setSelectedUsers([]);
        setSendToAll(false);
        setSearchTerm("");
        handleClose?.();
      },
    });

    setIsSending(false);
  };

  const handleSendEmail = async () => {
    if (!subject.trim()) {
      toast.warning("Por favor, preencha o assunto do email");
      return;
    }

    if (!message.trim()) {
      toast.warning("Por favor, preencha a mensagem do email");
      return;
    }

    if (!sendToAll && selectedUsers.length === 0) {
      toast.warning(
        "Por favor, selecione pelo menos um usuário ou marque 'Enviar para todos'",
      );
      return;
    }

    if (sendToAll) {
      setShowConfirmAll(true);
      return;
    }

    await executeSend();
  };

  const handleConfirmSendAll = async () => {
    setShowConfirmAll(false);
    await executeSend();
  };

  const handleCloseModal = () => {
    setSubject("");
    setMessage("");
    setSelectedUsers([]);
    setSendToAll(false);
    setSearchTerm("");
    setSearchResults([]);
    handleClose?.();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(o) => !o && handleCloseModal()}>
        <DialogContent
          size="lg"
          aria-describedby={undefined}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <div className="flex items-center gap-3">
              <Mail className="w-8 h-8 text-foreground" />
              <DialogTitle>Enviar Email em Massa</DialogTitle>
            </div>
          </DialogHeader>

          <DialogBody className="-mx-1 space-y-6 px-1 pt-2">
            {/* Assunto */}
            <div className="space-y-2 px-0.5">
              <Label
                htmlFor="subject"
                className="text-body font-semibold text-foreground"
              >
                Assunto *
              </Label>
              <Input
                id="subject"
                placeholder="Digite o assunto do email"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="text-body"
                disabled={isSending}
              />
            </div>

            {/* Mensagem */}
            <div className="space-y-2 px-0.5">
              <Label
                htmlFor="message"
                className="text-body font-semibold text-foreground"
              >
                Mensagem *
              </Label>
              <Textarea
                id="message"
                placeholder="Digite a mensagem do email..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[150px] text-body resize-none"
                disabled={isSending}
              />
              <p className="text-caption text-muted-foreground">
                {message.length} caracteres
              </p>
            </div>

            {/* Checkbox Enviar para Todos */}
            <div className="flex items-center space-x-3 p-4 bg-info-muted rounded-lg border border-info/30">
              <Checkbox
                id="sendToAll"
                checked={sendToAll}
                onCheckedChange={(checked) => setSendToAll(checked as boolean)}
                disabled={isSending}
              />
              <Label
                htmlFor="sendToAll"
                className="text-body font-medium text-foreground cursor-pointer"
              >
                Enviar para todos os usuários
              </Label>
            </div>

            {/* Busca de Usuários */}
            {!sendToAll && (
              <>
                <div className="space-y-2 p-0.5">
                  <Label
                    htmlFor="search"
                    className="text-body font-semibold text-foreground"
                  >
                    Buscar Usuários
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      id="search"
                      placeholder="Digite o nome do usuário..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 text-body"
                      disabled={isSending}
                    />
                  </div>

                  {/* Resultados da busca */}
                  {isSearching && (
                    <div className="text-body text-muted-foreground p-2">
                      Buscando...
                    </div>
                  )}

                  {searchResults.length > 0 && (
                    <div className="border border-border rounded-md max-h-48 overflow-y-auto">
                      {searchResults.map((user) => (
                        <button
                          type="button"
                          key={user.id}
                          onClick={() => handleSelectUser(user)}
                          className="block w-full p-3 text-left hover:bg-muted cursor-pointer transition-colors border-b border-border last:border-b-0"
                        >
                          <div className="font-medium text-foreground">
                            {user.name}
                          </div>
                          <div className="text-body text-muted-foreground">
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="text-caption text-muted-foreground">
                              {user.phone}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {searchTerm.trim().length >= 2 &&
                    !isSearching &&
                    searchResults.length === 0 && (
                      <div className="text-body text-muted-foreground p-2">
                        Nenhum usuário encontrado
                      </div>
                    )}
                </div>

                {/* Usuários Selecionados */}
                {selectedUsers.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-body font-semibold text-foreground">
                      Usuários Selecionados ({selectedUsers.length})
                    </Label>
                    <div className="flex flex-wrap gap-2 p-3 bg-page rounded-md border border-border max-h-40 overflow-y-auto">
                      {selectedUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-full text-body font-medium shadow-sm hover:bg-primary/90 transition-colors"
                        >
                          <span>{user.name}</span>
                          <button
                            onClick={() => handleRemoveUser(user.id)}
                            className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                            disabled={isSending}
                            type="button"
                          >
                            <CircleX className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </DialogBody>

          <DialogFooter>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleCloseModal}
              disabled={isSending}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendEmail}
              disabled={isSending}
            >
              {isSending ? "Enviando..." : "Enviar Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={showConfirmAll}
        onOpenChange={(aberto) => {
          if (!aberto) {
            setShowConfirmAll(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Enviar email para todos os usuários
            </AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a enviar o email{" "}
              <strong>para todos os usuários da plataforma</strong>. Esta ação
              não pode ser desfeita. Tem certeza que deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="primary" onClick={handleConfirmSendAll}>
              Enviar para todos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default ModalSendEmail;
