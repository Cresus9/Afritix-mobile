import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Camera, X, MapPin, Phone, FileText, User, Mail } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/Button';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, uploadAvatar, isLoading, error: storeError, clearError, refreshUser } = useAuthStore();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    const loadUserData = async () => {
      setRefreshing(true);
      try {
        await refreshUser();
      } catch (error) {
        console.error('Error refreshing user data:', error);
      } finally {
        setRefreshing(false);
      }
    };
    
    loadUserData();
  }, []);
  
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || '');
      setLocation(user.location || '');
      setBio(user.bio || '');
      setAvatar(user.avatar || null);
    }
  }, [user]);
  
  useEffect(() => {
    if (storeError) {
      setError(storeError);
      // Clear the store error after displaying it
      setTimeout(() => {
        clearError();
      }, 100);
    }
  }, [storeError]);
  
  const handleSave = async () => {
    if (!name) {
      Alert.alert('Erreur', 'Veuillez entrer votre nom');
      return;
    }
    
    if (!user) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }
    
    setLocalLoading(true);
    setError(null);
    
    try {
      await updateProfile({
        name,
        phone: phone || null,
        location: location || null,
        bio: bio || null,
        avatar
      });
      
      Alert.alert('Succès', 'Profil mis à jour avec succès', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      setError(error.message || 'Une erreur s\'est produite');
    } finally {
      setLocalLoading(false);
    }
  };
  
  const handlePickImage = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission requise', 'Nous avons besoin de votre permission pour accéder à vos photos');
        return;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploadingAvatar(true);
        
        try {
          // Upload image to Supabase Storage using the store method
          const avatarUrl = await uploadAvatar(result.assets[0].uri);
          setAvatar(avatarUrl);
        } catch (error: any) {
          Alert.alert('Erreur', error.message || 'Échec du téléchargement de l\'image');
        } finally {
          setUploadingAvatar(false);
        }
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Une erreur s\'est produite');
    }
  };
  
  if (refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ 
          title: 'Modifier le profil',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerShadowVisible: false
        }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Chargement des informations...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'Modifier le profil',
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerShadowVisible: false
      }} />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            <View style={styles.avatarContainer}>
              {uploadingAvatar ? (
                <View style={styles.avatarPlaceholder}>
                  <ActivityIndicator size="large" color={colors.white} />
                </View>
              ) : avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderText}>
                    {name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              
              <TouchableOpacity 
                style={styles.changeAvatarButton}
                onPress={handlePickImage}
                disabled={uploadingAvatar || isLoading}
              >
                <Camera size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nom complet</Text>
              <View style={styles.inputWrapper}>
                <User size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Entrez votre nom complet"
                  placeholderTextColor={colors.textMuted}
                  autoCorrect={false}
                  editable={!isLoading && !localLoading}
                />
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputWrapper, styles.disabledInputWrapper]}>
                <Mail size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={email}
                  editable={false}
                  placeholder="Entrez votre email"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <Text style={styles.helperText}>
                L'email ne peut pas être modifié
              </Text>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Téléphone</Text>
              <View style={styles.inputWrapper}>
                <Phone size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Entrez votre numéro de téléphone"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  editable={!isLoading && !localLoading}
                />
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Localisation</Text>
              <View style={styles.inputWrapper}>
                <MapPin size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Entrez votre ville"
                  placeholderTextColor={colors.textMuted}
                  editable={!isLoading && !localLoading}
                />
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Bio</Text>
              <View style={styles.textareaWrapper}>
                <FileText size={20} color={colors.textSecondary} style={styles.textareaIcon} />
                <TextInput
                  style={styles.textarea}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Parlez-nous de vous"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!isLoading && !localLoading}
                />
              </View>
            </View>
            
            <Button
              title="Enregistrer les modifications"
              onPress={handleSave}
              loading={isLoading || localLoading}
              fullWidth
              style={styles.saveButton}
            />
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  form: {
    marginBottom: 32,
  },
  errorContainer: {
    backgroundColor: colors.error + '20',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.white,
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputWrapper: {
    backgroundColor: colors.card,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabledInputWrapper: {
    backgroundColor: colors.card + '80',
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: colors.text,
  },
  disabledInput: {
    color: colors.textSecondary,
  },
  textareaWrapper: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: 'row',
  },
  textareaIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  textarea: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    minHeight: 100,
  },
  helperText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    marginLeft: 4,
  },
  saveButton: {
    marginTop: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
  },
});