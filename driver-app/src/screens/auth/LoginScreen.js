import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function LoginScreen({ onLoginSuccess }) {
  const { login, setDemoDriver, loading, error } = useAuth();
  const [email, setEmail] = useState('driver1@revroute.ai');
  const [password, setPassword] = useState('password');

  const handleSubmit = async () => {
    try {
      const user = await login(email, password);
      if (onLoginSuccess) onLoginSuccess(user);
    } catch (err) {
      // Error handled by AuthContext
    }
  };

  const handleQuickSelect = (driverEmail) => {
    setEmail(driverEmail);
    setPassword('password');
    setDemoDriver(driverEmail);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.brandContainer}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>RR</Text>
        </View>
        <Text style={styles.appName}>RevRoute AI</Text>
        <Text style={styles.appTagline}>Driver Mobile Portal</Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.formTitle}>Driver Sign In</Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Driver Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="driver@revroute.ai"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#94A3B8"
            secureTextEntry
          />
        </View>

        <Button
          title={loading ? 'Signing In...' : 'Continue as Driver'}
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitBtn}
        />

        <View style={styles.divider} />

        <Text style={styles.demoHeader}>Quick Demo Driver Sign-In</Text>

        <View style={styles.demoGrid}>
          <TouchableOpacity
            onPress={() => handleQuickSelect('driver1@revroute.ai')}
            style={[styles.demoBtn, email === 'driver1@revroute.ai' && styles.demoBtnActive]}
          >
            <Text style={styles.demoName}>Ramesh Kumar</Text>
            <Text style={styles.demoTruck}>TRK-101 (Heavy Truck)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleQuickSelect('driver2@revroute.ai')}
            style={[styles.demoBtn, email === 'driver2@revroute.ai' && styles.demoBtnActive]}
          >
            <Text style={styles.demoName}>Suresh Patel</Text>
            <Text style={styles.demoTruck}>TRK-102 (Heavy Truck)</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.navy,
    justifyContent: 'center',
    padding: 20,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 22,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  appTagline: {
    color: COLORS.teal,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  card: {
    backgroundColor: COLORS.dark,
    borderColor: '#1E293B',
    padding: 20,
  },
  formTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 14,
  },
  submitBtn: {
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#1E293B',
    marginVertical: 18,
  },
  demoHeader: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 10,
  },
  demoGrid: {
    gap: 8,
  },
  demoBtn: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    padding: 12,
    borderRadius: 10,
  },
  demoBtnActive: {
    borderColor: COLORS.blue,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
  },
  demoName: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  demoTruck: {
    color: COLORS.teal,
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 2,
  },
});
