import { PageHeader, PageShell } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Historico } from "./components/Historico";
import { NovaNotificacao } from "./components/NovaNotificacao";

/**
 * Notificações push — tela admin (série `pwa-push`, FE-06). A rota exige
 * `enviarNotificacao`, a mesma permissão das rotas da api (BE-06).
 */
export default function DashPush() {
  return (
    <PageShell className="max-w-5xl">
      <PageHeader title="Notificações" />
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
    </PageShell>
  );
}
