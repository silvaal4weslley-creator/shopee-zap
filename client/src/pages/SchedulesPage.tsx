import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, CalendarClock, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

const DAYS = [
  { value: "0", label: "Dom" },
  { value: "1", label: "Seg" },
  { value: "2", label: "Ter" },
  { value: "3", label: "Qua" },
  { value: "4", label: "Qui" },
  { value: "5", label: "Sex" },
  { value: "6", label: "Sáb" },
];

function ScheduleForm({ onSuccess, editData, links }: {
  onSuccess: () => void;
  editData?: { id: number; linkId: number; daysOfWeek: string; hour: number; minute: number };
  links: Array<{ id: number; title: string }>;
}) {
  const [linkId, setLinkId] = useState<string>(editData?.linkId?.toString() ?? "");
  const [selectedDays, setSelectedDays] = useState<string[]>(
    editData?.daysOfWeek ? editData.daysOfWeek.split(",") : []
  );
  const [hour, setHour] = useState<string>(editData?.hour?.toString() ?? "");
  const [minute, setMinute] = useState<string>(editData?.minute?.toString() ?? "");

  const utils = trpc.useUtils();
  const createMutation = trpc.schedules.create.useMutation({
    onSuccess: () => {
      utils.schedules.list.invalidate();
      toast.success("Agendamento criado!");
      onSuccess();
    },
    onError: (err) => toast.error(err.message),
  });
  const updateMutation = trpc.schedules.update.useMutation({
    onSuccess: () => {
      utils.schedules.list.invalidate();
      toast.success("Agendamento atualizado!");
      onSuccess();
    },
    onError: (err) => toast.error(err.message),
  });

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkId || selectedDays.length === 0 || hour === "" || minute === "") {
      toast.error("Preencha todos os campos");
      return;
    }
    const data = {
      linkId: parseInt(linkId),
      daysOfWeek: selectedDays.join(","),
      hour: parseInt(hour),
      minute: parseInt(minute),
    };
    if (editData) {
      updateMutation.mutate({ id: editData.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Link do Produto *</Label>
        <Select value={linkId} onValueChange={setLinkId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um link" />
          </SelectTrigger>
          <SelectContent>
            {links.map(link => (
              <SelectItem key={link.id} value={link.id.toString()}>
                {link.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Dias da Semana *</Label>
        <div className="flex flex-wrap gap-2">
          {DAYS.map(day => (
            <Button
              key={day.value}
              type="button"
              variant={selectedDays.includes(day.value) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleDay(day.value)}
              className="min-w-[3rem]"
            >
              {day.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Hora *</Label>
          <Select value={hour} onValueChange={setHour}>
            <SelectTrigger>
              <SelectValue placeholder="Hora" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 24 }, (_, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {String(i).padStart(2, "0")}h
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Minuto *</Label>
          <Select value={minute} onValueChange={setMinute}>
            <SelectTrigger>
              <SelectValue placeholder="Minuto" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 60 }, (_, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {String(i).padStart(2, "0")}min
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        {editData ? "Salvar Alterações" : "Criar Agendamento"}
      </Button>
    </form>
  );
}

export default function SchedulesPage() {
  const { data: schedules, isLoading } = trpc.schedules.list.useQuery();
  const { data: links } = trpc.links.list.useQuery();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editSchedule, setEditSchedule] = useState<any>(null);
  const utils = trpc.useUtils();

  const deleteMutation = trpc.schedules.delete.useMutation({
    onSuccess: () => {
      utils.schedules.list.invalidate();
      toast.success("Agendamento removido!");
    },
  });
  const toggleMutation = trpc.schedules.update.useMutation({
    onSuccess: () => utils.schedules.list.invalidate(),
  });

  const linksMap = useMemo(() => {
    const map = new Map<number, string>();
    links?.forEach(l => map.set(l.id, l.title));
    return map;
  }, [links]);

  const formatDays = (daysStr: string) => {
    return daysStr.split(",").map(d => DAYS.find(day => day.value === d.trim())?.label ?? d).join(", ");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Agendamentos</h1>
            <p className="text-muted-foreground text-sm mt-1">Configure quando seus links serão enviados</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditSchedule(null); }}>
            <DialogTrigger asChild>
              <Button disabled={!links || links.length === 0}>
                <Plus className="h-4 w-4 mr-2" />Novo Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editSchedule ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
              </DialogHeader>
              <ScheduleForm
                editData={editSchedule}
                links={links ?? []}
                onSuccess={() => { setDialogOpen(false); setEditSchedule(null); }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {(!links || links.length === 0) && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground text-sm">Cadastre links primeiro para criar agendamentos.</p>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}
              </div>
            </CardContent>
          </Card>
        ) : schedules && schedules.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Dias</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Ativo</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map(schedule => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {linksMap.get(schedule.linkId) ?? `Link #${schedule.linkId}`}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {schedule.daysOfWeek.split(",").map(d => (
                            <Badge key={d} variant="secondary" className="text-xs">
                              {DAYS.find(day => day.value === d.trim())?.label ?? d}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {String(schedule.hour).padStart(2, "0")}:{String(schedule.minute).padStart(2, "0")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={schedule.active}
                          onCheckedChange={(checked) => toggleMutation.mutate({ id: schedule.id, active: checked })}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => { setEditSchedule(schedule); setDialogOpen(true); }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => {
                            if (confirm("Remover este agendamento?")) deleteMutation.mutate({ id: schedule.id });
                          }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : links && links.length > 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <CalendarClock className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="font-medium text-lg mb-1">Nenhum agendamento</h3>
              <p className="text-muted-foreground text-sm mb-4">Crie seu primeiro agendamento de envio</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />Criar Agendamento
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
