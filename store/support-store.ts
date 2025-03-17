import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { SupportTicket, SupportMessage } from '@/types';

interface SupportState {
  tickets: SupportTicket[];
  currentTicket: SupportTicket | null;
  messages: SupportMessage[];
  isLoading: boolean;
  error: string | null;
  
  fetchTickets: () => Promise<void>;
  fetchTicketById: (id: string) => Promise<SupportTicket | null>;
  fetchTicketMessages: (ticketId: string) => Promise<void>;
  createTicket: (ticket: Partial<SupportTicket>, message: string) => Promise<SupportTicket | null>;
  sendMessage: (ticketId: string, content: string) => Promise<SupportMessage | null>;
  updateTicketStatus: (ticketId: string, status: SupportTicket['status']) => Promise<void>;
  clearError: () => void;
}

export const useSupportStore = create<SupportState>()(
  persist(
    (set, get) => ({
      tickets: [],
      currentTicket: null,
      messages: [],
      isLoading: false,
      error: null,
      
      fetchTickets: async () => {
        // Fix: Properly handle the auth response structure
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        set({ isLoading: true, error: null });
        try {
          console.log('Fetching tickets for user:', user.id);
          
          const { data, error } = await supabase
            .from('support_tickets')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          
          const tickets: SupportTicket[] = data.map(ticket => ({
            id: ticket.id,
            userId: ticket.user_id,
            subject: ticket.subject,
            category: ticket.category,
            priority: ticket.priority,
            status: ticket.status,
            createdAt: ticket.created_at,
            updatedAt: ticket.updated_at,
          }));
          
          console.log(`Fetched ${tickets.length} tickets`);
          set({ tickets, isLoading: false });
        } catch (error) {
          console.error('Error fetching tickets:', error);
          set({ error: handleSupabaseError(error), isLoading: false });
        }
      },
      
      fetchTicketById: async (id: string) => {
        // Fix: Properly handle the auth response structure
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        
        set({ isLoading: true, error: null });
        try {
          console.log('Fetching ticket details for ID:', id);
          
          const { data, error } = await supabase
            .from('support_tickets')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();
          
          if (error) throw error;
          
          const ticket: SupportTicket = {
            id: data.id,
            userId: data.user_id,
            subject: data.subject,
            category: data.category,
            priority: data.priority,
            status: data.status,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
          
          console.log('Fetched ticket details:', ticket.subject);
          set({ currentTicket: ticket, isLoading: false });
          
          // Also fetch messages for this ticket
          await get().fetchTicketMessages(id);
          
          return ticket;
        } catch (error) {
          console.error('Error fetching ticket details:', error);
          set({ error: handleSupabaseError(error), isLoading: false });
          return null;
        }
      },
      
      fetchTicketMessages: async (ticketId: string) => {
        // Fix: Properly handle the auth response structure
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        set({ isLoading: true, error: null });
        try {
          console.log('Fetching messages for ticket:', ticketId);
          
          const { data, error } = await supabase
            .from('support_messages')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true });
          
          if (error) throw error;
          
          const messages: SupportMessage[] = data.map(message => ({
            id: message.id,
            ticketId: message.ticket_id,
            senderId: message.sender_id,
            senderType: message.sender_type,
            content: message.content,
            createdAt: message.created_at,
          }));
          
          console.log(`Fetched ${messages.length} messages`);
          set({ messages, isLoading: false });
        } catch (error) {
          console.error('Error fetching messages:', error);
          set({ error: handleSupabaseError(error), isLoading: false });
        }
      },
      
      createTicket: async (ticketData: Partial<SupportTicket>, initialMessage: string) => {
        // Fix: Properly handle the auth response structure
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        
        set({ isLoading: true, error: null });
        try {
          console.log('Creating new support ticket');
          
          // First, create the ticket
          const { data: ticketResult, error: ticketError } = await supabase
            .from('support_tickets')
            .insert([
              {
                user_id: user.id,
                subject: ticketData.subject,
                category: ticketData.category,
                priority: ticketData.priority || 'MEDIUM',
                status: 'OPEN',
              }
            ])
            .select()
            .single();
          
          if (ticketError) throw ticketError;
          
          console.log('Ticket created with ID:', ticketResult.id);
          
          // Then, add the initial message
          const { data: messageResult, error: messageError } = await supabase
            .from('support_messages')
            .insert([
              {
                ticket_id: ticketResult.id,
                sender_id: user.id,
                sender_type: 'USER',
                content: initialMessage,
              }
            ])
            .select()
            .single();
          
          if (messageError) throw messageError;
          
          console.log('Initial message added to ticket');
          
          const newTicket: SupportTicket = {
            id: ticketResult.id,
            userId: ticketResult.user_id,
            subject: ticketResult.subject,
            category: ticketResult.category,
            priority: ticketResult.priority,
            status: ticketResult.status,
            createdAt: ticketResult.created_at,
            updatedAt: ticketResult.updated_at,
          };
          
          // Update the tickets list with the new ticket
          set(state => ({ 
            tickets: [newTicket, ...state.tickets],
            currentTicket: newTicket,
            isLoading: false 
          }));
          
          return newTicket;
        } catch (error) {
          console.error('Error creating ticket:', error);
          set({ error: handleSupabaseError(error), isLoading: false });
          return null;
        }
      },
      
      sendMessage: async (ticketId: string, content: string) => {
        // Fix: Properly handle the auth response structure
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        
        set({ isLoading: true, error: null });
        try {
          console.log('Sending message to ticket:', ticketId);
          
          const { data, error } = await supabase
            .from('support_messages')
            .insert([
              {
                ticket_id: ticketId,
                sender_id: user.id,
                sender_type: 'USER',
                content: content,
              }
            ])
            .select()
            .single();
          
          if (error) throw error;
          
          console.log('Message sent successfully');
          
          const newMessage: SupportMessage = {
            id: data.id,
            ticketId: data.ticket_id,
            senderId: data.sender_id,
            senderType: data.sender_type,
            content: data.content,
            createdAt: data.created_at,
          };
          
          // Update the messages list with the new message
          set(state => ({ 
            messages: [...state.messages, newMessage],
            isLoading: false 
          }));
          
          // Also update the ticket's updated_at timestamp
          await supabase
            .from('support_tickets')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', ticketId);
          
          return newMessage;
        } catch (error) {
          console.error('Error sending message:', error);
          set({ error: handleSupabaseError(error), isLoading: false });
          return null;
        }
      },
      
      updateTicketStatus: async (ticketId: string, status: SupportTicket['status']) => {
        set({ isLoading: true, error: null });
        try {
          console.log(`Updating ticket ${ticketId} status to ${status}`);
          
          const { error } = await supabase
            .from('support_tickets')
            .update({ 
              status: status,
              updated_at: new Date().toISOString()
            })
            .eq('id', ticketId);
          
          if (error) throw error;
          
          console.log('Ticket status updated successfully');
          
          // Update the current ticket and tickets list
          set(state => {
            const updatedTicket = state.currentTicket 
              ? { ...state.currentTicket, status, updatedAt: new Date().toISOString() }
              : null;
              
            const updatedTickets = state.tickets.map(ticket => 
              ticket.id === ticketId 
                ? { ...ticket, status, updatedAt: new Date().toISOString() }
                : ticket
            );
            
            return { 
              currentTicket: updatedTicket,
              tickets: updatedTickets,
              isLoading: false 
            };
          });
        } catch (error) {
          console.error('Error updating ticket status:', error);
          set({ error: handleSupabaseError(error), isLoading: false });
        }
      },
      
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'afritix-support-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        tickets: state.tickets,
        // Don't persist loading states or errors
      }),
    }
  )
);