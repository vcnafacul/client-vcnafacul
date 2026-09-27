import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Historico } from "./components/Historico";
import { NovaNotificacao } from "./components/NovaNotificacao";

/**
 * Notificações push — tela admin (série `pwa-push`, FE-06). A rota exige
 * `enviarNotificacao`, a mesma permissão das rotas da api (BE-06).
 */
export default function DashPush() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-bold text-marine">Notificações</h1>
      <Tabs defaultValue="nova">
        <TabsList>
          <TabsTrigger value="nova">Nova notificação</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>
        <TabsContent value="nova" className="pt-4">
          <NovaNotificacao />
        </TabsContent>
        <TabsContent value="historico" className="pt-4">
          <Historico />
        </TabsContent>
      </Tabs>
    </div>
  );
}
