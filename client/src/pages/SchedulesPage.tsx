import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { CalendarClock, Clock, Plus, Send, Trash2, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const DAY_FULL_NAMES = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

export default function SchedulesPage() {
  const { data: schedules, isLoading } = trpc.schedules.list.useQuery();
  const { data: links } = trpc.links.list.useQuery();
  const utils = trpc.useUtils();
  const [dialogOpen, setDialogOpen] = useState(false);

  const deleteMutation = trpc.schedules.delete.useMutation({
    onSuccess: () => {
      utils.schedules.list.invalidate();
      utils.dashboard.stats.invalidate();
      toast.success("Agendamento excluído!");
    },
    onError: () => toast.error("Erro ao excluir"),
  });

  // Count schedules per day
  const countByDay = DAY_NAMES.map((_, dayIdx) => {
    if (!schedules) return 0;
    return schedules.filter((s: any) => {
      const days = s.daysOfWeek.split(",").map(Number);
      return days.includes(dayIdx);
    }).length;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Agendamentos</h1>
            <p className="text-muted-foreground mt-1">
              Configure quando cada link será enviado no WhatsApp
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="gap-2" disabled={!links || links.length === 0}>
            <Plus className="h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>

        {/* Day of week cards */}
        <div className="grid grid-cols-7 gap-2">
          {DAY_NAMES.map((day, idx) => {
            const today = new Date().getDay();
            const isToday = idx === today;
            return (
              <div
                key={day}
                className={`rounded-xl border p-3 text-center transition-all ${
                  isToday ? "border-primary bg-primary/5 shadow-sm" : "bg-card"
                }`}
              >
                <p className={`text-xs font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                  {day}
                </p>
                {isToday && (
                  <p className="text-[10px] text-primary font-medium">Hoje</p>
                )}
                <p className={`text-xl font-bold mt-1 ${isToday ? "text-primary" : ""}`}>
                  {countByDay[idx]}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {countByDay[idx] === 1 ? "envio" : "envios"}
                </p>
              </div>
            );
          })}
        </div>

        {/* All schedules list */}
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Todos os Agendamentos</h2>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 bg-muted/30 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : schedules && schedules.length > 0 ? (
            <div className="space-y-2">
              {schedules.map((schedule: any) => {
                const days = schedule.daysOfWeek.split(",").map(Number);
                const dayLabels = days.map((d: number) => DAY_NAMES[d]).join(", ");
                const time = `${String(schedule.hour).padStart(2, "0")}:${String(schedule.minute).padStart(2, "0")}`;

                return (
                  <div
                    key={schedule.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {schedule.linkTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {dayLabels} às {time}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full shrink-0">
                      {schedule.repeatWeekly ? "Semanal" : "Único"}
                    </span>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => toast.info("Envio manual em breve!")}
                        className="h-8 w-8 rounded-lg hover:bg-primary/10 flex items-center justify-center transition-colors"
                        title="Enviar agora"
                      >
                        <Send className="h-4 w-4 text-primary" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Excluir este agendamento?")) {
                            deleteMutation.mutate({ id: schedule.id });
                          }
                        }}
                        className="h-8 w-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarClock className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum agendamento criado</p>
            </div>
          )}
        </div>
      </div>

      <CreateScheduleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        links={links ?? []}
      />
    </DashboardLayout>
  );
}

function CreateScheduleDialog({
  open,
  onOpenChange,
  links,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  links: any[];
}) {
  const [linkId, setLinkId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [hour, setHour] = useState("9");
  const [minute, setMinute] = useState("0");
  const [customMessage, setCustomMessage] = useState("");
  const [repeatWeekly, setRepeatWeekly] = useState(true);
  const utils = trpc.useUtils();

  const createMutation = trpc.schedules.create.useMutation({
    onSuccess: () => {
      utils.schedules.list.invalidate();
      utils.dashboard.stats.invalidate();
      utils.dashboard.upcoming.invalidate();
      utils.notifications.unreadCount.invalidate();
      onOpenChange(false);
      resetForm();
      toast.success("Agendamento criado!");
    },
    onError: () => toast.error("Erro ao criar agendamento"),
  });

  const resetForm = () => {
    setLinkId("");
    setDayOfWeek("1");
    setHour("9");
    setMinute("0");
    setCustomMessage("");
    setRepeatWeekly(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkId) {
      toast.error("Selecione um link");
      return;
    }
    createMutation.mutate({
      linkId: parseInt(linkId),
      daysOfWeek: dayOfWeek,
      hour: parseInt(hour),
      minute: parseInt(minute),
      customMessage: customMessage || undefined,
      repeatWeekly,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Agendamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Link *</Label>
            <Select value={linkId} onValueChange={setLinkId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um link" />
              </SelectTrigger>
              <SelectContent>
                {links.map((link: any) => (
                  <SelectItem key={link.id} value={String(link.id)}>
                    {link.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Dia da Semana</Label>
            <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAY_FULL_NAMES.map((name, idx) => (
                  <SelectItem key={idx} value={String(idx)}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Hora</Label>
              <Select value={hour} onValueChange={setHour}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {String(i).padStart(2, "0")}h
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Minuto</Label>
              <Select value={minute} onValueChange={setMinute}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 60 }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {String(i).padStart(2, "0")}min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Mensagem personalizada (opcional)</Label>
            <Textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Mensagem que acompanha o link..."
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="text-sm font-medium">Repetir semanalmente</p>
              <p className="text-xs text-muted-foreground">
                O envio se repete toda semana no mesmo horário
              </p>
            </div>
            <Switch checked={repeatWeekly} onCheckedChange={setRepeatWeekly} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Criando..." : "Agendar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
