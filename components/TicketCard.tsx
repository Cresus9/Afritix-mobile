import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Clock, MapPin, Ticket as TicketIcon, Shield } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ticket } from '@/types';
import { colors } from '@/constants/colors';

interface TicketCardProps {
  ticket: Ticket;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const router = useRouter();
  
  const handlePress = () => {
    router.push(`/ticket/${ticket.id}`);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  // Get background color based on ticket type
  const getTicketTypeColor = () => {
    if (!ticket.ticketType) return colors.primary;
    
    const ticketTypeLower = ticket.ticketType.toLowerCase();
    
    switch (ticketTypeLower) {
      case 'vip':
        return colors.secondary;
      case 'premium':
        return '#FF4081'; // Pink
      default:
        return colors.primary;
    }
  };
  
  // Get status badge color and text
  const getStatusBadge = () => {
    if (!ticket.status) return { color: colors.success + '33', text: 'Valide' };
    
    switch (ticket.status) {
      case 'USED':
        return { color: colors.textMuted + '33', text: 'Utilisé' };
      case 'CANCELLED':
        return { color: colors.error + '33', text: 'Annulé' };
      case 'TRANSFERRED':
        return { color: colors.info + '33', text: 'Transféré' };
      case 'VALID':
      default:
        return { color: colors.success + '33', text: 'Valide' };
    }
  };
  
  const statusBadge = getStatusBadge();
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[colors.card, colors.cardLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <View style={styles.header}>
          <View style={[styles.ticketTypeBadge, { backgroundColor: getTicketTypeColor() }]}>
            <Text style={styles.ticketType}>{ticket.ticketType}</Text>
          </View>
          <View style={styles.securityBadge}>
            <Shield size={12} color={colors.text} />
            <Text style={styles.securityText}>Sécurisé</Text>
          </View>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>{ticket.eventTitle}</Text>
          
          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Calendar size={16} color={colors.textSecondary} />
              <Text style={styles.detailText}>{formatDate(ticket.eventDate)}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Clock size={16} color={colors.textSecondary} />
              <Text style={styles.detailText}>{ticket.eventTime}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <MapPin size={16} color={colors.textSecondary} />
              <Text style={styles.detailText}>{ticket.eventVenue}</Text>
            </View>
          </View>
          
          <View style={styles.ticketInfo}>
            <View style={styles.qrPreview}>
              <TicketIcon size={20} color={colors.primary} />
              <Text style={styles.ticketIdText}>{ticket.id.substring(0, 8)}...</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusBadge.color }]}>
              <Text style={styles.statusText}>{statusBadge.text}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.viewDetails}>Voir le billet</Text>
        </View>
        
        <View style={styles.leftCutout} />
        <View style={styles.rightCutout} />
        
        {/* Decorative elements */}
        <View style={styles.cornerDecoration1} />
        <View style={styles.cornerDecoration2} />
        <View style={styles.cornerDecoration3} />
        <View style={styles.cornerDecoration4} />
        
        {/* Ticket pattern */}
        <View style={styles.patternContainer}>
          {[...Array(5)].map((_, i) => (
            <View key={i} style={styles.patternLine} />
          ))}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  gradientContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  ticketTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ticketType: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  securityText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  details: {
    gap: 8,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginLeft: 8,
  },
  ticketInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qrPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ticketIdText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.cardLight,
  },
  viewDetails: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  leftCutout: {
    position: 'absolute',
    left: -12,
    top: '50%',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
    transform: [{ translateY: -12 }],
  },
  rightCutout: {
    position: 'absolute',
    right: -12,
    top: '50%',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
    transform: [{ translateY: -12 }],
  },
  // Decorative elements
  cornerDecoration1: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary + '40',
  },
  cornerDecoration2: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary + '40',
  },
  cornerDecoration3: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary + '40',
  },
  cornerDecoration4: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary + '40',
  },
  patternContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
    zIndex: -1,
  },
  patternLine: {
    position: 'absolute',
    width: '200%',
    height: 1,
    backgroundColor: colors.text,
    transform: [{ rotate: '45deg' }],
    left: -50,
    top: '20%',
  },
});