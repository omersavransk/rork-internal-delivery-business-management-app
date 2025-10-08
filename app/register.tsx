import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  I18nManager,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { UserPlus } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleRegister = async () => {
    if (!username || !password || !confirmPassword || !name || !businessName) {
      Alert.alert('שגיאה', 'אנא מלא את כל השדות');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('שגיאה', 'הסיסמאות אינן תואמות');
      return;
    }

    if (password.length < 6) {
      Alert.alert('שגיאה', 'הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }

    if (username.length < 3) {
      Alert.alert('שגיאה', 'שם המשתמש חייב להכיל לפחות 3 תווים');
      return;
    }

    setIsLoading(true);
    const result = await register(username, password, name, businessName);
    setIsLoading(false);

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('שגיאה', result.error || 'שגיאה ברישום');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#2563EB', '#1E40AF', '#1E3A8A']}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <UserPlus size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>הרשמה לאפליקציה</Text>
            <Text style={styles.subtitle}>צור חשבון חדש לעסק שלך</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>שם העסק</Text>
              <TextInput
                style={styles.input}
                value={businessName}
                onChangeText={setBusinessName}
                placeholder="הכנס שם עסק"
                placeholderTextColor="#9CA3AF"
                textAlign="right"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>שם מלא</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="הכנס שם מלא"
                placeholderTextColor="#9CA3AF"
                textAlign="right"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>שם משתמש</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="הכנס שם משתמש (לפחות 3 תווים)"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                textAlign="right"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>סיסמה</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="הכנס סיסמה (לפחות 6 תווים)"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                textAlign="right"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>אימות סיסמה</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="הכנס סיסמה שוב"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                textAlign="right"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'נרשם...' : 'הירשם'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.back()}
            >
              <Text style={styles.linkText}>כבר יש לך חשבון? התחבר</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    textAlign: 'right',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#2563EB',
  },
  linkButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
});
