import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ticket, ValidationEvent } from '@/types';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { useAuthStore } from './auth-store';

interface TicketsState {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  isLoading: boolean;
  error: string | null;
  
  fetchTickets: () => Promise<void>;
  fetchTicketById: (id: string) => Promise<void>;
  fetchValidationHistory: (ticketId: string) => Promise<ValidationEvent[]>;
  purchaseTicket: (eventId: string, ticketTypeId: string) => Promise<Ticket>;
  transferTicket: (ticketId: string, recipientEmail: string) => Promise<void>;
}

export const useTicketsStore = create<TicketsState>()(
  persist(
    (set, get) => ({
      tickets: [],
      selectedTicket: null,
      isLoading: false,
      error: null,
      
      fetchTickets: async () => {
        set({ isLoading: true, error: null });
        try {
          // Get current user
          const { user } = useAuthStore.getState();
          
          if (!user) {
            throw new Error('Utilisateur non connecté');
          }
          
          console.log('Fetching tickets for user:', user.id);
          
          // Fetch tickets from Supabase with proper joins to events and ticket_types tables
          // Note: Using location instead of venue since venue doesn't exist in the schema
          const { data, error } = await supabase
            .from('tickets')
            .select(`
              id,
              event_id,
              status,
              qr_code,
              created_at,
              scanned_at,
              scanned_by,
              scan_location,
              event:events (
                title,
                date,
                time,
                location,
                currency,
                image_url
              ),
              ticket_type:ticket_types (
                name,
                price
              )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          if (error) {
            console.error('Supabase error details:', JSON.stringify(error, null, 2));
            throw error;
          }
          
          console.log('Tickets fetched successfully, count:', data?.length || 0);
          
          // Transform data to match our Ticket type
          const tickets: Ticket[] = data.map(item => {
            // Ensure all required properties exist
            if (!item.event || !item.ticket_type) {
              console.warn('Missing related data for ticket:', item.id);
              return null;
            }
            
            return {
              id: item.id,
              eventId: item.event_id,
              eventTitle: item.event.title,
              eventDate: item.event.date,
              eventTime: item.event.time,
              eventLocation: item.event.location,
              // Use location as venue since there's no venue column
              eventVenue: item.event.location,
              ticketType: item.ticket_type.name,
              price: item.ticket_type.price,
              currency: item.event.currency || 'XOF', // Get currency from events table
              purchaseDate: new Date(item.created_at).toISOString().split('T')[0],
              qrCode: item.qr_code,
              used: item.status === 'USED',
              status: item.status || 'VALID',
              scannedAt: item.scanned_at,
              scannedBy: item.scanned_by,
              scanLocation: item.scan_location
            };
          }).filter(Boolean); // Remove any null entries
          
          set({ tickets, isLoading: false });
        } catch (error) {
          console.error('Error fetching tickets:', error);
          set({ error: handleSupabaseError(error), isLoading: false });
        }
      },
      
      fetchTicketById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          // First check if we already have the ticket in our state
          const existingTicket = get().tickets.find(ticket => ticket.id === id);
          
          if (existingTicket) {
            // Even if we have the ticket, we still need to fetch validation history
            const validationHistory = await get().fetchValidationHistory(id);
            
            set({ 
              selectedTicket: { ...existingTicket, validationHistory }, 
              isLoading: false 
            });
            return;
          }
          
          console.log('Fetching ticket by ID:', id);
          
          // If not, fetch from Supabase with proper joins to events and ticket_types tables
          // Note: Using location instead of venue since venue doesn't exist in the schema
          const { data, error } = await supabase
            .from('tickets')
            .select(`
              id,
              event_id,
              status,
              qr_code,
              created_at,
              scanned_at,
              scanned_by,
              scan_location,
              event:events (
                title,
                date,
                time,
                location,
                currency,
                image_url
              ),
              ticket_type:ticket_types (
                name,
                price
              )
            `)
            .eq('id', id)
            .single();
          
          if (error) {
            console.error('Supabase error details:', JSON.stringify(error, null, 2));
            throw error;
          }
          
          // Ensure all required properties exist
          if (!data.event || !data.ticket_type) {
            throw new Error('Données de billet incomplètes');
          }
          
          // Fetch validation history for this ticket
          const validationHistory = await get().fetchValidationHistory(id);
          
          // Transform to match our Ticket type
          const ticket: Ticket = {
            id: data.id,
            eventId: data.event_id,
            eventTitle: data.event.title,
            eventDate: data.event.date,
            eventTime: data.event.time,
            eventLocation: data.event.location,
            // Use location as venue since there's no venue column
            eventVenue: data.event.location,
            ticketType: data.ticket_type.name,
            price: data.ticket_type.price,
            currency: data.event.currency || 'XOF', // Get currency from events table
            purchaseDate: new Date(data.created_at).toISOString().split('T')[0],
            qrCode: data.qr_code,
            used: data.status === 'USED',
            status: data.status || 'VALID',
            scannedAt: data.scanned_at,
            scannedBy: data.scanned_by,
            scanLocation: data.scan_location,
            validationHistory
          };
          
          set({ selectedTicket: ticket, isLoading: false });
        } catch (error) {
          console.error('Error fetching ticket by ID:', error);
          set({ error: handleSupabaseError(error), isLoading: false });
        }
      },
      
      fetchValidationHistory: async (ticketId: string): Promise<ValidationEvent[]> => {
        try {
          console.log('Fetching validation history for ticket:', ticketId);
          
          // Try to fetch validation history from ticket_validations table if it exists
          try {
            const { data, error } = await supabase
              .from('ticket_validations')
              .select('*')
              .eq('ticket_id', ticketId)
              .order('created_at', { ascending: true });
            
            if (error) {
              // If table doesn't exist or other error, fall back to ticket data
              console.log('Error fetching from ticket_validations, using fallback:', error.message);
              throw error;
            }
            
            if (data && data.length > 0) {
              return data.map(item => ({
                id: item.id,
                ticketId: item.ticket_id,
                status: item.status,
                timestamp: item.created_at,
                success: item.success,
                location: item.location,
                operatorId: item.operator_id,
                operatorName: item.operator_name,
                deviceId: item.device_id
              }));
            }
          } catch (validationError) {
            console.log('Validation history table error, using ticket data instead');
          }
          
          // Fetch the ticket to get validation data
          const { data, error } = await supabase
            .from('tickets')
            .select('*')
            .eq('id', ticketId)
            .single();
          
          if (error) {
            console.error('Error fetching ticket for validation history:', error);
            return generateValidationHistory(ticketId);
          }
          
          const validationEvents: ValidationEvent[] = [];
          
          // Always add ticket issuance event
          validationEvents.push({
            id: '1',
            ticketId: ticketId,
            status: 'Billet émis',
            timestamp: data.created_at,
            success: true
          });
          
          // Add scan event if available
          if (data.scanned_at) {
            validationEvents.push({
              id: '2',
              ticketId: ticketId,
              status: 'Entrée accordée',
              timestamp: data.scanned_at,
              success: true,
              location: data.scan_location,
              operatorId: data.scanned_by
            });
          }
          
          // If we have validation events, return them
          if (validationEvents.length > 0) {
            return validationEvents;
          }
          
          // If no validation events found, generate default ones
          return generateValidationHistory(ticketId);
        } catch (error) {
          console.error('Error in fetchValidationHistory:', error);
          // Return default validation events in case of error
          return generateValidationHistory(ticketId);
        }
      },
      
      purchaseTicket: async (eventId: string, ticketTypeId: string) => {
        set({ isLoading: true, error: null });
        try {
          // Get current user
          const { user } = useAuthStore.getState();
          
          if (!user) {
            throw new Error('Utilisateur non connecté');
          }
          
          // First check if the ticket type is available
          const { data: ticketTypeData, error: ticketTypeError } = await supabase
            .from('ticket_types')
            .select(`
              *,
              event:events (
                title,
                date,
                time,
                location,
                currency
              )
            `)
            .eq('id', ticketTypeId)
            .single();
          
          if (ticketTypeError) {
            console.error('Ticket type error:', JSON.stringify(ticketTypeError, null, 2));
            throw ticketTypeError;
          }
          
          if (ticketTypeData.available <= 0) {
            throw new Error('Ce type de billet n\'est plus disponible');
          }
          
          // Generate QR code (in a real app, this would be more secure)
          const qrCode = `${ticketTypeData.event.title.substring(0, 4).toUpperCase()}-${ticketTypeData.name.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 100000)}`;
          
          // Create an order first - FIXED: using 'total' instead of 'total_amount'
          const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert([
              {
                user_id: user.id,
                event_id: eventId,
                total: ticketTypeData.price, // FIXED: Changed from total_amount to total
                status: 'COMPLETED',
                payment_method: 'CARD'
              }
            ])
            .select()
            .single();
          
          if (orderError) {
            console.error('Order creation error:', JSON.stringify(orderError, null, 2));
            throw orderError;
          }
          
          // Insert ticket into database
          const { data, error } = await supabase
            .from('tickets')
            .insert([
              {
                user_id: user.id,
                event_id: eventId,
                ticket_type_id: ticketTypeId,
                order_id: orderData.id,
                qr_code: qrCode,
                status: 'VALID',
                created_at: new Date().toISOString()
              }
            ])
            .select()
            .single();
          
          if (error) {
            console.error('Ticket creation error:', JSON.stringify(error, null, 2));
            throw error;
          }
          
          // Update available tickets count
          const { error: updateError } = await supabase
            .from('ticket_types')
            .update({
              available: ticketTypeData.available - 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', ticketTypeId);
          
          if (updateError) {
            console.error('Ticket type update error:', JSON.stringify(updateError, null, 2));
            throw updateError;
          }
          
          // Create ticket object
          const newTicket: Ticket = {
            id: data.id,
            eventId: eventId,
            eventTitle: ticketTypeData.event.title,
            eventDate: ticketTypeData.event.date,
            eventTime: ticketTypeData.event.time,
            eventLocation: ticketTypeData.event.location,
            // Use location as venue since there's no venue column
            eventVenue: ticketTypeData.event.location,
            ticketType: ticketTypeData.name,
            price: ticketTypeData.price,
            currency: ticketTypeData.event.currency || 'XOF',
            purchaseDate: new Date().toISOString().split('T')[0],
            qrCode: qrCode,
            used: false,
            status: 'VALID',
            validationHistory: [
              {
                id: '1',
                ticketId: data.id,
                status: 'Billet émis',
                timestamp: new Date().toISOString(),
                success: true
              }
            ]
          };
          
          set({ 
            tickets: [...get().tickets, newTicket],
            selectedTicket: newTicket,
            isLoading: false 
          });
          
          return newTicket;
        } catch (error) {
          console.error('Error purchasing ticket:', error);
          set({ error: handleSupabaseError(error), isLoading: false });
          throw error;
        }
      },
      
      transferTicket: async (ticketId: string, recipientEmail: string) => {
        set({ isLoading: true, error: null });
        try {
          // Get current user
          const { user } = useAuthStore.getState();
          
          if (!user) {
            throw new Error('Utilisateur non connecté');
          }
          
          // First check if the ticket exists and belongs to the current user
          const { data: ticketData, error: ticketError } = await supabase
            .from('tickets')
            .select('*')
            .eq('id', ticketId)
            .eq('user_id', user.id)
            .single();
          
          if (ticketError) {
            console.error('Ticket fetch error:', JSON.stringify(ticketError, null, 2));
            throw new Error('Billet introuvable ou vous n\'êtes pas autorisé à le transférer');
          }
          
          // Check if the ticket is in a transferable state
          if (ticketData.status !== 'VALID') {
            throw new Error('Ce billet ne peut pas être transféré dans son état actuel');
          }
          
          // Check if the recipient exists in the system
          const { data: recipientData, error: recipientError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', recipientEmail)
            .maybeSingle();
          
          // Create a transfer record
          const now = new Date().toISOString();
          const { data: transferData, error: transferError } = await supabase
            .from('ticket_transfers')
            .insert([
              {
                ticket_id: ticketId,
                sender_id: user.id,
                recipient_email: recipientEmail,
                recipient_id: recipientData?.id || null,
                status: 'PENDING',
                created_at: now,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days expiry
              }
            ])
            .select()
            .single();
          
          if (transferError) {
            console.error('Transfer creation error:', JSON.stringify(transferError, null, 2));
            throw transferError;
          }
          
          // Update ticket status to TRANSFER_PENDING
          const { error: updateError } = await supabase
            .from('tickets')
            .update({
              status: 'TRANSFER_PENDING',
              updated_at: now
            })
            .eq('id', ticketId);
          
          if (updateError) {
            console.error('Ticket update error:', JSON.stringify(updateError, null, 2));
            throw updateError;
          }
          
          // Update local state
          const tickets = get().tickets.map(ticket => 
            ticket.id === ticketId 
              ? { ...ticket, status: 'TRANSFER_PENDING' } 
              : ticket
          );
          
          const selectedTicket = get().selectedTicket;
          if (selectedTicket && selectedTicket.id === ticketId) {
            const updatedValidationHistory = [
              ...(selectedTicket.validationHistory || []),
              {
                id: Date.now().toString(),
                ticketId,
                status: `Transfert initié vers ${recipientEmail}`,
                timestamp: now,
                success: true
              }
            ];
            
            set({ 
              tickets,
              selectedTicket: { 
                ...selectedTicket, 
                status: 'TRANSFER_PENDING',
                validationHistory: updatedValidationHistory
              },
              isLoading: false 
            });
          } else {
            set({ tickets, isLoading: false });
          }
          
          // In a real app, we would send an email to the recipient here
          console.log(`Transfer initiated for ticket ${ticketId} to ${recipientEmail}`);
          
        } catch (error) {
          console.error('Error transferring ticket:', error);
          set({ error: handleSupabaseError(error), isLoading: false });
          throw error;
        }
      }
    }),
    {
      name: 'afritix-tickets-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Helper function to generate validation history when real data is not available
function generateValidationHistory(ticketId: string): ValidationEvent[] {
  const ticket = useTicketsStore.getState().tickets.find(t => t.id === ticketId);
  
  if (!ticket) {
    return [
      {
        id: '1',
        ticketId,
        status: 'Billet émis',
        timestamp: new Date().toISOString(),
        success: true
      }
    ];
  }
  
  // Generate validation history based on ticket purchase date
  const purchaseDate = new Date(ticket.purchaseDate);
  
  // First event: Ticket issued (same as purchase date)
  const events: ValidationEvent[] = [
    {
      id: '1',
      ticketId,
      status: 'Billet émis',
      timestamp: formatDateTime(purchaseDate),
      success: true
    }
  ];
  
  // Second event: Ticket verified (2 days after purchase)
  const verificationDate = new Date(purchaseDate);
  verificationDate.setDate(verificationDate.getDate() + 2);
  verificationDate.setHours(9, 15, 0, 0);
  
  if (verificationDate <= new Date()) {
    events.push({
      id: '2',
      ticketId,
      status: 'Billet vérifié',
      timestamp: formatDateTime(verificationDate),
      success: true
    });
  }
  
  // Third event: Entry granted (4 days after purchase)
  const entryDate = new Date(purchaseDate);
  entryDate.setDate(entryDate.getDate() + 4);
  entryDate.setHours(18, 45, 0, 0);
  
  if (entryDate <= new Date() && ticket.status === 'USED') {
    events.push({
      id: '3',
      ticketId,
      status: 'Entrée accordée',
      timestamp: formatDateTime(entryDate),
      success: true
    });
  }
  
  return events;
}

// Helper function to format date and time
function formatDateTime(date: Date): string {
  return date.toISOString();
}