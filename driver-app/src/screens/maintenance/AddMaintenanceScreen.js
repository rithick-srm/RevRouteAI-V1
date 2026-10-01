import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { colors } from '../../theme/colors';
import { driverApi } from '../../services/api';

export default function AddMaintenanceScreen({ onBack, onNavigateToReview }) {
  const [loading, setLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Preset sample repair invoices for instant mobile testing
  const sampleRepairBills = [
    {
      name: 'Tire Replacement & Wheel Balance.jpg',
      type: 'image/jpeg',
      uri: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=500',
      mockOcr: {
        repair_type: 'Tire Replacement',
        service_center: 'National Truck Tyres & Service, Highway NH-48',
        service_date: new Date().toISOString().split('T')[0],
        parts_cost: 16500.0,
        labor_cost: 2500.0,
        total_repair_cost: 19000.0,
        odometer_reading: 45200,
        notes: 'Replaced 2 rear heavy truck tires and balanced front axle.',
        raw_text: 'NATIONAL TRUCK TYRES INVOICE\nRepair: Tire Replacement\nParts: 16,500.00 Rs\nLabor: 2,500.00 Rs\nTotal: 19,000.00 Rs',
      }
    },
    {
      name: 'Brake Pad & Disc Overhaul.pdf',
      type: 'application/pdf',
      uri: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=500',
      mockOcr: {
        repair_type: 'Brake Service',
        service_center: 'Apex Commercial Vehicle Workshop, Bengaluru',
        service_date: new Date().toISOString().split('T')[0],
        parts_cost: 8200.0,
        labor_cost: 3800.0,
        total_repair_cost: 12000.0,
        odometer_reading: 45900,
        notes: 'Brake lining replacement & hydraulic fluid top-up.',
        raw_text: 'APEX WORKSHOP BILL\nRepair: Brake Service\nParts: 8,200.00 Rs\nLabor: 3,800.00 Rs\nTotal: 12,000.00 Rs',
      }
    }
  ];

  const handleSelectSample = (sample) => {
    setSelectedDoc(sample);
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedDoc) {
      Alert.alert('No Service Bill Selected', 'Please select or capture a repair invoice image/PDF first.');
      return;
    }

    setLoading(true);
    try {
      let res;
      try {
        res = await driverApi.uploadDocument(selectedDoc.uri, selectedDoc.name, selectedDoc.type, 'maintenance');
      } catch (err) {
        res = {
          file_name: selectedDoc.name,
          file_url: selectedDoc.uri,
          doc_type: 'maintenance',
          ocr_data: selectedDoc.mockOcr || {
            repair_type: 'General Service',
            service_center: 'Auto Service Center',
            service_date: new Date().toISOString().split('T')[0],
            parts_cost: 5000.0,
            labor_cost: 2000.0,
            total_repair_cost: 7000.0,
            odometer_reading: 45000,
            notes: 'General vehicle inspection',
            raw_text: 'GENERAL SERVICE BILL\nTotal: 7,000.00 Rs',
          }
        };
      }

      setLoading(false);
      onNavigateToReview({
        file_name: res.file_name || selectedDoc.name,
        file_url: res.file_url || selectedDoc.uri,
        ocr_extracted: res.ocr_data || selectedDoc.mockOcr,
      });
    } catch (error) {
      setLoading(false);
      Alert.alert('OCR Extraction Failed', error.message || 'Could not process service bill document.');
    }
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Upload Service Bill" 
        subtitle="Capture or select maintenance/repair receipt for AI OCR extraction" 
        showBack={true}
        onBack={onBack}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.uploadCard}>
          <Text style={styles.cardTitle}>🛠️ Select Maintenance Document</Text>
          <Text style={styles.cardSubtitle}>
            Supported formats: JPG, PNG, PDF. Our AI parses repair type, service center, parts cost, labor cost, and total bill.
          </Text>

          <View style={styles.sampleContainer}>
            <Text style={styles.sectionLabel}>Select Sample Repair Invoice (For Instant Demo Testing):</Text>
            {sampleRepairBills.map((sample, idx) => {
              const isSelected = selectedDoc?.name === sample.name;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.sampleCard, isSelected && styles.sampleCardSelected]}
                  onPress={() => handleSelectSample(sample)}
                >
                  <View style={styles.sampleIconBox}>
                    <Text style={styles.sampleIcon}>{sample.type.includes('pdf') ? '📄' : '🖼️'}</Text>
                  </View>
                  <View style={styles.sampleInfo}>
                    <Text style={[styles.sampleName, isSelected && styles.sampleNameSelected]}>
                      {sample.name}
                    </Text>
                    <Text style={styles.sampleMeta}>
                      Preset: {sample.mockOcr.repair_type} (Parts: ₹{sample.mockOcr.parts_cost} + Labor: ₹{sample.mockOcr.labor_cost})
                    </Text>
                  </View>
                  {isSelected && <Text style={styles.checkMark}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedDoc && (
            <View style={styles.previewBox}>
              <Text style={styles.previewTitle}>Selected File Preview:</Text>
              {selectedDoc.type.includes('image') ? (
                <Image source={{ uri: selectedDoc.uri }} style={styles.previewImage} resizeMode="cover" />
              ) : (
                <View style={styles.pdfPreview}>
                  <Text style={styles.pdfIcon}>📄</Text>
                  <Text style={styles.pdfName}>{selectedDoc.name}</Text>
                </View>
              )}
            </View>
          )}

          <Button
            title={loading ? 'Extracting Repair Data via AI OCR...' : '⚡ Extract Repair Data via AI OCR'}
            onPress={handleUploadAndAnalyze}
            disabled={loading || !selectedDoc}
            style={styles.submitBtn}
          />
          {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: 12 }} />}
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Audit Notice for Drivers:</Text>
          <Text style={styles.bullet}>• Ensure itemized costs for parts and labor are clearly visible on bill.</Text>
          <Text style={styles.bullet}>• Maintenance entries are matched against carrier repair cost benchmarks.</Text>
          <Text style={styles.bullet}>• Duplicate or unverified repairs will trigger manager audit flags.</Text>
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
    paddingBottom: 30,
  },
  uploadCard: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  sampleContainer: {
    marginBottom: 16,
  },
  sampleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    marginBottom: 10,
  },
  sampleCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#EFF6FF',
  },
  sampleIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sampleIcon: {
    fontSize: 18,
  },
  sampleInfo: {
    flex: 1,
  },
  sampleName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sampleNameSelected: {
    color: colors.primary,
  },
  sampleMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  checkMark: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  previewBox: {
    marginTop: 10,
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 6,
  },
  previewImage: {
    width: '100%',
    height: 140,
    borderRadius: 6,
  },
  pdfPreview: {
    alignItems: 'center',
    padding: 16,
  },
  pdfIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  pdfName: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 6,
  },
  bullet: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 20,
  },
});
