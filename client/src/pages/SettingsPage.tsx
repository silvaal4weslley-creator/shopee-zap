import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Copy, RefreshCw, Loader2, Shield, Clock, MessageSquare, Smartphone, WifiOff, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: settings, isLoading } = trpc.settings.get.useQuery();
  const utils = trpc.useUtils();

  const [startHour, setStartHour] = useState("");
  const [endHour, setEndHour] = useState("");
  const [groupId, setGroupId] = useState("");
  const [allowWeekends, setAllowWeekends] = useState(true);
  const [defaultMessage, setDefaultMessage] = useState("");

  useEffect(() => {
    if (settings) {
      setStartHour(settings.allowedStartHour.toString());
      setEndHour(settings.allowedEndHour.toString());
      setGroupId(settings.whatsappGroupId ?? "");
      setAllowWeekends(settings.allowWeekends ?? true);
      setDefaultMessage(settings.defaultMessage ?? "");
    }
  }, [settings]);

  const updateMutation = trpc.settings.update.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success("Configurações salvas!");
    },
    onError: (err) => toast.error(err.message),
  });

  const regenerateMutation = trpc.settings.regenerateApiKey.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      toast.success("Nova chave de API gerada!");
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      allowedStartHour: parseInt(startHour),
      allowedEndHour: parseInt(endHour),
      whatsappGroupId: groupId || undefined,
      allowWeekends,
      defaultMessage: defaultMessage || undefined,
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-8 bg-muted rounded w-48 animate-pulse" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-40 bg-muted rounded animate-pulse" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground mt-1">
            Configure o comportamento da automação e conexão com WhatsApp
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            {/* WhatsApp Connection */}
            <div className="bg-card rounded-xl border p-5">
              <div className="flex items-center gap-2 mb-1">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Conexão WhatsApp</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Configure a conexão com o WhatsApp Web para envio automático
              </p>

              {/* Status */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 mb-4">
                <WifiOff className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Desconectado</p>
                  <p className="text-xs text-muted-foreground">Escaneie o QR Code para conectar</p>
                </div>
                <span className="text-xs bg-muted px-2 py-1 rounded-full">Offline</span>
              </div>

              {/* QR Code placeholder */}
              <div className="flex flex-col items-center py-4">
                <div className="h-40 w-40 border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center mb-3">
                  <div className="text-center">
                    <Smartphone className="h-8 w-8 mx-auto text-muted-foreground/30 mb-1" />
                    <p className="text-xs text-muted-foreground">QR Code</p>
                  </div>
                </div>
                <p className="text-sm font-medium">QR Code do WhatsApp</p>
                <p className="text-xs text-muted-foreground text-center mt-1 max-w-xs">
                  Para conectar, execute o motor de automação no seu notebook e escaneie o QR Code com o WhatsApp do celular
                </p>
                <button className="text-xs text-primary hover:underline mt-2 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Como conectar
                </button>
              </div>

              <Separator className="my-4" />

              {/* Group ID */}
              <div className="space-y-2">
                <Label>Nome do Grupo WhatsApp</Label>
                <Input
                  placeholder="120363407824970879@g.us"
                  value={groupId}
                  onChange={e => setGroupId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Nome exato do grupo onde os links serão enviados
                </p>
              </div>
            </div>

            {/* Default Message */}
            <div className="bg-card rounded-xl border p-5">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Mensagem Padrão</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Mensagem que acompanha o link quando não há mensagem personalizada
              </p>
              <Textarea
                value={defaultMessage}
                onChange={(e) => setDefaultMessage(e.target.value)}
                placeholder="Ex: Confira essa oferta incrível! 🔥"
                rows={3}
              />
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Allowed Hours */}
            <div className="bg-card rounded-xl border p-5">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Horários Permitidos</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Defina os horários em que o bot pode enviar mensagens
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Início</Label>
                  <div className="flex items-center gap-1">
                    <Select value={startHour} onValueChange={setStartHour}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {String(i).padStart(2, "0")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">:00h</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Fim</Label>
                  <div className="flex items-center gap-1">
                    <Select value={endHour} onValueChange={setEndHour}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {String(i).padStart(2, "0")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">:00h</span>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Permitir envios nos finais de semana</p>
                  <p className="text-xs text-muted-foreground">Sábado e Domingo</p>
                </div>
                <Switch checked={allowWeekends} onCheckedChange={setAllowWeekends} />
              </div>

              <div className="mt-4 p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">
                  Os envios só serão executados entre <strong>{String(startHour).padStart(2, "0")}:00h</strong> e <strong>{String(endHour).padStart(2, "0")}:00h</strong>.
                </p>
              </div>
            </div>

            {/* API Key */}
            <div className="bg-card rounded-xl border p-5">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-5 w-5 text-amber-600" />
                <h3 className="font-semibold">Chave de API do Bot</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Use esta chave no bot Python para acessar a API de agendamentos
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={settings?.botApiKey ?? ""}
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={() => copyToClipboard(settings?.botApiKey ?? "", "API Key")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={() => {
                      if (confirm("Gerar nova chave? A chave atual será invalidada.")) {
                        regenerateMutation.mutate();
                      }
                    }}
                    disabled={regenerateMutation.isPending}
                  >
                    {regenerateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs font-medium mb-2">Como usar no bot:</p>
                  <code className="text-[10px] block bg-background rounded p-2 border overflow-x-auto whitespace-pre">
{`{
  "painel_url": "${window.location.origin}",
  "api_key": "${settings?.botApiKey ?? 'SUA_API_KEY'}"
}`}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} className="w-full" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Salvar Configurações
        </Button>
      </div>
    </DashboardLayout>
  );
}
