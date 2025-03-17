import { Ticket } from '@/types';

export const tickets: Ticket[] = [
  {
    id: '1',
    eventId: '1',
    eventTitle: 'Faso Music Festival',
    eventDate: '2023-08-15',
    eventTime: '12:00 PM',
    eventLocation: 'Ouagadougou, Burkina Faso',
    eventVenue: 'Place de la Nation',
    ticketType: 'VIP',
    price: 10000,
    currency: 'XOF',
    purchaseDate: '2023-07-10',
    qrCode: 'FASO-VIP-12345',
    used: false
  },
  {
    id: '2',
    eventId: '2',
    eventTitle: 'FESPACO Film Festival',
    eventDate: '2023-09-10',
    eventTime: '9:00 AM',
    eventLocation: 'Ouagadougou, Burkina Faso',
    eventVenue: 'Ciné Burkina',
    ticketType: 'Standard',
    price: 3000,
    currency: 'XOF',
    purchaseDate: '2023-08-05',
    qrCode: 'FESP-STD-67890',
    used: false
  },
  {
    id: '3',
    eventId: '6',
    eventTitle: 'Africa Cup of Nations Qualifier',
    eventDate: '2024-02-11',
    eventTime: '7:00 PM',
    eventLocation: 'Ouagadougou, Burkina Faso',
    eventVenue: 'Stade du 4-Août',
    ticketType: 'Premium',
    price: 5000,
    currency: 'XOF',
    purchaseDate: '2024-01-15',
    qrCode: 'AFCN-PRM-54321',
    used: false
  }
];