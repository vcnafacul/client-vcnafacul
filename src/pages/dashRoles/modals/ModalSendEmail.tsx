import ModalTemplate, {
  ModalProps,
} from "@/components/templates/modalTemplate";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getUserByName, SearchUser } from "@/services/auth/getUserByName";
import { sendBulkEmail } from "@/services/auth/sendBulkEmail";
import { useAuthStore } from "@/store/auth";
import Button from "@mui/material/Button";
import { useEffect, useRef, useState } from "react";
import { IoCloseCircle, IoSearch } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
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
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    data: { token },
  } = useAuthStore();

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
          (user) => !selectedUsers.some((selected) => selected.id === user.id)
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
        "Por favor, selecione pelo menos um usuário ou marque 'Enviar para todos'"
      );
      return;
    }

    setIsSending(true);
    try {
      await sendBulkEmail(
        {
          subject: subject.trim(),
          message: message.trim(),
          userIds: sendToAll ? undefined : selectedUsers.map((u) => u.id),
          sendToAll,
        },
        token
      );

      toast.success(
        sendToAll
          ? "Email enviado para todos os usuários com sucesso!"
          : `Email enviado para ${selectedUsers.length} usuário(s) com sucesso!`
      );

      // Limpa o formulário
      setSubject("");
      setMessage("");
      setSelectedUsers([]);
      setSendToAll(false);
      setSearchTerm("");
      handleClose?.();
    } catch (error) {
      toast.error("Erro ao enviar email. Tente novamente.");
    } finally {
      setIsSending(false);
    }
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
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleCloseModal}
      className="bg-white rounded-lg p-6 shadow-2xl"
    >
      <div className="w-[90vw] max-w-3xl">
        {/* Título */}
        <div className="flex items-center gap-3 mb-6">
          <MdEmail className="w-8 h-8 text-marine" />
          <h2 className="text-2xl font-bold text-marine">
            Enviar Email em Massa
          </h2>
        </div>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide pr-2">
          {/* Assunto */}
          <div className="space-y-2 px-0.5">
            <Label
              htmlFor="subject"
              className="text-base font-semibold text-gray-700"
            >
              Assunto *
            </Label>
            <Input
              id="subject"
              placeholder="Digite o assunto do email"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="text-base"
              disabled={isSending}
            />
          </div>

          {/* Mensagem */}
          <div className="space-y-2 px-0.5">
            <Label
              htmlFor="message"
              className="text-base font-semibold text-gray-700"
            >
              Mensagem *
            </Label>
            <Textarea
              id="message"
              placeholder="Digite a mensagem do email..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[150px] text-base resize-none"
              disabled={isSending}
            />
            <p className="text-xs text-gray-500">{message.length} caracteres</p>
          </div>

          {/* Checkbox Enviar para Todos */}
          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Checkbox
              id="sendToAll"
              checked={sendToAll}
              onCheckedChange={(checked) => setSendToAll(checked as boolean)}
              disabled={isSending}
            />
            <Label
              htmlFor="sendToAll"
              className="text-base font-medium text-gray-700 cursor-pointer"
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
                  className="text-base font-semibold text-gray-700"
                >
                  Buscar Usuários
                </Label>
                <div className="relative">
                  <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="search"
                    placeholder="Digite o nome do usuário..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-base"
                    disabled={isSending}
                  />
                </div>

                {/* Resultados da busca */}
                {isSearching && (
                  <div className="text-sm text-gray-500 p-2">Buscando...</div>
                )}

                {searchResults.length > 0 && (
                  <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className="p-3 hover:bg-gray-100 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="text-xs text-gray-400">
                            {user.phone}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {searchTerm.trim().length >= 2 &&
                  !isSearching &&
                  searchResults.length === 0 && (
                    <div className="text-sm text-gray-500 p-2">
                      Nenhum usuário encontrado
                    </div>
                  )}
              </div>

              {/* Usuários Selecionados */}
              {selectedUsers.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-base font-semibold text-gray-700">
                    Usuários Selecionados ({selectedUsers.length})
                  </Label>
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-md border border-gray-200 max-h-40 overflow-y-auto">
                    {selectedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-2 bg-marine text-white px-3 py-2 rounded-full text-sm font-medium shadow-sm hover:bg-marine/90 transition-colors"
                      >
                        <span>{user.name}</span>
                        <button
                          onClick={() => handleRemoveUser(user.id)}
                          className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                          disabled={isSending}
                          type="button"
                        >
                          <IoCloseCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button
            variant="outlined"
            color="primary"
            onClick={handleCloseModal}
            disabled={isSending}
            className="order-2 sm:order-1 w-full"
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendEmail}
            disabled={isSending}
            className="order-1 sm:order-2 w-full"
          >
            {isSending ? "Enviando..." : "Enviar Email"}
          </Button>
        </div>
      </div>
    </ModalTemplate>
  );
}

export default ModalSendEmail;
