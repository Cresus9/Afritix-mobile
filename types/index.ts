export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  venue: string;
  image: string;
  price: number;
  currency: string;
  category: string;
  organizer: string;
  featured?: boolean;
  ticketsAvailable?: number;
  ticketsSold?: number;
  city?: string;
  isFeatured?: boolean;
  availableTickets?: number;
  categories?: string[];
}

export interface Ticket {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventVenue: string;
  ticketType: string;
  price: number;
  currency: string;
  purchaseDate: string;
  qrCode: string;
  used: boolean;
  status?: string;
  scannedAt?: string;
  scannedBy?: string;
  scanLocation?: string;
  validationHistory?: ValidationEvent[];
}

export interface ValidationEvent {
  id: string;
  ticketId: string;
  status: string;
  timestamp: string;
  success: boolean;
  location?: string;
  operatorId?: string;
  operatorName?: string;
  deviceId?: string;
}

export interface TicketTransfer {
  id: string;
  ticketId: string;
  senderId: string;
  recipientEmail: string;
  recipientId?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  createdAt: string;
  updatedAt?: string;
  expiresAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  phone?: string | null;
  location?: string | null;
  bio?: string | null;
  createdAt?: string;
  lastSignInAt?: string;
  firstName?: string;
  lastName?: string;
}

export interface UserSettings {
  userId: string;
  language: string;
  theme: 'light' | 'dark';
  currency: string;
}

export interface NotificationPreferences {
  userId: string;
  email: boolean;
  push: boolean;
  types: string[];
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: string;
  provider: string;
  last4: string;
  expiryDate: string;
  isDefault: boolean;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  userId: string;
  isStaff: boolean;
  message: string;
  createdAt: string;
}

export interface NewsletterSubscription {
  email: string;
  createdAt: string;
  preferences?: {
    events?: boolean;
    promotions?: boolean;
    news?: boolean;
  };
}