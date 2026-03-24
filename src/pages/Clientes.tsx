import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Phone, Calendar, DollarSign, Plus } from 'lucide-react';
import Layout from '@/components/Layout';
import { useClients, useAddClient } from '@/hooks/useSupabaseData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Clientes = () => {
  const { data: clients = [], isLoading } = useClients();
  const addClient = useAddClient();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const { toast } = useToast();

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addClient.mutateAsync({ name, phone });
      setName(''); setPhone('');
      setOpen(false);
      toast({ title: 'Cliente adicionado!' });
    } catch {
      toast({ title: 'Erro ao adicionar cliente', variant: 'destructive' });
    }
  };

  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Clientes</h1>
            <p className="text-muted-foreground mt-1">Sua base de clientes</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-gold text-accent-foreground font-semibold shadow-gold hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="font-display">Adicionar Cliente</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do cliente" required className="bg-secondary border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(11) 99999-9999" required className="bg-secondary border-border" />
                </div>
                <Button type="submit" disabled={addClient.isPending} className="w-full bg-gradient-gold text-accent-foreground font-semibold shadow-gold hover:opacity-90">
                  {addClient.isPending ? 'Salvando...' : 'Adicionar'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar cliente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>{clients.length === 0 ? 'Nenhum cliente cadastrado ainda.' : 'Nenhum cliente encontrado.'}</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
            {/* Desktop table */}
            <table className="w-full hidden md:table">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cliente</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Telefone</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Última Visita</th>
                  <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Gasto</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((client, i) => (
                  <motion.tr
                    key={client.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">{client.name[0]}</span>
                        </div>
                        <span className="text-sm font-medium text-foreground">{client.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Phone className="w-3.5 h-3.5" />
                        {client.phone}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {client.last_visit ? new Date(client.last_visit).toLocaleDateString('pt-BR') : '—'}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-sm font-semibold text-primary">R$ {Number(client.total_spent).toFixed(2)}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-border">
              {filtered.map((client) => (
                <div key={client.id} className="p-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">{client.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{client.name}</p>
                      <p className="text-xs text-muted-foreground">{client.phone}</p>
                    </div>
                    <span className="ml-auto text-sm font-semibold text-primary">R$ {Number(client.total_spent).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </Layout>
  );
};

export default Clientes;
