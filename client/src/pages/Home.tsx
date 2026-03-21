import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, ExternalLink, ImageIcon, Loader2, Link2 } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

function LinkForm({ onSuccess, editData }: {
  onSuccess: () => void;
  editData?: { id: number; url: string; title: string; imageUrl?: string | null; price?: string | null; discount?: string | null; description?: string | null };
}) {
  const [url, setUrl] = useState(editData?.url ?? "");
  const [title, setTitle] = useState(editData?.title ?? "");
  const [imageUrl, setImageUrl] = useState(editData?.imageUrl ?? "");
  const [price, setPrice] = useState(editData?.price ?? "");
  const [discount, setDiscount] = useState(editData?.discount ?? "");
  const [description, setDescription] = useState(editData?.description ?? "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const createMutation = trpc.links.create.useMutation({
    onSuccess: () => {
      utils.links.list.invalidate();
      toast.success("Link criado com sucesso!");
      onSuccess();
    },
    onError: (err) => toast.error(err.message),
  });
  const updateMutation = trpc.links.update.useMutation({
    onSuccess: () => {
      utils.links.list.invalidate();
      toast.success("Link atualizado!");
      onSuccess();
    },
    onError: (err) => toast.error(err.message),
  });
  const uploadMutation = trpc.links.uploadImage.useMutation();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem deve ter no máximo 5MB");
      return;
    }
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const result = await uploadMutation.mutateAsync({
          fileName: file.name,
          fileBase64: base64,
          contentType: file.type,
        });
        setImageUrl(result.url);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Erro ao enviar imagem");
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !title) {
      toast.error("URL e título são obrigatórios");
      return;
    }
    const data = { url, title, imageUrl: imageUrl || undefined, price: price || undefined, discount: discount || undefined, description: description || undefined };
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
        <Label>URL do Produto *</Label>
        <Input placeholder="https://shopee.com.br/..." value={url} onChange={e => setUrl(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Título *</Label>
        <Input placeholder="Nome do produto" value={title} onChange={e => setTitle(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Preço</Label>
          <Input placeholder="R$ 99,90" value={price} onChange={e => setPrice(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Desconto</Label>
          <Input placeholder="50% OFF" value={discount} onChange={e => setDiscount(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Descrição</Label>
        <Textarea placeholder="Descrição do produto..." value={description} onChange={e => setDescription(e.target.value)} rows={3} />
      </div>
      <div className="space-y-2">
        <Label>Imagem</Label>
        <div className="flex items-center gap-3">
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ImageIcon className="h-4 w-4 mr-2" />}
            {uploading ? "Enviando..." : "Upload"}
          </Button>
          {imageUrl && <img src={imageUrl} alt="" className="h-10 w-10 rounded object-cover" />}
        </div>
        <Input placeholder="Ou cole a URL da imagem" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="mt-2" />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        {editData ? "Salvar Alterações" : "Adicionar Link"}
      </Button>
    </form>
  );
}

export default function Home() {
  const { data: links, isLoading } = trpc.links.list.useQuery();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editLink, setEditLink] = useState<any>(null);
  const utils = trpc.useUtils();

  const deleteMutation = trpc.links.delete.useMutation({
    onSuccess: () => {
      utils.links.list.invalidate();
      toast.success("Link removido!");
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Links</h1>
            <p className="text-muted-foreground text-sm mt-1">Gerencie seus links de produtos Shopee</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditLink(null); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Novo Link</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editLink ? "Editar Link" : "Novo Link"}</DialogTitle>
              </DialogHeader>
              <LinkForm
                editData={editLink}
                onSuccess={() => { setDialogOpen(false); setEditLink(null); }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-40 bg-muted rounded-lg mb-3" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : links && links.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {links.map(link => (
              <Card key={link.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {link.imageUrl ? (
                    <div className="relative h-40 mb-3 rounded-lg overflow-hidden bg-muted">
                      <img src={link.imageUrl} alt={link.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-40 mb-3 rounded-lg bg-muted flex items-center justify-center">
                      <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
                    </div>
                  )}
                  <h3 className="font-medium text-sm line-clamp-2 mb-2">{link.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    {link.price && <Badge variant="secondary" className="text-xs">{link.price}</Badge>}
                    {link.discount && <Badge className="text-xs bg-red-500 hover:bg-red-600 text-white">{link.discount}</Badge>}
                  </div>
                  {link.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{link.description}</p>
                  )}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" onClick={() => window.open(link.url, "_blank")}>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setEditLink(link); setDialogOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => {
                      if (confirm("Remover este link?")) deleteMutation.mutate({ id: link.id });
                    }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Link2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="font-medium text-lg mb-1">Nenhum link cadastrado</h3>
              <p className="text-muted-foreground text-sm mb-4">Adicione seu primeiro link de produto Shopee</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />Adicionar Link
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
