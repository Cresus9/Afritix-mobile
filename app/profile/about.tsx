import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Image,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { 
  Globe, 
  Mail, 
  Phone, 
  Facebook, 
  Instagram,
  Twitter,
  Youtube,
  Heart,
  Star,
  FileText,
  Shield,
  Info
} from 'lucide-react-native';
import { colors } from '@/constants/colors';

export default function AboutScreen() {
  const handleOpenWebsite = () => {
    Linking.openURL('https://afritix.com');
  };
  
  const handleContactEmail = () => {
    Linking.openURL('mailto:contact@afritix.com');
  };
  
  const handleContactPhone = () => {
    Linking.openURL('tel:+22500000000');
  };
  
  const handleOpenSocial = (platform: string) => {
    let url = '';
    switch (platform) {
      case 'facebook':
        url = 'https://facebook.com/afritix';
        break;
      case 'instagram':
        url = 'https://instagram.com/afritix';
        break;
      case 'twitter':
        url = 'https://twitter.com/afritix';
        break;
      case 'youtube':
        url = 'https://youtube.com/afritix';
        break;
    }
    Linking.openURL(url);
  };
  
  const handleOpenTerms = () => {
    Linking.openURL('https://afritix.com/terms');
  };
  
  const handleOpenPrivacy = () => {
    Linking.openURL('https://afritix.com/privacy');
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'À propos d\'AfriTix',
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerShadowVisible: false
      }} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1560800452-f2d475982b96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGFmcmljYW4lMjBsb2dvfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60' }} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>AfriTix</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            La première plateforme de billetterie en ligne dédiée aux événements culturels en Afrique
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notre mission</Text>
          <Text style={styles.missionText}>
            AfriTix a pour mission de faciliter l'accès aux événements culturels en Afrique et de promouvoir la richesse culturelle du continent. Notre plateforme permet aux organisateurs d'événements de gérer facilement leurs billets et aux participants de découvrir et d'acheter des billets pour les meilleurs événements.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contactez-nous</Text>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={handleOpenWebsite}
          >
            <Globe size={20} color={colors.primary} />
            <Text style={styles.contactText}>afritix.com</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={handleContactEmail}
          >
            <Mail size={20} color={colors.primary} />
            <Text style={styles.contactText}>contact@afritix.com</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={handleContactPhone}
          >
            <Phone size={20} color={colors.primary} />
            <Text style={styles.contactText}>+225 00 00 00 00</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suivez-nous</Text>
          
          <View style={styles.socialContainer}>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleOpenSocial('facebook')}
            >
              <Facebook size={24} color={colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleOpenSocial('instagram')}
            >
              <Instagram size={24} color={colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleOpenSocial('twitter')}
            >
              <Twitter size={24} color={colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleOpenSocial('youtube')}
            >
              <Youtube size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mentions légales</Text>
          
          <TouchableOpacity 
            style={styles.legalItem}
            onPress={handleOpenTerms}
          >
            <FileText size={20} color={colors.textSecondary} />
            <Text style={styles.legalText}>Conditions d'utilisation</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.legalItem}
            onPress={handleOpenPrivacy}
          >
            <Shield size={20} color={colors.textSecondary} />
            <Text style={styles.legalText}>Politique de confidentialité</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2023 AfriTix. Tous droits réservés.
          </Text>
          <View style={styles.footerIcon}>
            <Heart size={14} color={colors.error} />
            <Text style={styles.footerIconText}>
              Fait avec amour en Côte d'Ivoire
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.card,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
  },
  appVersion: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  appDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  missionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.cardLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  legalText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  footerIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerIconText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 6,
  },
});