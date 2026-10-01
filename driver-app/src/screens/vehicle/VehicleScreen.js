import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { driverApi } from '../../services/api';
import { COLORS } from '../../theme/colors';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Badge from '../../components/Badge';

export default function VehicleScreen() {
  const { currentUser } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  const driverId = currentUser?.id || 2;
  const assignedTruck = currentUser?.assigned_vehicle_id || 'TRK-101';

  const loadVehicle = async () => {
    try {
      setLoading(true);
      const res = await driverApi.getAssignedVehicle(driverId);
      setVehicle(res);
    } catch (e) {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicle();
  }, []);

  return (
    <View style={styles.flex}>
      <Header
        title="Assigned Vehicle Details"
        subtitle={`Fleet Master — ${assignedTruck}`}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadVehicle} colors={[COLORS.blue]} />}
      >
        <Card style={styles.mainCard}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.vehicleClass}>{vehicle?.vehicle_class || 'Heavy Truck'}</Text>
              <Text style={styles.vehicleId}>{assignedTruck}</Text>
            </View>
            <Badge label={vehicle?.status || 'Moving'} status={vehicle?.status || 'Moving'} />
          </View>

          <View style={styles.plateBox}>
            <Text style={styles.plateLabel}>IND</Text>
            <Text style={styles.plateText}>{vehicle?.license_plate || 'TN-01-AB-1234'}</Text>
          </View>
        </Card>

        {/* Telematics & Recorded Location Card */}
        <Text style={styles.sectionHeader}>Recorded Telematics Status</Text>
        <Card>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Last Recorded Location</Text>
            <Text style={styles.detailVal}>{vehicle?.location_name || 'Bengaluru Highway Hub'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Recorded Speed</Text>
            <Text style={styles.detailVal}>{vehicle?.speed_kmh != null ? `${vehicle.speed_kmh} km/h` : '0 km/h'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Recorded Fuel Level</Text>
            <Text style={styles.detailVal}>{vehicle?.fuel_level_pct != null ? `${vehicle.fuel_level_pct}%` : '68%'}</Text>
          </View>

          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.detailLabel}>Assigned Driver</Text>
            <Text style={styles.detailVal}>{vehicle?.current_driver_name || currentUser?.name || 'Ramesh Kumar'}</Text>
          </View>
        </Card>

        {/* Vehicle Baseline Specifications */}
        <Text style={styles.sectionHeader}>Vehicle Baselines (Central Audit Reference)</Text>
        <Card>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Expected Fuel Efficiency</Text>
            <Text style={[styles.detailVal, { color: COLORS.blue }]}>{vehicle?.expected_mileage_km_l || 4.5} km/L</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Expected Fuel Price Baseline</Text>
            <Text style={styles.detailVal}>₹{vehicle?.expected_fuel_price_per_l || 90.0}/L</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Expected Maintenance Range</Text>
            <Text style={styles.detailVal}>₹{vehicle?.expected_maint_cost_min || 6000} - ₹{vehicle?.expected_maint_cost_max || 8000}</Text>
          </View>

          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.detailLabel}>Service Interval Baseline</Text>
            <Text style={styles.detailVal}>{vehicle?.expected_maint_interval_km || 10000} km / {vehicle?.expected_maint_interval_days || 90} days</Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 16, gap: 16 },
  mainCard: { backgroundColor: COLORS.navy, borderColor: '#1E293B' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  vehicleClass: { color: COLORS.teal, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  vehicleId: { color: '#FFFFFF', fontSize: 24, fontWeight: '900', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  plateBox: {
    marginTop: 14,
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#000000',
  },
  plateLabel: { color: COLORS.blue, fontWeight: '900', fontSize: 11 },
  plateText: { color: '#000000', fontWeight: '900', fontSize: 16, letterSpacing: 2, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  sectionHeader: { color: COLORS.text, fontSize: 14, fontWeight: '800', marginTop: 4 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  detailLabel: { color: COLORS.muted, fontSize: 12 },
  detailVal: { color: COLORS.text, fontSize: 12, fontWeight: '700' },
});
