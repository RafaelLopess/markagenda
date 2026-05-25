import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Service {
  id: string;
  user_id: string;
  name: string;
  price: number;
  duration: number;
  created_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  last_visit: string | null;
  total_spent: number;
  created_at: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  client_id: string | null;
  service_id: string | null;
  client_name: string;
  client_phone: string;
  service_name: string;
  price: number;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  sala: string | null;
  parcelas_total: number;
  parcelas_pagas: number;
  sessoes_total: number;
  sessoes_realizadas: number;
  created_at: string;
}

export const useServices = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['services', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('services').select('*').order('name');
      if (error) throw error;
      return data as Service[];
    },
    enabled: !!user,
  });
};

export const useClients = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['clients', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('clients').select('*').order('name');
      if (error) throw error;
      return data as Client[];
    },
    enabled: !!user,
  });
};

export const useAppointments = (date?: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['appointments', user?.id, date],
    queryFn: async () => {
      let query = supabase.from('appointments').select('*').order('date', { ascending: false }).order('time');
      if (date) query = query.eq('date', date);
      const { data, error } = await query;
      if (error) throw error;
      return data as Appointment[];
    },
    enabled: !!user,
  });
};

export const useAddService = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (service: { name: string; price: number; duration: number }) => {
      const { error } = await supabase.from('services').insert({ ...service, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  });
};

export const useDeleteService = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  });
};

export const useAddClient = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (client: { name: string; phone: string }) => {
      const { error } = await supabase.from('clients').insert({ ...client, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  });
};

export const useAddAppointment = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (apt: {
      client_name: string;
      client_phone: string;
      service_name: string;
      price: number;
      date: string;
      time: string;
      status?: string;
      client_id?: string;
      service_id?: string;
      sala?: string | null;
      parcelas_total?: number;
      parcelas_pagas?: number;
    }) => {
      const { error } = await supabase.from('appointments').insert({ ...apt, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  });
};

export const useUpdateAppointmentStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  });
};

export const useUpdateAppointmentParcelas = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, parcelas_pagas }: { id: string; parcelas_pagas: number }) => {
      const { error } = await supabase
        .from('appointments')
        .update({ parcelas_pagas })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  });
};
