import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { driverApi } from '../../services/api';

export default function MaintenanceOCRReviewScreen({ routeData, onBack, onSuccess }) {
  const { user } = useAuth();
  const ocr = routeData?.ocr_extracted || {};

  const [repairType, setRepairType] = useState(ocr.repair_type || 'Tire Replacement');
  const [serviceCenter, setServiceCenter] = useState(ocr.service_center || 'National Truck Tyres');
  const [serviceDate, setServiceDate] = useState(ocr.service_date || new Date().toISOString().split('T')[0]);
  const [partsCost, setPartsCost] = useState(String(ocr.parts_cost || '15000'));
  const [laborCost, setLaborCost] = useState(String(ocr.labor_cost || '2500'));
  const [totalCost, setTotalCost] = useState(String(ocr.total_repair_cost || '17500'));
  const [odometer, setOdometer] = useState(String(ocr.odometer_reading || '45200'));
  const [notes, setNotes] = useState(ocr.notes || '');
  const [submitting, setSubmitting] = useState(false);

  const handlePartsChange = (val) => {
    setPartsCost(val);
    const p = parseFloat(val) || 0;
    const l = parseFloat(laborCost) || 0;
    setTotalCost((p + l).toFixed(2));
  };

  const handleLaborChange = (val) => {
    setLaborCost(val);
    const p = parseFloat(partsCost) || 0;
    const l = parseFloat(val) || 0;
    setTotalCost((p + l).toFixed(2));
  };

  const handleSubmit = async () => {
    const pc = parseFloat(partsCost) || 0;
    const lc = parseFloat(laborCost) || 0;
    const tc = parseFloat(totalCost) || (pc + lc);

    if (tc <= 0) {
      Alert.alert('Invalid Total Cost', 'Please enter a valid repair cost.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        service_date: serviceDate,
        repair_type: repairType,
        service_center: serviceCenter,
        parts_cost: pc,
        labor_cost: lc,
        total_repair_cost: tc,
        receipt_url: routeData?.file_url || null,
        is_ocr_confirmed: true,
        notes: notes,
      };

      const result = await driverApi.submitDriverRepair(payload);
      setSubmitting(false);

      if (result.manager_review_status === 'REQUIRES_REVIEW') {
        Alert.alert(
          'Maintenance Record Flagged',
          'Possible duplicate repair record detected. Submission recorded and flagged for manager review.',
          [{ text: 'OK', onPress: () => onSuccess() }]
        );
      } else {
        Alert.alert(
          'Maintenance Submitted!',
          'Your repair service bill has been confirmed and logged for manager audit review.',
          [{ text: 'OK', onPress: () => onSuccess() }]
        );
      }
    } catch (err) {
      setSubmitting(false);
      Alert.alert('Submission Error', err.message || 'Could not submit repair log.');
    }
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Review Repair Bill" 
        subtitle="Verify AI-extracted repair invoice details before final submission" 
        showBack={true}
        onBack={onBack}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <View style={styles.statusBanner}>
            <View>
              <Text style={styles.bannerTitle}>🔍 OCR Status: DRIVER_REVIEW</Text>
              <Text style={styles.bannerSub}>Review service center, parts cost, and labor costs.</Text>
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
              <Text style={styles.receiptFileName}>{routeData.file_name || 'Repair Invoice'}</Text>
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
              <Text style={styles.label}>Repair Category*</Text>
              <TextInput 
                style={styles.input} 
                value={repairType} 
                onChangeText={setRepairType} 
                placeholder="e.g. Tire Replacement" 
              />
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Service Date*</Text>
              <TextInput 
                style={styles.input} 
                value={serviceDate} 
                onChangeText={setServiceDate} 
                placeholder="2026-10-01" 
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Service Center / Workshop Name*</Text>
            <TextInput 
              style={styles.input} 
              value={serviceCenter} 
              onChangeText={setServiceCenter} 
              placeholder="e.g. National Truck Tyres" 
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Parts Cost (₹)</Text>
              <TextInput 
                style={styles.input} 
                value={partsCost} 
                onChangeText={handlePartsChange} 
                keyboardType="decimal-pad" 
                placeholder="15000" 
              />
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Labor Cost (₹)</Text>
              <TextInput 
                style={styles.input} 
                value={laborCost} 
                onChangeText={handleLaborChange} 
                keyboardType="decimal-pad" 
                placeholder="2500" 
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Total Repair Cost (₹)*</Text>
            <TextInput 
              style={[styles.input, styles.totalInput]} 
              value={totalCost} 
              onChangeText={setTotalCost} 
              keyboardType="decimal-pad" 
              placeholder="17500.00" 
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Odometer Reading (km)</Text>
            <TextInput 
              style={styles.input} 
              value={odometer} 
              onChangeText={setOdometer} 
              keyboardType="numeric" 
              placeholder="45200" 
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Driver Description / Repair Work Notes</Text>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              value={notes} 
              onChangeText={setNotes} 
              multiline 
              numberOfLines={3} 
              placeholder="Describe repairs performed, replaced parts, warranty notes..." 
            />
          </View>

          <Button
            title={submitting ? 'Submitting Repair Log...' : '✅ Confirm & Submit Repair Bill'}
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
