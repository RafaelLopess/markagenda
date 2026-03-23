import { motion } from 'framer-motion';
import { Plus, Clock, DollarSign, Pencil, Trash2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { mockServices } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';

const Servicos = () => {
  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Serviços</h1>
            <p className="text-muted-foreground mt-1">Gerencie seus serviços e preços</p>
          </div>
          <Button className="bg-gradient-gold text-accent-foreground font-semibold shadow-gold hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Novo Serviço
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockServices.map((service, i) => (
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
                  <button className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
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
                  <span className="text-sm">R$ {service.price}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </Layout>
  );
};

export default Servicos;
