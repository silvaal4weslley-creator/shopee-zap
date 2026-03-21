import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Copy, RefreshCw, Loader2, Shield, Clock, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: settings, isLoading } = trpc.settings.get.useQuery();
  const utils = trpc.useUtils();

  const [startHour, setStartHour] = useState("");
  const [endHour, setEndHour] = useState("");
  const [groupId, setGroupId] = useState("");

  useEffect(() => {
    if (settings) {
      setStartHour(settings.allowedStartHour.toString());
      setEndHour(settings.allowedEndHour.toString());
      setGroupId(settings.whatsappGroupId ?? "");
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
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground text-sm mt-1">Configure o comportamento do bot e da API</p>
        </div>

        {/* Horários Permitidos */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Horários Permitidos</CardTitle>
            </div>
            <CardDescription>
              Defina o período em que o bot pode enviar mensagens
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Início</Label>
                <Select value={startHour} onValueChange={setStartHour}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {String(i).padStart(2, "0")}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fim</Label>
                <Select value={endHour} onValueChange={setEndHour}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {String(i).padStart(2, "0")}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">WhatsApp</CardTitle>
            </div>
            <CardDescription>
              Configure o grupo de destino das mensagens
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>ID do Grupo WhatsApp</Label>
              <Input
                placeholder="120363407824970879@g.us"
                value={groupId}
                onChange={e => setGroupId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                O ID do grupo pode ser obtido na Evolution API
              </p>
            </div>
          </CardContent>
        </Card>

        {/* API Key */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-lg">Chave de API do Bot</CardTitle>
            </div>
            <CardDescription>
              Use esta chave no bot Python para acessar a API de agendamentos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={settings?.botApiKey ?? ""}
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(settings?.botApiKey ?? "", "API Key")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
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
            </div>
            <Separator />
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">Como usar no bot:</p>
              <code className="text-xs block bg-background rounded p-3 border overflow-x-auto whitespace-pre">
{`# No config.json do bot:
{
  "painel_url": "${window.location.origin}",
  "api_key": "${settings?.botApiKey ?? 'SUA_API_KEY'}",
  "evolution_url": "http://localhost:8080",
  "evolution_key": "SUA_EVOLUTION_KEY",
  "instance_name": "shopee-bot"
}`}
              </code>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Salvar Configurações
        </Button>
      </div>
    </DashboardLayout>
  );
}
