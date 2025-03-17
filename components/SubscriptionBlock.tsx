import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase, handleSupabaseError } from '@/lib/supabase';

interface SubscriptionBlockProps {
  onSubscribe?: (email: string) => void;
}

const { width } = Dimensions.get('window');
const isSmallScreen = width < 380;

export const SubscriptionBlock: React.FC<SubscriptionBlockProps> = ({ 
  onSubscribe 
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubscribe = async () => {
    // Reset states
    setError(null);
    setSuccess(false);
    
    // Validate email
    if (!email.trim()) {
      setError("Veuillez entrer votre email");
      return;
    }
    
    if (!validateEmail(email.trim())) {
      setError("Veuillez entrer un email valide");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Insert into newsletter_subscriptions table
      const { error: supabaseError } = await supabase
        .from('newsletter_subscriptions')
        .upsert([
          { 
            email: email.trim().toLowerCase(),
            status: 'active',
            subscribed_at: new Date().toISOString()
          }
        ], { 
          onConflict: 'email',
          ignoreDuplicates: false
        });
      
      if (supabaseError) {
        throw supabaseError;
      }
      
      // Call the onSubscribe callback if provided
      if (onSubscribe) {
        onSubscribe(email.trim());
      }
      
      // Show success state
      setSuccess(true);
      setEmail('');
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setError(handleSupabaseError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Restez informé</Text>
      
      <Text style={styles.description}>
        Abonnez-vous pour être notifié des événements à venir et des offres exclusives
      </Text>
      
      <View style={styles.formContainer}>
        <TextInput
          style={[
            styles.input,
            error ? styles.inputError : null
          ]}
          placeholder="Entrez votre email"
          placeholderTextColor="rgba(255, 255, 255, 0.7)"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (error) setError(null);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
        />
        
        <TouchableOpacity 
          style={[
            styles.button,
            isLoading ? styles.buttonDisabled : null
          ]}
          onPress={handleSubscribe}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>S'abonner</Text>
          )}
        </TouchableOpacity>
      </View>
      
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : success ? (
        <Text style={styles.successText}>Merci pour votre inscription!</Text>
      ) : null}
      
      <Text style={styles.communityText}>
        Rejoignez notre communauté de 5 000+ passionnés d'événements
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#6f47ff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: '90%',
  },
  formContainer: {
    width: '100%',
    flexDirection: isSmallScreen ? 'column' : 'row',
    marginBottom: 8,
    gap: isSmallScreen ? 12 : 0,
  },
  input: {
    flex: isSmallScreen ? undefined : 1,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: isSmallScreen ? 8 : undefined,
    borderTopLeftRadius: isSmallScreen ? undefined : 8,
    borderBottomLeftRadius: isSmallScreen ? undefined : 8,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 16,
    width: isSmallScreen ? '100%' : undefined,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#ff4d4f',
  },
  button: {
    backgroundColor: '#ff8c33',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: isSmallScreen ? 8 : undefined,
    borderTopRightRadius: isSmallScreen ? undefined : 8,
    borderBottomRightRadius: isSmallScreen ? undefined : 8,
    width: isSmallScreen ? '100%' : 120,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#ff4d4f',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  successText: {
    color: '#52c41a',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  communityText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
  },
});