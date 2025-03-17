import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { 
  Send, 
  AlertCircle, 
  Clock, 
  CheckCircle2,
  User,
  MessageSquare
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useSupportStore } from '@/store/support-store';
import { Button } from '@/components/Button';

export default function TicketDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { 
    currentTicket, 
    messages, 
    fetchTicketById, 
    sendMessage, 
    updateTicketStatus,
    isLoading, 
    error, 
    clearError 
  } = useSupportStore();
  
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Initial fetch of ticket details
  useEffect(() => {
    if (id) {
      fetchTicketById(id);
    }
  }, [id]);
  
  // Show error if there is one
  useEffect(() => {
    if (error) {
      Alert.alert('Erreur', error, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error]);
  
  const onRefresh = useCallback(async () => {
    if (!id) return;
    
    setRefreshing(true);
    try {
      await fetchTicketById(id);
    } catch (err) {
      console.error('Error refreshing ticket details:', err);
    } finally {
      setRefreshing(false);
    }
  }, [id, fetchTicketById]);
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentTicket) return;
    
    setIsSending(true);
    try {
      await sendMessage(currentTicket.id, newMessage.trim());
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer.');
    } finally {
      setIsSending(false);
    }
  };
  
  const handleCloseTicket = async () => {
    if (!currentTicket) return;
    
    Alert.alert(
      'Fermer le ticket',
      'Êtes-vous sûr de vouloir fermer ce ticket ? Cette action est irréversible.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Fermer',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateTicketStatus(currentTicket.id, 'CLOSED');
              Alert.alert('Succès', 'Le ticket a été fermé avec succès.');
            } catch (err) {
              console.error('Error closing ticket:', err);
              Alert.alert('Erreur', 'Une erreur est survenue lors de la fermeture du ticket. Veuillez réessayer.');
            }
          },
        },
      ]
    );
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return colors.warning;
      case 'IN_PROGRESS':
        return colors.info;
      case 'RESOLVED':
        return colors.success;
      case 'CLOSED':
        return colors.textMuted;
      default:
        return colors.textSecondary;
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <AlertCircle size={20} color={getStatusColor(status)} />;
      case 'IN_PROGRESS':
        return <Clock size={20} color={getStatusColor(status)} />;
      case 'RESOLVED':
      case 'CLOSED':
        return <CheckCircle2 size={20} color={getStatusColor(status)} />;
      default:
        return null;
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'Ouvert';
      case 'IN_PROGRESS':
        return 'En cours';
      case 'RESOLVED':
        return 'Résolu';
      case 'CLOSED':
        return 'Fermé';
      default:
        return status;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen options={{ 
          title: 'Détails du ticket',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerShadowVisible: false
        }} />
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Chargement des détails...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!currentTicket) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen options={{ 
          title: 'Détails du ticket',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerShadowVisible: false
        }} />
        
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={colors.error} />
          <Text style={styles.errorTitle}>Ticket introuvable</Text>
          <Text style={styles.errorMessage}>
            Le ticket que vous recherchez n'existe pas ou a été supprimé.
          </Text>
          <Button
            title="Retour aux tickets"
            onPress={() => router.push('/profile/support')}
            variant="primary"
            style={styles.backButton}
          />
        </View>
      </SafeAreaView>
    );
  }
  
  const canReply = currentTicket.status !== 'CLOSED';
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'Détails du ticket',
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerShadowVisible: false
      }} />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.content}>
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketSubject}>{currentTicket.subject}</Text>
            <View style={styles.ticketMeta}>
              <View style={styles.statusContainer}>
                {getStatusIcon(currentTicket.status)}
                <Text style={[styles.statusText, { color: getStatusColor(currentTicket.status) }]}>
                  {getStatusText(currentTicket.status)}
                </Text>
              </View>
              <Text style={styles.ticketDate}>
                Créé le {formatDate(currentTicket.createdAt)}
              </Text>
            </View>
          </View>
          
          <ScrollView 
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          >
            {messages.length === 0 ? (
              <View style={styles.emptyMessagesContainer}>
                <Text style={styles.emptyMessagesText}>
                  Chargement des messages...
                </Text>
              </View>
            ) : (
              messages.map((message) => (
                <View 
                  key={message.id}
                  style={[
                    styles.messageItem,
                    message.senderType === 'USER' ? styles.userMessage : styles.supportMessage
                  ]}
                >
                  <View style={styles.messageHeader}>
                    <View style={styles.senderInfo}>
                      {message.senderType === 'USER' ? (
                        <User size={16} color={colors.primary} />
                      ) : (
                        <MessageSquare size={16} color={colors.secondary} />
                      )}
                      <Text style={styles.senderName}>
                        {message.senderType === 'USER' ? 'Vous' : 'Support AfriTix'}
                      </Text>
                    </View>
                    <Text style={styles.messageTime}>
                      {formatDate(message.createdAt)}
                    </Text>
                  </View>
                  <Text style={styles.messageContent}>{message.content}</Text>
                </View>
              ))
            )}
          </ScrollView>
          
          {canReply ? (
            <View style={styles.replyContainer}>
              <TextInput
                style={styles.replyInput}
                placeholder="Écrivez votre message..."
                placeholderTextColor={colors.textMuted}
                value={newMessage}
                onChangeText={setNewMessage}
                multiline
                maxLength={500}
              />
              <TouchableOpacity 
                style={[
                  styles.sendButton,
                  (!newMessage.trim() || isSending) && styles.sendButtonDisabled
                ]}
                onPress={handleSendMessage}
                disabled={!newMessage.trim() || isSending}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Send size={20} color={colors.white} />
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.closedTicketMessage}>
              <Text style={styles.closedTicketText}>
                Ce ticket est fermé. Vous ne pouvez plus y répondre.
              </Text>
              <Button
                title="Créer un nouveau ticket"
                onPress={() => router.push('/profile/support/new')}
                variant="outline"
                size="small"
                style={styles.newTicketButton}
              />
            </View>
          )}
          
          {canReply && (
            <View style={styles.actionContainer}>
              <Button
                title="Fermer le ticket"
                onPress={handleCloseTicket}
                variant="outline"
                size="small"
                style={styles.closeTicketButton}
              />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    minWidth: 200,
  },
  ticketHeader: {
    backgroundColor: colors.card,
    padding: 16,
  },
  ticketSubject: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  ticketMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    marginLeft: 4,
  },
  ticketDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messagesContent: {
    padding: 16,
    minHeight: '100%',
  },
  emptyMessagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyMessagesText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  messageItem: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    maxWidth: '85%',
  },
  userMessage: {
    backgroundColor: colors.primary + '20',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  supportMessage: {
    backgroundColor: colors.card,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  senderName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 4,
  },
  messageTime: {
    fontSize: 10,
    color: colors.textMuted,
  },
  messageContent: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  replyContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  replyInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingRight: 48,
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.primary + '50',
  },
  closedTicketMessage: {
    padding: 16,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  closedTicketText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  newTicketButton: {
    minWidth: 200,
  },
  actionContainer: {
    padding: 16,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  closeTicketButton: {
    alignSelf: 'center',
    minWidth: 200,
  },
});