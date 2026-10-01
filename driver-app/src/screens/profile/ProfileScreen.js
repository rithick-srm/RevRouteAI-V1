import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen({ onBack }) {
  const { user, logout, switchDemoDriver } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of RevRoute AI Driver Mobile?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Driver Profile" 
        subtitle="Credentials, assigned vehicle, and mobile preferences" 
        showBack={!!onBack}
        onBack={onBack}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.profileHeaderCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'R'}</Text>
          </View>

          <Text style={styles.driverName}>{user?.name || 'Ramesh Kumar'}</Text>
          <Text style={styles.driverRole}>🚛 Carrier Driver</Text>

          <View style={styles.badgeRow}>
            <Badge status="VERIFIED" label="Active Driver" />
            <Text style={styles.vehicleTag}>Truck: {user?.assigned_vehicle_id || 'TRK-101'}</Text>
          </View>
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>📋 Driver Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Driver ID:</Text>
            <Text style={styles.value}>DRV-{user?.id || 2}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Email Address:</Text>
            <Text style={styles.value}>{user?.email || 'driver1@revroute.ai'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone Number:</Text>
            <Text style={styles.value}>{user?.phone_number || '+91 98765 11111'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Commercial License:</Text>
            <Text style={styles.value}>{user?.license_number || 'DL-TN01-20210001'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Assigned Vehicle:</Text>
            <Text style={styles.valueHighlight}>{user?.assigned_vehicle_id || 'TRK-101'}</Text>
          </View>
        </Card>

        <Card style={styles.demoCard}>
          <Text style={styles.sectionTitle}>🧪 Demo Driver Switcher</Text>
          <Text style={styles.demoSub}>Switch active driver context for quick multi-driver mobile testing:</Text>

          <View style={styles.demoBtnRow}>
            <TouchableOpacity 
              style={[styles.demoDriverBtn, user?.id === 2 && styles.activeDemoBtn]} 
              onPress={() => switchDemoDriver(2)}
            >
              <Text style={[styles.demoDriverText, user?.id === 2 && styles.activeDemoText]}>
                Driver #2 (Ramesh / TRK-101)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.demoDriverBtn, user?.id === 3 && styles.activeDemoBtn]} 
              onPress={() => switchDemoDriver(3)}
            >
              <Text style={[styles.demoDriverText, user?.id === 3 && styles.activeDemoText]}>
                Driver #3 (Suresh / TRK-102)
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Button
          title="🚪 Sign Out"
          onPress={handleLogout}
          variant="secondary"
          style={styles.logoutBtn}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  profileHeaderCard: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 14,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  driverName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  driverRole: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleTag: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.teal,
    marginLeft: 10,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  infoCard: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  label: {
    fontSize: 13,
    color: colors.textMuted,
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  valueHighlight: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  demoCard: {
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
  },
  demoSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 10,
  },
  demoBtnRow: {
    flexDirection: 'column',
  },
  demoDriverBtn: {
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: 8,
    alignItems: 'center',
  },
  activeDemoBtn: {
    borderColor: colors.primary,
    backgroundColor: '#EFF6FF',
  },
  demoDriverText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  activeDemoText: {
    color: colors.primary,
    fontWeight: '700',
  },
  logoutBtn: {
    borderColor: colors.danger,
    marginTop: 4,
  },
});
