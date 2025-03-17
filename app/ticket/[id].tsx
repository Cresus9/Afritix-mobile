import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  Animated,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Share2,
  Download,
  Send,
  Info,
  Shield,
  CheckCircle,
  AlertCircle,
  User,
  ArrowLeft,
  Mail,
  X
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system';
import ViewShot from 'react-native-view-shot';
import { colors } from '@/constants/colors';
import { useTicketsStore } from '@/store/tickets-store';
import { QRCodeDisplay } from '@/components/QRCode';
import { Button } from '@/components/Button';
import { LoadingIndicator } from '@/components/LoadingIndicator';

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { selectedTicket, fetchTicketById, isLoading, transferTicket } = useTicketsStore();
  const [showValidationHistory, setShowValidationHistory] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isNewPurchase, setIsNewPurchase] = useState(false);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Refs for capturing ticket as image
  const ticketRef = useRef<ViewShot>(null);
  
  // Animation for the ticket
  const ticketAnimation = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (id) {
      fetchTicketById(id);
      
      // Check if this is a new purchase by comparing the purchase date with current date
      const checkIfNewPurchase = async () => {
        await fetchTicketById(id);
        const ticket = useTicketsStore.getState().selectedTicket;
        if (ticket) {
          const purchaseDate = new Date(ticket.purchaseDate);
          const now = new Date();
          // If purchased within the last 5 minutes, consider it a new purchase
          const isNew = (now.getTime() - purchaseDate.getTime()) < 5 * 60 * 1000;
          setIsNewPurchase(isNew);
        }
      };
      
      checkIfNewPurchase();
    }
    
    // Animate ticket entrance
    Animated.timing(ticketAnimation, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    
    // If it's a new purchase, show a success message
    if (isNewPurchase) {
      setTimeout(() => {
        Alert.alert(
          'Achat réussi!',
          'Votre billet a été acheté avec succès. Vous pouvez le présenter à l\'entrée de l\'événement.',
          [{ text: 'OK' }]
        );
      }, 1000);
    }
  }, [id, isNewPurchase]);
  
  const handleShare = async () => {
    if (!selectedTicket) return;
    
    try {
      await Share.share({
        title: `Billet pour ${selectedTicket.eventTitle}`,
        message: `Je vais à ${selectedTicket.eventTitle} le ${selectedTicket.eventDate} à ${selectedTicket.eventVenue}, ${selectedTicket.eventLocation}. Rejoins-moi!`,
        url: `https://afritix.com/tickets/${selectedTicket.id}`,
      });
    } catch (error) {
      console.error('Error sharing ticket:', error);
    }
  };
  
  const handleDownload = async () => {
    if (!selectedTicket || !ticketRef.current) return;
    
    try {
      setIsDownloading(true);
      
      // Capture the ticket as an image
      const uri = await ticketRef.current.capture();
      
      // Create a directory for tickets if it doesn't exist
      const ticketsDir = `${FileSystem.documentDirectory}tickets/`;
      const dirInfo = await FileSystem.getInfoAsync(ticketsDir);
      
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(ticketsDir, { intermediates: true });
      }
      
      // Generate a filename based on the event and ticket ID
      const eventName = selectedTicket.eventTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${eventName}_${selectedTicket.id.substring(0, 8)}.png`;
      const fileUri = `${ticketsDir}${filename}`;
      
      // Save the image to the file system
      await FileSystem.copyAsync({
        from: uri,
        to: fileUri
      });
      
      setIsDownloading(false);
      
      // Use React Native's built-in Share API
      await Share.share({
        title: `Billet pour ${selectedTicket.eventTitle}`,
        url: Platform.OS === 'ios' ? fileUri : uri,
        message: Platform.OS === 'android' ? `Billet pour ${selectedTicket.eventTitle}` : undefined,
      });
    } catch (error) {
      console.error('Error downloading ticket:', error);
      setIsDownloading(false);
      Alert.alert(
        'Erreur',
        'Une erreur s\'est produite lors du téléchargement du billet. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    }
  };
  
  const handleTransfer = () => {
    setTransferModalVisible(true);
  };
  
  const closeTransferModal = () => {
    setTransferModalVisible(false);
    setRecipientEmail('');
    setEmailError('');
  };
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const handleTransferSubmit = async () => {
    if (!selectedTicket) return;
    
    // Validate email
    if (!recipientEmail.trim()) {
      setEmailError('L\'adresse e-mail est requise');
      return;
    }
    
    if (!validateEmail(recipientEmail)) {
      setEmailError('Adresse e-mail invalide');
      return;
    }
    
    setEmailError('');
    setIsTransferring(true);
    
    try {
      // Call the transfer ticket function from the store
      await transferTicket(selectedTicket.id, recipientEmail);
      
      setIsTransferring(false);
      closeTransferModal();
      
      // Show success message
      Alert.alert(
        'Demande de transfert envoyée',
        `Une demande de transfert a été envoyée à ${recipientEmail}. Le destinataire devra accepter le transfert.`,
        [{ 
          text: 'OK',
          onPress: () => {
            // Navigate back to tickets list after successful transfer
            router.push('/tickets');
          }
        }]
      );
    } catch (error) {
      console.error('Error transferring ticket:', error);
      setIsTransferring(false);
      
      Alert.alert(
        'Erreur',
        'Une erreur s\'est produite lors du transfert du billet. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }) + ' ' + date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get background color based on ticket type
  const getTicketTypeColor = () => {
    if (!selectedTicket || !selectedTicket.ticketType) return colors.primary;
    
    const ticketTypeLower = selectedTicket.ticketType.toLowerCase();
    
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
    if (!selectedTicket || !selectedTicket.status) {
      return { color: colors.success + '33', text: 'Valide' };
    }
    
    switch (selectedTicket.status) {
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
  
  if (isLoading || !selectedTicket) {
    return <LoadingIndicator fullScreen message="Chargement des détails du billet..." />;
  }
  
  const translateY = ticketAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });
  
  const opacity = ticketAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  
  const statusBadge = getStatusBadge();
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'AfriTix',
          headerTitleAlign: 'center',
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={handleShare}
              >
                <Share2 size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          ),
          // Show a back button that goes to tickets list for new purchases
          headerLeft: () => isNewPurchase ? (
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => router.push('/tickets')}
            >
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ) : undefined
        }}
      />
      
      {isNewPurchase && (
        <View style={styles.successBanner}>
          <CheckCircle size={20} color={colors.background} />
          <Text style={styles.successText}>Achat réussi!</Text>
        </View>
      )}
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.content,
            {
              transform: [{ translateY }],
              opacity
            }
          ]}
        >
          <ViewShot 
            ref={ticketRef} 
            options={{ format: 'png', quality: 0.9 }}
            style={styles.ticketContainer}
          >
            <LinearGradient
              colors={[colors.card, colors.cardLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ticketGradient}
            >
              {/* Ticket header with event title and status */}
              <View style={styles.ticketHeader}>
                <View style={styles.eventTitleContainer}>
                  <Text style={styles.eventTitle}>{selectedTicket.eventTitle}</Text>
                  <View style={styles.securityBadge}>
                    <Shield size={12} color={colors.text} />
                    <Text style={styles.securityText}>Sécurisé</Text>
                  </View>
                </View>
                
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: statusBadge.color }
                ]}>
                  <Text style={styles.statusText}>{statusBadge.text}</Text>
                </View>
              </View>
              
              {/* Ticket type and price */}
              <View style={styles.ticketTypeContainer}>
                <View style={[styles.ticketTypeBadge, { backgroundColor: getTicketTypeColor() }]}>
                  <Text style={styles.ticketTypeText}>{selectedTicket.ticketType}</Text>
                </View>
                <Text style={styles.ticketPrice}>
                  {selectedTicket.price.toLocaleString()} {selectedTicket.currency}
                </Text>
              </View>
              
              {/* QR Code section */}
              <View style={styles.qrContainer}>
                <QRCodeDisplay value={selectedTicket.id} size={220} />
                <Text style={styles.qrText}>{selectedTicket.id}</Text>
                <Text style={styles.qrHint}>Présentez ce code à l'entrée de l'événement</Text>
              </View>
              
              {/* Ticket details */}
              <View style={styles.detailsContainer}>
                <View style={styles.detailsHeader}>
                  <Text style={styles.detailsTitle}>Détails de l'événement</Text>
                </View>
                
                <View style={styles.detailsContent}>
                  <View style={styles.detailItem}>
                    <Calendar size={20} color={colors.primary} />
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailLabel}>Date</Text>
                      <Text style={styles.detailText}>{formatDate(selectedTicket.eventDate)}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Clock size={20} color={colors.primary} />
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailLabel}>Heure</Text>
                      <Text style={styles.detailText}>{selectedTicket.eventTime}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <MapPin size={20} color={colors.primary} />
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailLabel}>Lieu</Text>
                      <Text style={styles.detailText}>{selectedTicket.eventVenue}, {selectedTicket.eventLocation}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <User size={20} color={colors.primary} />
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailLabel}>Participant</Text>
                      <Text style={styles.detailText}>John Doe</Text>
                    </View>
                  </View>
                </View>
              </View>
              
              {/* Validation history collapsible section */}
              <View style={styles.collapsibleSection}>
                <TouchableOpacity 
                  style={styles.collapsibleHeader}
                  onPress={() => setShowValidationHistory(!showValidationHistory)}
                >
                  <Text style={styles.collapsibleTitle}>Historique de validation</Text>
                  <Text style={styles.collapsibleToggle}>
                    {showValidationHistory ? 'Masquer' : 'Afficher'}
                  </Text>
                </TouchableOpacity>
                
                {showValidationHistory && (
                  <View style={styles.validationHistory}>
                    {selectedTicket.validationHistory && selectedTicket.validationHistory.length > 0 ? (
                      selectedTicket.validationHistory.map((item, index) => (
                        <View key={index} style={styles.validationItem}>
                          {item.success ? (
                            <CheckCircle size={16} color={colors.success} />
                          ) : (
                            <AlertCircle size={16} color={colors.error} />
                          )}
                          <Text style={styles.validationText}>{item.status}</Text>
                          <Text style={styles.validationDate}>{formatDateTime(item.timestamp)}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noValidationText}>
                        Aucun historique de validation disponible
                      </Text>
                    )}
                  </View>
                )}
              </View>
              
              {/* Terms and conditions collapsible section */}
              <View style={styles.collapsibleSection}>
                <TouchableOpacity 
                  style={styles.collapsibleHeader}
                  onPress={() => setShowTerms(!showTerms)}
                >
                  <Text style={styles.collapsibleTitle}>Conditions générales</Text>
                  <Text style={styles.collapsibleToggle}>
                    {showTerms ? 'Masquer' : 'Afficher'}
                  </Text>
                </TouchableOpacity>
                
                {showTerms && (
                  <View style={styles.termsContainer}>
                    <Text style={styles.termsText}>
                      • Ce billet n'est valable que pour l'événement et la date spécifiés.
                    </Text>
                    <Text style={styles.termsText}>
                      • Le détenteur du billet doit se conformer à toutes les règles du lieu.
                    </Text>
                    <Text style={styles.termsText}>
                      • Pas de remboursement ni d'échange sauf si requis par la loi.
                    </Text>
                    <Text style={styles.termsText}>
                      • L'organisateur se réserve le droit de refuser l'entrée.
                    </Text>
                    <Text style={styles.termsText}>
                      • La reproduction non autorisée de ce billet est interdite.
                    </Text>
                  </View>
                )}
              </View>
              
              {/* Decorative elements */}
              <View style={styles.leftCutout} />
              <View style={styles.rightCutout} />
              <View style={styles.cornerDecoration1} />
              <View style={styles.cornerDecoration2} />
              <View style={styles.cornerDecoration3} />
              <View style={styles.cornerDecoration4} />
            </LinearGradient>
          </ViewShot>
          
          {/* Important information */}
          <View style={styles.infoSection}>
            <View style={styles.infoHeader}>
              <Info size={20} color={colors.primary} />
              <Text style={styles.infoTitle}>Informations importantes</Text>
            </View>
            
            <Text style={styles.infoText}>
              • Veuillez arriver au moins 30 minutes avant le début de l'événement.
            </Text>
            <Text style={styles.infoText}>
              • Ayez votre code QR prêt à être scanné à l'entrée.
            </Text>
            <Text style={styles.infoText}>
              • Ce billet n'est ni remboursable ni transférable.
            </Text>
            <Text style={styles.infoText}>
              • Pour toute question, veuillez contacter support@afritix.com.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title="Télécharger le billet"
          onPress={handleDownload}
          style={styles.downloadButton}
          icon={<Download size={20} color={colors.text} />}
          loading={isDownloading}
          disabled={isDownloading || selectedTicket.status === 'TRANSFERRED' || selectedTicket.status === 'CANCELLED'}
        />
        <Button
          title="Transférer le billet"
          onPress={handleTransfer}
          variant="outline"
          style={styles.transferButton}
          icon={<Send size={20} color={colors.primary} />}
          disabled={isTransferring || selectedTicket.status === 'USED' || selectedTicket.status === 'TRANSFERRED' || selectedTicket.status === 'CANCELLED'}
        />
      </View>
      
      {/* Transfer Modal */}
      <Modal
        visible={transferModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeTransferModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Transférer le billet</Text>
              <TouchableOpacity onPress={closeTransferModal} style={styles.closeButton}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalDescription}>
              Entrez l'adresse e-mail de la personne à qui vous souhaitez transférer ce billet.
              Le destinataire recevra un e-mail avec les instructions pour accepter le transfert.
            </Text>
            
            <View style={styles.inputContainer}>
              <Mail size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Adresse e-mail du destinataire"
                placeholderTextColor={colors.textSecondary}
                value={recipientEmail}
                onChangeText={setRecipientEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}
            
            <View style={styles.modalFooter}>
              <Button
                title="Annuler"
                onPress={closeTransferModal}
                variant="outline"
                style={styles.cancelButton}
              />
              <Button
                title="Transférer"
                onPress={handleTransferSubmit}
                style={styles.confirmButton}
                loading={isTransferring}
                disabled={isTransferring}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerButtons: {
    flexDirection: 'row',
    marginRight: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successBanner: {
    backgroundColor: colors.success,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  content: {
    padding: 16,
  },
  ticketContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  ticketGradient: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  eventTitleContainer: {
    flex: 1,
    marginRight: 16,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  securityText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  ticketTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.cardLight,
  },
  ticketTypeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  ticketTypeText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  ticketPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  qrContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.card,
  },
  qrText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  qrHint: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.cardLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  detailsContent: {
    padding: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 16,
    color: colors.text,
  },
  collapsibleSection: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.cardLight,
  },
  collapsibleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  collapsibleToggle: {
    fontSize: 14,
    color: colors.primary,
  },
  validationHistory: {
    padding: 16,
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  validationText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  validationDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  noValidationText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  termsContainer: {
    padding: 16,
  },
  termsText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  infoSection: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  downloadButton: {
    flex: 1,
    marginRight: 8,
  },
  transferButton: {
    flex: 1,
    marginLeft: 8,
  },
  // Decorative elements
  leftCutout: {
    position: 'absolute',
    left: -12,
    top: '30%',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  rightCutout: {
    position: 'absolute',
    right: -12,
    top: '30%',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
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
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    color: colors.text,
    fontSize: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginBottom: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  confirmButton: {
    flex: 1,
    marginLeft: 8,
  },
});