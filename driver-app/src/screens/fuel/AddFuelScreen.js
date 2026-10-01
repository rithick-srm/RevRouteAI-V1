import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { colors } from '../../theme/colors';
import { driverApi } from '../../services/api';

export default function AddFuelScreen({ onBack, onNavigateToReview }) {
  const [loading, setLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Demo sample receipt options for instant mobile testing
  const sampleReceipts = [
    {
      name: 'IndianOil Fuel Slip #1042.jpg',
      type: 'image/jpeg',
      uri: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500',
      mockOcr: {
        liters_filled: 120.5,
        price_per_liter: 94.20,
        total_cost: 11351.10,
        fuel_station: 'IndianOil Express Highway Station, Pune',
        fuel_date: new Date().toISOString().split('T')[0],
        odometer_reading: 45200,
        raw_text: 'INDIANOIL FUEL RECEIPT\nDate: 2026-10-01\nLiters: 120.5 L\nRate: 94.20 Rs/L\nTotal: 11,351.10 Rs\nOdometer: 45200 km',
      }
    },
    {
      name: 'BPCL Petrol Pump Receipt.pdf',
      type: 'application/pdf',
      uri: 'https://images.unsplash.com/photo-1527018601619-a508a2be00d6?w=500',
      mockOcr: {
        liters_filled: 85.0,
        price_per_liter: 92.50,
        total_cost: 7862.50,
        fuel_station: 'Bharat Petroleum Services, Mumbai',
        fuel_date: new Date().toISOString().split('T')[0],
        odometer_reading: 45850,
        raw_text: 'BPCL PETROL PUMP\nDate: 2026-10-01\nLiters: 85.0 L\nRate: 92.50 Rs/L\nTotal: 7,862.50 Rs\nOdometer: 45850 km',
      }
    }
  ];

  const handleSelectSample = (sample) => {
    setSelectedDoc(sample);
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedDoc) {
      Alert.alert('No Document Selected', 'Please select or capture a receipt image/PDF first.');
      return;
    }

    setLoading(true);
    try {
      // In production, uploadDocument makes multipart POST request to /api/documents/upload
      // Here we simulate document upload and pass OCR result to review screen
      let res;
      try {
        res = await driverApi.uploadDocument(selectedDoc.uri, selectedDoc.name, selectedDoc.type, 'fuel');
      } catch (err) {
        // Fallback to sample OCR extraction payload if backend is unreachable or local mock image
        res = {
          file_name: selectedDoc.name,
          file_url: selectedDoc.uri,
          doc_type: 'fuel',
          ocr_data: selectedDoc.mockOcr || {
            liters_filled: 100.0,
            price_per_liter: 95.0,
            total_cost: 9500.0,
            fuel_station: 'HPCL Station',
            fuel_date: new Date().toISOString().split('T')[0],
            odometer_reading: 45000,
            raw_text: 'HPCL FUEL RECEIPT\nTotal: 9,500.00 Rs',
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
      Alert.alert('OCR Processing Failed', error.message || 'Could not process receipt document.');
    }
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Upload Fuel Receipt" 
        subtitle="Capture or select fuel fill-up receipt for AI OCR extraction" 
        showBack={true}
        onBack={onBack}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.uploadCard}>
          <Text style={styles.cardTitle}>📷 Select or Capture Receipt</Text>
          <Text style={styles.cardSubtitle}>
            Supported formats: JPG, PNG, PDF. Our AI automatically extracts liters, fuel rate, total cost, and station name.
          </Text>

          <View style={styles.sampleContainer}>
            <Text style={styles.sectionLabel}>Select Sample Receipt (For Instant Demo Testing):</Text>
            {sampleReceipts.map((sample, idx) => {
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
                      Preset: {sample.mockOcr.liters_filled}L @ ₹{sample.mockOcr.price_per_liter}/L
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
            title={loading ? 'Extracting Data via AI OCR...' : '⚡ Extract Data via AI OCR'}
            onPress={handleUploadAndAnalyze}
            disabled={loading || !selectedDoc}
            style={styles.submitBtn}
          />
          {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: 12 }} />}
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Important Driver Guidelines:</Text>
          <Text style={styles.bullet}>• Make sure total bill amount and station stamp are clearly visible.</Text>
          <Text style={styles.bullet}>• Verify extracted fuel liters before final submission.</Text>
          <Text style={styles.bullet}>• All submissions undergo automated leakage audit against carrier benchmarks.</Text>
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
