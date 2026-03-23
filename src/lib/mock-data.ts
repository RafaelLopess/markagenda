export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // minutes
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  lastVisit: string;
  totalSpent: number;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  service: string;
  date: string;
  time: string;
  price: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
}

export const mockServices: Service[] = [
  { id: '1', name: 'Corte Masculino', price: 45, duration: 30 },
  { id: '2', name: 'Barba', price: 30, duration: 20 },
  { id: '3', name: 'Corte + Barba', price: 65, duration: 45 },
  { id: '4', name: 'Degradê', price: 50, duration: 35 },
  { id: '5', name: 'Pigmentação', price: 80, duration: 40 },
  { id: '6', name: 'Sobrancelha', price: 15, duration: 10 },
];

export const mockClients: Client[] = [
  { id: '1', name: 'João Silva', phone: '(11) 99999-1234', lastVisit: '2026-03-22', totalSpent: 320 },
  { id: '2', name: 'Pedro Santos', phone: '(11) 98888-5678', lastVisit: '2026-03-20', totalSpent: 540 },
  { id: '3', name: 'Lucas Oliveira', phone: '(11) 97777-9012', lastVisit: '2026-03-18', totalSpent: 195 },
  { id: '4', name: 'Rafael Costa', phone: '(11) 96666-3456', lastVisit: '2026-03-21', totalSpent: 780 },
  { id: '5', name: 'Marcos Ferreira', phone: '(11) 95555-7890', lastVisit: '2026-03-19', totalSpent: 410 },
];

export const mockAppointments: Appointment[] = [
  { id: '1', clientName: 'João Silva', clientPhone: '(11) 99999-1234', service: 'Corte + Barba', date: '2026-03-23', time: '09:00', price: 65, status: 'confirmed' },
  { id: '2', clientName: 'Pedro Santos', clientPhone: '(11) 98888-5678', service: 'Degradê', date: '2026-03-23', time: '10:00', price: 50, status: 'confirmed' },
  { id: '3', clientName: 'Lucas Oliveira', clientPhone: '(11) 97777-9012', service: 'Barba', date: '2026-03-23', time: '11:00', price: 30, status: 'pending' },
  { id: '4', clientName: 'Rafael Costa', clientPhone: '(11) 96666-3456', service: 'Corte Masculino', date: '2026-03-23', time: '14:00', price: 45, status: 'confirmed' },
  { id: '5', clientName: 'Marcos Ferreira', clientPhone: '(11) 95555-7890', service: 'Pigmentação', date: '2026-03-23', time: '15:30', price: 80, status: 'pending' },
  { id: '6', clientName: 'João Silva', clientPhone: '(11) 99999-1234', service: 'Corte Masculino', date: '2026-03-22', time: '09:00', price: 45, status: 'completed' },
  { id: '7', clientName: 'Pedro Santos', clientPhone: '(11) 98888-5678', service: 'Corte + Barba', date: '2026-03-22', time: '10:30', price: 65, status: 'completed' },
  { id: '8', clientName: 'Rafael Costa', clientPhone: '(11) 96666-3456', service: 'Barba', date: '2026-03-22', time: '14:00', price: 30, status: 'completed' },
];
