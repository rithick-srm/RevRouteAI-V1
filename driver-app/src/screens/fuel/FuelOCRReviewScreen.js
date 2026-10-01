import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { driverApi } from '../../services/api';

export default function FuelOCRReviewScreen({ routeData, onBack, onSuccess }) {
  const { user } = useAuth();
  const ocr = routeData?.ocr_extracted || {};

  const [liters, setLiters] = useState(String(ocr.liters_filled || '100'));
  const [pricePerLiter, setPricePerLiter] = useState(String(ocr.price_per_liter || '94.50'));
  const [totalCost, setTotalCost] = useState(String(ocr.total_cost || (Number(liters) * Number(pricePerLiter)).toFixed(2)));
  const [station, setStation] = useState(ocr.fuel_station || 'IndianOil Express Highway');
  const [fuelDate, setFuelDate] = useState(ocr.fuel_date || new Date().toISOString().split('T')[0]);
  const [odometer, setOdometer] = useState(String(ocr.odometer_reading || '45000'));
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Recalculate total cost automatically if liters or price per liter changes
  const handleLitersChange = (val) => {
    setLiters(val);
    const l = parseFloat(val) || 0;
    const p = parseFloat(pricePerLiter) || 0;
    if (l > 0 && p > 0) {
      setTotalCost((l * p).toFixed(2));
    }
  };

  const handlePriceChange = (val) => {
    setPricePerLiter(val);
    const l = parseFloat(liters) || 0;
    const p = parseFloat(val) || 0;
    if (l > 0 && p > 0) {
      setTotalCost((l * p).toFixed(2));
    }
  };

  const handleSubmit = async () => {
    const l = parseFloat(liters);
    const p = parseFloat(pricePerLiter);
    const t = parseFloat(totalCost);

    if (!l || l <= 0) {
      Alert.alert('Invalid Input', 'Please enter valid liters filled.');
      return;
    }
    if (!p || p <= 0) {
      Alert.alert('Invalid Input', 'Please enter valid price per liter.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fuel_date: fuelDate,
        liters_filled: l,
        price_per_liter: p,
        total_cost: t || (l * p),
        fuel_station: station,
        odometer_reading: parseInt(odometer) || 0,
        receipt_url: routeData?.file_url || null,
        is_ocr_confirmed: true,
        notes: notes,
      };

      const result = await driverApi.submitDriverFuel(payload);
      setSubmitting(false);

      if (result.manager_review_status === 'REQUIRES_REVIEW') {
        Alert.alert(
          'Submission Received with Flag',
          'Possible duplicate entry detected. Your fuel log has been submitted and marked as "Requires Review" for the manager.',
          [{ text: 'OK', onPress: () => onSuccess() }]
        );
      } else {
        Alert.alert(
          'Fuel Log Submitted!',
          'Your fuel fill-up receipt has been confirmed and sent to manager audit review.',
          [{ text: 'OK', onPress: () => onSuccess() }]
        );
      }
    } catch (err) {
      setSubmitting(false);
      Alert.alert('Submission Error', err.message || 'Could not submit fuel log.');
    }
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Review OCR Data" 
        subtitle="Verify AI-extracted fuel receipt details before final submission" 
        showBack={true}
        onBack={onBack}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <View style={styles.statusBanner}>
            <View>
              <Text style={styles.bannerTitle}>🔍 OCR Status: DRIVER_REVIEW</Text>
              <Text style={styles.bannerSub}>Inspect and edit fields extracted from your receipt.</Text>
            </View>
            <Badge status="DRIVER_REVIEW" />
          </View>

          {routeData?.file_url && (
            <View style={styles.receiptPreview}>
              <Image 
                source={{ uri: routeData.file_url }} 
                style={styles.receiptImage} 
                resizeMode="cover" 
              />
              <Text style={styles.receiptFileName}>{routeData.file_name || 'Receipt Document'}</Text>
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Vehicle ID (Assigned)</Text>
            <TextInput 
              style={[styles.input, styles.disabledInput]} 
              value={user?.assigned_vehicle_id || 'TRK-101'} 
              editable={false} 
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Fuel Date (YYYY-MM-DD)*</Text>
              <TextInput 
                style={styles.input} 
                value={fuelDate} 
                onChangeText={setFuelDate} 
                placeholder="2026-10-01" 
              />
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Odometer (km)</Text>
              <TextInput 
                style={styles.input} 
                value={odometer} 
                onChangeText={setOdometer} 
                keyboardType="numeric" 
                placeholder="45000" 
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Fuel Station / Vendor Name*</Text>
            <TextInput 
              style={styles.input} 
              value={station} 
              onChangeText={setStation} 
              placeholder="e.g. IndianOil Express" 
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Liters Filled (L)*</Text>
              <TextInput 
                style={styles.input} 
                value={liters} 
                onChangeText={handleLitersChange} 
                keyboardType="decimal-pad" 
                placeholder="100.0" 
              />
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Price / Liter (₹)*</Text>
              <TextInput 
                style={styles.input} 
                value={pricePerLiter} 
                onChangeText={handlePriceChange} 
                keyboardType="decimal-pad" 
                placeholder="94.50" 
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Total Calculated Cost (₹)*</Text>
            <TextInput 
              style={[styles.input, styles.totalInput]} 
              value={totalCost} 
              onChangeText={setTotalCost} 
              keyboardType="decimal-pad" 
              placeholder="9450.00" 
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Driver Notes / Comments (Optional)</Text>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              value={notes} 
              onChangeText={setNotes} 
              multiline 
              numberOfLines={3} 
              placeholder="Add any extra notes regarding this fill-up..." 
            />
          </View>

          <Button
            title={submitting ? 'Confirming Submission...' : '✅ Confirm & Submit Fuel Log'}
            onPress={handleSubmit}
            disabled={submitting}
            style={styles.confirmBtn}
          />
          {submitting && <ActivityIndicator color={colors.primary} style={{ marginTop: 10 }} />}
        </Card>
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
  card: {
    padding: 16,
  },
  statusBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  bannerSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  receiptPreview: {
    marginBottom: 16,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  receiptImage: {
    width: '100%',
    height: 150,
    borderRadius: 6,
    marginBottom: 6,
  },
  receiptFileName: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 14,
  },
  formRow: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  disabledInput: {
    backgroundColor: '#E2E8F0',
    color: colors.textMuted,
  },
  totalInput: {
    fontWeight: '800',
    color: colors.primary,
    fontSize: 16,
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  confirmBtn: {
    backgroundColor: colors.teal,
    marginTop: 10,
  },
});
