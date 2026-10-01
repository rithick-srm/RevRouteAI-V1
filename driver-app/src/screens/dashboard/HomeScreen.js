import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { driverApi } from '../../services/api';
import { COLORS } from '../../theme/colors';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Badge from '../../components/Badge';

export default function HomeScreen({ navigation }) {
  const { currentUser } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [trips, setTrips] = useState([]);
  const [history, setHistory] = useState({ fuel_logs: [], maintenance_logs: [] });
  const [loading, setLoading] = useState(true);

  const driverId = currentUser?.id || 2;
  const assignedTruck = currentUser?.assigned_vehicle_id || 'TRK-101';

  const loadData = async () => {
    try {
      setLoading(true);
      const [vehRes, tripsRes, histRes] = await Promise.all([
        driverApi.getAssignedVehicle(driverId).catch(() => null),
        driverApi.getDriverTrips(driverId).catch(() => ({ trips: [] })),
        driverApi.getDriverHistory(driverId).catch(() => ({ fuel_logs: [], maintenance_logs: [] }))
      ]);
      setVehicle(vehRes);
      setTrips(tripsRes?.trips || []);
      setHistory(histRes);
    } catch (e) {
      // Error handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const latestFuel = history.fuel_logs?.[0];
  const activeTrip = trips?.[0];

  return (
    <View style={styles.flex}>
      <Header
        title="RevRoute AI Driver"
        subtitle={`Driver Portal — ${currentUser?.name || 'Ramesh Kumar'}`}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} colors={[COLORS.blue]} />}
      >
        {/* Assigned Vehicle Highlight Banner */}
        <Card style={styles.vehicleCard}>
          <View style={styles.vehicleHeader}>
            <View>
              <Text style={styles.vehicleLabel}>Assigned Vehicle</Text>
              <Text style={styles.vehicleId}>{assignedTruck}</Text>
            </View>
            <Badge label={vehicle?.status || 'Moving'} status={vehicle?.status || 'Moving'} />
          </View>

          <View style={styles.vehicleMetaGrid}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>License Plate</Text>
              <Text style={styles.metaVal}>{vehicle?.license_plate || 'TN-01-AB-1234'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Baseline km/L</Text>
              <Text style={styles.metaVal}>{vehicle?.expected_mileage_km_l || '4.5'} km/L</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Last Recorded Location</Text>
              <Text style={styles.metaVal}>{vehicle?.location_name || 'Bengaluru Highway Hub'}</Text>
            </View>
          </View>
        </Card>

        {/* Quick Actions Grid */}
        <Text style={styles.sectionHeader}>Quick Submission Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.blue }]}
            onPress={() => navigation.navigate('Fuel', { screen: 'AddFuel' })}
          >
            <Text style={styles.actionTitle}>+ Add Fuel Entry</Text>
            <Text style={styles.actionSub}>Upload bill & log liters</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.dark }]}
            onPress={() => navigation.navigate('Maintenance', { screen: 'AddMaintenance' })}
          >
            <Text style={styles.actionTitle}>+ Report Repair</Text>
            <Text style={styles.actionSub}>Log service & parts cost</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Assigned Trip */}
        <Text style={styles.sectionHeader}>Assigned Trip</Text>
        {activeTrip ? (
          <Card style={styles.tripCard}>
            <View style={styles.tripRow}>
              <Text style={styles.tripId}>{activeTrip.shipment_id}</Text>
              <Badge label={activeTrip.status} status={activeTrip.status} />
            </View>
            <Text style={styles.tripRoute}>{activeTrip.origin} → {activeTrip.destination}</Text>
            <Text style={styles.tripSub}>Distance: {activeTrip.distance_km} km | Cargo: {activeTrip.cargo_weight_kg} kg</Text>
          </Card>
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No active trip assigned today for {assignedTruck}.</Text>
          </Card>
        )}

        {/* Recent Submissions Summary */}
        <Text style={styles.sectionHeader}>Recent Driver Submission</Text>
        {latestFuel ? (
          <Card style={styles.recentCard}>
            <View style={styles.tripRow}>
              <Text style={styles.recentTitle}>Fuel — {latestFuel.fuel_station || 'Station'}</Text>
              <Badge label={latestFuel.manager_review_status || 'PENDING_REVIEW'} status={latestFuel.manager_review_status} />
            </View>
            <Text style={styles.recentCost}>₹{latestFuel.total_cost?.toLocaleString('en-IN')}</Text>
            <Text style={styles.recentSub}>{latestFuel.liters_filled} L @ ₹{latestFuel.price_per_liter}/L • {latestFuel.fuel_date}</Text>
          </Card>
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No recent fuel entries logged.</Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 16, gap: 16 },
  vehicleCard: {
    backgroundColor: COLORS.navy,
    borderColor: '#1E293B',
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  vehicleLabel: {
    color: COLORS.teal,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  vehicleId: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  vehicleMetaGrid: {
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 12,
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: { color: '#94A3B8', fontSize: 11 },
  metaVal: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  sectionHeader: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    justifyContent: 'center',
  },
  actionTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  actionSub: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    marginTop: 2,
  },
  tripCard: {
    gap: 4,
  },
  tripRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripId: {
    color: COLORS.blue,
    fontWeight: '800',
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  tripRoute: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  tripSub: {
    color: COLORS.muted,
    fontSize: 11,
  },
  recentCard: {
    gap: 4,
  },
  recentTitle: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 13,
  },
  recentCost: {
    color: COLORS.blue,
    fontSize: 18,
    fontWeight: '900',
  },
  recentSub: {
    color: COLORS.muted,
    fontSize: 11,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 12,
  },
});
