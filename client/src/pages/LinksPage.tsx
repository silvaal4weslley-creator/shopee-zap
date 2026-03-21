import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ExternalLink, Link2, Pencil, Plus, Trash2, Upload, Tag } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export default function LinksPage() {
  const { data: links, isLoading } = trpc.links.list.useQuery();
  const utils = trpc.useUtils();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<any>(null);

  const createMutation = trpc.links.create.useMutation({
    onSuccess: () => {
      utils.links.list.invalidate();
      utils.dashboard.stats.invalidate();
      setDialogOpen(false);
      toast.success("Link cadastrado com sucesso!");
    },
    onError: () => toast.error("Erro ao cadastrar link"),
  });

  const updateMutation = trpc.links.update.useMutation({
    onSuccess: () => {
      utils.links.list.invalidate();
      setDialogOpen(false);
      setEditingLink(null);
      toast.success("Link atualizado!");
    },
    onError: () => toast.error("Erro ao atualizar link"),
  });

  const deleteMutation = trpc.links.delete.useMutation({
    onSuccess: () => {
      utils.links.list.invalidate();
      utils.dashboard.stats.invalidate();
      toast.success("Link excluído!");
    },
    onError: () => toast.error("Erro ao excluir link"),
  });

  const handleEdit = (link: any) => {
    setEditingLink(link);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditingLink(null);
    setDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Meus Links</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie seus links de afiliados da Shopee
            </p>
          </div>
          <Button onClick={handleNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Link
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-muted/30 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : links && links.length > 0 ? (
          <div className="space-y-4">
            {links.map((link: any) => (
              <div
                key={link.id}
                className="bg-card rounded-xl border p-4 flex gap-4 items-start hover:shadow-sm transition-shadow"
              >
                {link.imageUrl ? (
                  <img
                    src={link.imageUrl}
                    alt={link.title}
                    className="h-20 w-20 rounded-lg object-cover shrink-0 border"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Link2 className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{link.title}</h3>
                  {link.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {link.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {link.price && (
                      <span className="text-sm font-semibold text-primary">
                        R$ {link.price}
                      </span>
                    )}
                    {link.discount && (
                      <span className="text-xs font-bold bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                        {link.discount} OFF
                      </span>
                    )}
                    {link.category && (
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {link.category}
                      </span>
                    )}
                  </div>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Ver na Shopee
                  </a>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleEdit(link)}
                    className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Excluir este link?")) {
                        deleteMutation.mutate({ id: link.id });
                      }
                    }}
                    className="h-8 w-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-card rounded-xl border">
            <Link2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground">Nenhum link cadastrado</p>
            <Button onClick={handleNew} variant="outline" className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Cadastrar primeiro link
            </Button>
          </div>
        )}
      </div>

      <LinkDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingLink(null);
        }}
        editingLink={editingLink}
        onSubmit={(data) => {
          if (editingLink) {
            updateMutation.mutate({ id: editingLink.id, ...data });
          } else {
            createMutation.mutate(data);
          }
        }}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </DashboardLayout>
  );
}

function LinkDialog({
  open,
  onOpenChange,
  editingLink,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingLink: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.links.uploadImage.useMutation({
    onSuccess: (data) => {
      setImageUrl(data.url);
      setUploading(false);
      toast.success("Imagem enviada!");
    },
    onError: () => {
      setUploading(false);
      toast.error("Erro ao enviar imagem");
    },
  });

  // Reset form when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      if (editingLink) {
        setTitle(editingLink.title || "");
        setUrl(editingLink.url || "");
        setDescription(editingLink.description || "");
        setPrice(editingLink.price || "");
        setDiscount(editingLink.discount || "");
        setCategory(editingLink.category || "");
        setImageUrl(editingLink.imageUrl || "");
      } else {
        setTitle("");
        setUrl("");
        setDescription("");
        setPrice("");
        setDiscount("");
        setCategory("");
        setImageUrl("");
      }
    }
    onOpenChange(newOpen);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem deve ter no máximo 5MB");
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadMutation.mutate({
        fileName: file.name,
        fileBase64: base64,
        contentType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      url,
      description: description || undefined,
      price: price || undefined,
      discount: discount || undefined,
      category: category || undefined,
      imageUrl: imageUrl || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingLink ? "Editar Link" : "Cadastrar Novo Link"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Título do Produto *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Kit Organizador de Cozinha"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>URL da Shopee *</Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://shopee.com.br/..."
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do produto..."
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Preço</Label>
              <Input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="R$ 49,90"
              />
            </div>
            <div className="space-y-2">
              <Label>Desconto</Label>
              <Input
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="30%"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex: Cozinha, Decoração..."
            />
          </div>
          <div className="space-y-2">
            <Label>Imagem do Produto</Label>
            {imageUrl && (
              <img src={imageUrl} alt="Preview" className="h-16 w-16 rounded-lg object-cover border" />
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {uploading ? "Enviando..." : "Upload"}
            </Button>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || uploading}>
              {isLoading ? "Salvando..." : editingLink ? "Salvar" : "Cadastrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
