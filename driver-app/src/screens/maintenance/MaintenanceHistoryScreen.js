import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { driverApi } from '../../services/api';

export default function MaintenanceHistoryScreen({ onNavigateToAdd, onBack }) {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    try {
      setError(null);
      const data = await driverApi.getDriverHistory(user?.id || 2);
      setLogs(data.maintenance_logs || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch maintenance history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const renderItem = ({ item }) => {
    const isDup = item.notes?.includes('Possible duplicate');
    const reviewStatus = item.manager_review_status || 'PENDING_REVIEW';
    const ocrStatus = item.ocr_status || 'DRIVER_CONFIRMED';

    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.repairId}>{item.repair_id}</Text>
            <Text style={styles.dateText}>🔧 {item.service_date}</Text>
          </View>
          <View style={styles.badgeContainer}>
            <Badge status={reviewStatus} />
            {isDup && <Text style={styles.dupTag}>⚠️ Duplicate Flag</Text>}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailGrid}>
          <View style={styles.detailCol}>
            <Text style={styles.label}>Repair Type</Text>
            <Text style={styles.value}>{item.repair_type || 'General Service'}</Text>
          </View>
          <View style={styles.detailCol}>
            <Text style={styles.label}>Service Center</Text>
            <Text style={styles.value}>{item.service_center || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.detailGrid}>
          <View style={styles.detailCol}>
            <Text style={styles.label}>Parts Cost</Text>
            <Text style={styles.value}>₹{(item.parts_cost || 0).toLocaleString()}</Text>
          </View>
          <View style={styles.detailCol}>
            <Text style={styles.label}>Labor Cost</Text>
            <Text style={styles.value}>₹{(item.labor_cost || 0).toLocaleString()}</Text>
          </View>
          <View style={styles.detailCol}>
            <Text style={styles.label}>Total Repair</Text>
            <Text style={styles.costValue}>₹{(item.total_repair_cost || 0).toLocaleString()}</Text>
          </View>
        </View>

        {item.benchmark_cost > 0 && (
          <Text style={styles.benchmarkText}>
            📊 Carrier Benchmark: ₹{item.benchmark_cost.toLocaleString()}
          </Text>
        )}

        <View style={styles.ocrStatusRow}>
          <Text style={styles.ocrLabel}>OCR Status:</Text>
          <Text style={styles.ocrVal}>{ocrStatus}</Text>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Maintenance Logs" 
        subtitle="Track reported vehicle repairs and service bills" 
        showBack={!!onBack}
        onBack={onBack}
      />

      <View style={styles.topActions}>
        <TouchableOpacity style={styles.addButton} onPress={onNavigateToAdd}>
          <Text style={styles.addButtonText}>+ Report Maintenance / Repair</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading Maintenance Records...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchHistory}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : logs.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🛠️</Text>
          <Text style={styles.emptyTitle}>No Repair Records Yet</Text>
          <Text style={styles.emptySubtitle}>Upload service bills to report vehicle repairs for audit verification.</Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.repair_id}
          renderItem={renderItem}
          contentContainerStyle={styles.listPadding}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topActions: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  listPadding: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  repairId: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dateText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  badgeContainer: {
    alignItems: 'flex-end',
  },
  dupTag: {
    fontSize: 10,
    color: colors.warning,
    fontWeight: '700',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  detailGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailCol: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
    marginTop: 2,
  },
  costValue: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '800',
    marginTop: 2,
  },
  benchmarkText: {
    fontSize: 12,
    color: colors.teal,
    fontWeight: '600',
    marginTop: 4,
  },
  ocrStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  ocrLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginRight: 4,
  },
  ocrVal: {
    fontSize: 11,
    color: colors.teal,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 10,
    color: colors.textMuted,
    fontSize: 14,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginBottom: 12,
  },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
  },
});
