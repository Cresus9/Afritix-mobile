import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  Switch,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Bell, Mail, Smartphone, Ticket, Calendar, Tag, Info, User } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { NotificationPreferences } from '@/types';

export default function NotificationsScreen() {
  const { user, notificationPreferences, fetchNotificationPreferences, updateNotificationPreferences } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  
  // Default preferences if none exist
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    userId: user?.id || '',
    email: true,
    push: true,
    types: ['events', 'tickets', 'promotions']
  });
  
  useEffect(() => {
    fetchNotificationPreferences();
  }, []);
  
  useEffect(() => {
    if (notificationPreferences) {
      setPreferences(notificationPreferences);
    }
  }, [notificationPreferences]);
  
  const handleToggleChannel = async (channel: 'email' | 'push', value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [channel]: value
    }));
    
    await updateNotificationPreferences({
      [channel]: value
    });
  };
  
  const handleToggleType = async (type: string) => {
    const updatedTypes = preferences.types.includes(type)
      ? preferences.types.filter(t => t !== type)
      : [...preferences.types, type];
    
    setPreferences(prev => ({
      ...prev,
      types: updatedTypes
    }));
    
    await updateNotificationPreferences({
      types: updatedTypes
    });
  };
  
  const isTypeEnabled = (type: string) => {
    return preferences.types.includes(type);
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'Notifications',
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerShadowVisible: false
      }} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Canaux de notification</Text>
          
          <View style={styles.optionItem}>
            <View style={styles.optionInfo}>
              <Mail size={20} color={colors.textSecondary} />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Email</Text>
                <Text style={styles.optionDescription}>
                  Recevez des notifications par email
                </Text>
              </View>
            </View>
            <Switch
              value={preferences.email}
              onValueChange={(value) => handleToggleChannel('email', value)}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={preferences.email ? colors.primary : colors.textMuted}
            />
          </View>
          
          <View style={styles.optionItem}>
            <View style={styles.optionInfo}>
              <Smartphone size={20} color={colors.textSecondary} />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Notifications push</Text>
                <Text style={styles.optionDescription}>
                  Recevez des notifications sur votre appareil
                </Text>
              </View>
            </View>
            <Switch
              value={preferences.push}
              onValueChange={(value) => handleToggleChannel('push', value)}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={preferences.push ? colors.primary : colors.textMuted}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Types de notifications</Text>
          
          <TouchableOpacity 
            style={styles.typeItem}
            onPress={() => handleToggleType('events')}
            activeOpacity={0.7}
          >
            <View style={styles.typeInfo}>
              <Calendar size={20} color={colors.textSecondary} />
              <Text style={styles.typeTitle}>Événements</Text>
            </View>
            <View style={[
              styles.checkbox,
              isTypeEnabled('events') && styles.checkboxActive
            ]}>
              {isTypeEnabled('events') && (
                <View style={styles.checkboxInner} />
              )}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.typeItem}
            onPress={() => handleToggleType('tickets')}
            activeOpacity={0.7}
          >
            <View style={styles.typeInfo}>
              <Ticket size={20} color={colors.textSecondary} />
              <Text style={styles.typeTitle}>Billets</Text>
            </View>
            <View style={[
              styles.checkbox,
              isTypeEnabled('tickets') && styles.checkboxActive
            ]}>
              {isTypeEnabled('tickets') && (
                <View style={styles.checkboxInner} />
              )}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.typeItem}
            onPress={() => handleToggleType('promotions')}
            activeOpacity={0.7}
          >
            <View style={styles.typeInfo}>
              <Tag size={20} color={colors.textSecondary} />
              <Text style={styles.typeTitle}>Promotions</Text>
            </View>
            <View style={[
              styles.checkbox,
              isTypeEnabled('promotions') && styles.checkboxActive
            ]}>
              {isTypeEnabled('promotions') && (
                <View style={styles.checkboxInner} />
              )}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.typeItem}
            onPress={() => handleToggleType('account')}
            activeOpacity={0.7}
          >
            <View style={styles.typeInfo}>
              <User size={20} color={colors.textSecondary} />
              <Text style={styles.typeTitle}>Compte</Text>
            </View>
            <View style={[
              styles.checkbox,
              isTypeEnabled('account') && styles.checkboxActive
            ]}>
              {isTypeEnabled('account') && (
                <View style={styles.checkboxInner} />
              )}
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoSection}>
          <Info size={16} color={colors.textSecondary} />
          <Text style={styles.infoText}>
            Vous pouvez modifier vos préférences de notification à tout moment.
            Les notifications importantes concernant votre compte seront toujours envoyées.
          </Text>
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
  section: {
    backgroundColor: colors.card,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    overflow: 'hidden',
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  typeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeTitle: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    borderColor: colors.primary,
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  infoSection: {
    flexDirection: 'row',
    backgroundColor: colors.cardLight,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 32,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});