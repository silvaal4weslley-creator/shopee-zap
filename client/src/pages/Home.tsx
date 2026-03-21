import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Link2, CalendarClock, CheckCircle2, XCircle, Clock, Zap, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function Home() {
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const { data: upcoming, isLoading: upcomingLoading } = trpc.dashboard.upcoming.useQuery();
  const [, setLocation] = useLocation();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral da sua automação de links da Shopee
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            icon={<Link2 className="h-5 w-5" />}
            value={stats?.linksCount ?? 0}
            label="Links Cadastrados"
            color="bg-blue-50 text-blue-600"
            iconBg="bg-blue-100"
            loading={statsLoading}
          />
          <StatCard
            icon={<CalendarClock className="h-5 w-5" />}
            value={stats?.schedulesCount ?? 0}
            label="Agendamentos"
            color="bg-purple-50 text-purple-600"
            iconBg="bg-purple-100"
            loading={statsLoading}
          />
          <StatCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            value={stats?.sentCount ?? 0}
            label="Enviados"
            color="bg-emerald-50 text-emerald-600"
            iconBg="bg-emerald-100"
            loading={statsLoading}
          />
          <StatCard
            icon={<XCircle className="h-5 w-5" />}
            value={stats?.failedCount ?? 0}
            label="Falhas"
            color="bg-red-50 text-red-600"
            iconBg="bg-red-100"
            loading={statsLoading}
          />
          <StatCard
            icon={<Clock className="h-5 w-5" />}
            value={stats?.pendingCount ?? 0}
            label="Pendentes"
            color="bg-amber-50 text-amber-600"
            iconBg="bg-amber-100"
            loading={statsLoading}
          />
        </div>

        {/* Upcoming Sends */}
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Próximos Envios</h2>
            </div>
            <button
              onClick={() => setLocation("/schedules")}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Ver todos <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {upcomingLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : upcoming && upcoming.length > 0 ? (
            <div className="space-y-2">
              {upcoming.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.linkTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.dayName} às {String(item.hour).padStart(2, "0")}:{String(item.minute).padStart(2, "0")}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {item.repeatWeekly ? "Semanal" : "Único"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarClock className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum envio agendado</p>
              <button
                onClick={() => setLocation("/schedules")}
                className="text-sm text-primary hover:underline mt-2"
              >
                Criar agendamento
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  icon,
  value,
  label,
  color,
  iconBg,
  loading,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
  iconBg: string;
  loading: boolean;
}) {
  return (
    <div className={`rounded-xl border p-4 ${color.split(" ")[0]} transition-all hover:shadow-sm`}>
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <div>
          {loading ? (
            <div className="h-7 w-8 bg-muted/50 rounded animate-pulse" />
          ) : (
            <p className={`text-2xl font-bold ${color.split(" ")[1]}`}>{value}</p>
          )}
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </div>
      </div>
    </div>
  );
}
