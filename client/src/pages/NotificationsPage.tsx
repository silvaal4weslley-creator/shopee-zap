import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Bell, CheckCheck, CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  send_success: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  send_failed: <XCircle className="h-4 w-4 text-red-500" />,
  schedule_created: <Info className="h-4 w-4 text-blue-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-500" />,
};

export default function NotificationsPage() {
  const { data: notifications, isLoading } = trpc.notifications.list.useQuery();
  const { data: unreadData } = trpc.notifications.unreadCount.useQuery();
  const utils = trpc.useUtils();

  const markReadMutation = trpc.notifications.markRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
  });

  const markAllReadMutation = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
      toast.success("Todas marcadas como lidas!");
    },
  });

  const unreadCount = typeof unreadData === "number" ? unreadData : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notificações</h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe alertas de envios, falhas e atendimentos
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Marcar todas como lidas
            </Button>
          )}
        </div>

        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Todas as Notificações</h2>
            {unreadCount > 0 && (
              <span className="text-xs font-bold bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full">
                {unreadCount} não lidas
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-muted/30 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="space-y-1">
              {notifications.map((notif: any) => {
                const icon = TYPE_ICONS[notif.type] ?? <Info className="h-4 w-4 text-muted-foreground" />;
                const createdAt = notif.createdAt ? new Date(notif.createdAt) : null;
                const dateStr = createdAt
                  ? createdAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) +
                    ", " +
                    createdAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                  : "";

                return (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                      notif.isRead ? "hover:bg-muted/50" : "bg-primary/5 hover:bg-primary/10"
                    }`}
                    onClick={() => {
                      if (!notif.isRead) {
                        markReadMutation.mutate({ id: notif.id });
                      }
                    }}
                  >
                    <div className="shrink-0 mt-0.5">{icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm ${notif.isRead ? "" : "font-semibold"}`}>
                          {notif.title}
                        </p>
                        {!notif.isRead && (
                          <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">{dateStr}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
