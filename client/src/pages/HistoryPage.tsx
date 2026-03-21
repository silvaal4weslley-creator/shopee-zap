import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, XCircle, Clock, History, ExternalLink } from "lucide-react";

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  sent: { label: "Enviado", color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" /> },
  success: { label: "Enviado", color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" /> },
  failed: { label: "Falha", color: "bg-red-100 text-red-700", icon: <XCircle className="h-4 w-4 text-red-500" /> },
  pending: { label: "Pendente", color: "bg-amber-100 text-amber-700", icon: <Clock className="h-4 w-4 text-amber-500" /> },
};

export default function HistoryPage() {
  const { data: history, isLoading } = trpc.history.list.useQuery({});
  const { data: stats } = trpc.dashboard.stats.useQuery();

  const sentCount = stats?.sentCount ?? 0;
  const failedCount = stats?.failedCount ?? 0;
  const pendingCount = stats?.pendingCount ?? 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Histórico de Envios</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe todos os links enviados e seus status
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border bg-emerald-50 p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{sentCount}</p>
              <p className="text-xs text-muted-foreground">Enviados</p>
            </div>
          </div>
          <div className="rounded-xl border bg-red-50 p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{failedCount}</p>
              <p className="text-xs text-muted-foreground">Falhas</p>
            </div>
          </div>
          <div className="rounded-xl border bg-amber-50 p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </div>
          </div>
        </div>

        {/* History list */}
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center gap-2 mb-4">
            <History className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Registro de Envios</h2>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-14 bg-muted/30 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : history && history.length > 0 ? (
            <div className="space-y-2">
              {history.map((item: any) => {
                const statusInfo = STATUS_MAP[item.status] ?? STATUS_MAP.pending;
                const sentAt = item.sentAt ? new Date(item.sentAt) : null;
                const dateStr = sentAt
                  ? sentAt.toLocaleDateString("pt-BR") + ", " + sentAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                  : "—";

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="shrink-0">{statusInfo.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium truncate">{item.linkTitle ?? "—"}</p>
                        {item.linkUrl && (
                          <a
                            href={item.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0"
                          >
                            <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-primary" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{dateStr}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum envio registrado</p>
              <p className="text-xs mt-1">Os envios aparecerão aqui quando o bot começar a funcionar</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
