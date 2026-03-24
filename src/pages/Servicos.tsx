import { motion } from 'framer-motion';
import { Plus, Clock, DollarSign, Pencil, Trash2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { useServices, useAddService, useDeleteService } from '@/hooks/useSupabaseData';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Servicos = () => {
  const { data: services = [], isLoading } = useServices();
  const addService = useAddService();
  const deleteService = useDeleteService();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('30');
  const { toast } = useToast();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addService.mutateAsync({ name, price: parseFloat(price), duration: parseInt(duration) });
      setName(''); setPrice(''); setDuration('30');
      setOpen(false);
      toast({ title: 'Serviço adicionado!' });
    } catch {
      toast({ title: 'Erro ao adicionar serviço', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteService.mutateAsync(id);
      toast({ title: 'Serviço removido!' });
    } catch {
      toast({ title: 'Erro ao remover serviço', variant: 'destructive' });
    }
  };

  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Serviços</h1>
            <p className="text-muted-foreground mt-1">Gerencie seus serviços e preços</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-gold text-accent-foreground font-semibold shadow-gold hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Novo Serviço
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="font-display">Adicionar Serviço</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Corte Masculino" required className="bg-secondary border-border" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Preço (R$)</Label>
                    <Input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="45.00" required className="bg-secondary border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label>Duração (min)</Label>
                    <Input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="30" required className="bg-secondary border-border" />
                  </div>
                </div>
                <Button type="submit" disabled={addService.isPending} className="w-full bg-gradient-gold text-accent-foreground font-semibold shadow-gold hover:opacity-90">
                  {addService.isPending ? 'Salvando...' : 'Adicionar'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhum serviço cadastrado ainda.</p>
            <p className="text-sm mt-1">Clique em "Novo Serviço" para começar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-6 shadow-card hover:border-primary/30 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-display text-lg font-semibold text-foreground">{service.name}</h3>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{service.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-primary font-semibold">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">R$ {Number(service.price).toFixed(2)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </Layout>
  );
};

export default Servicos;
