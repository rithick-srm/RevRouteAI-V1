import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { driverApi } from '../../services/api';

export default function TripsScreen({ onBack }) {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrips = async () => {
    try {
      setError(null);
      const res = await driverApi.getDriverTrips(user?.id || 2);
      setTrips(res.trips || []);
    } catch (err) {
      setError(err.message || 'Could not load assigned trips');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrips();
  };

  const renderTrip = ({ item }) => {
    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.shipmentId}>{item.shipment_id || item.id}</Text>
            <Text style={styles.vehicleTag}>🚛 Truck: {item.vehicle_id}</Text>
          </View>
          <Badge status={item.status || 'IN_TRANSIT'} />
        </View>

        <View style={styles.routeContainer}>
          <View style={styles.routePoint}>
            <Text style={styles.dotOrigin}>🟢</Text>
            <View style={styles.routeText}>
              <Text style={styles.routeLabel}>ORIGIN</Text>
              <Text style={styles.routeLocation}>{item.origin}</Text>
            </View>
          </View>

          <View style={styles.routeLine} />

          <View style={styles.routePoint}>
            <Text style={styles.dotDest}>🔴</Text>
            <View style={styles.routeText}>
              <Text style={styles.routeLabel}>DESTINATION</Text>
              <Text style={styles.routeLocation}>{item.destination}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Customer</Text>
            <Text style={styles.metaVal}>{item.customer_name || 'N/A'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Cargo / Type</Text>
            <Text style={styles.metaVal}>{item.cargo_description || 'General Freight'}</Text>
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Agreed Rate</Text>
            <Text style={styles.rateVal}>₹{(item.agreed_rate || 0).toLocaleString()}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Pickup / Delivery Date</Text>
            <Text style={styles.metaVal}>{item.dispatch_date || item.created_at?.split('T')[0] || 'Today'}</Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Assigned Trips" 
        subtitle="Manage current shipments and route schedules" 
        showBack={!!onBack}
        onBack={onBack}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Fetching Assigned Trips...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchTrips}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : trips.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🚚</Text>
          <Text style={styles.emptyTitle}>No Active Trips Assigned</Text>
          <Text style={styles.emptySubtitle}>You currently have no active assigned route shipments.</Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.shipment_id || String(item.id)}
          renderItem={renderTrip}
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
  shipmentId: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  vehicleTag: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  routeContainer: {
    marginVertical: 12,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotOrigin: {
    fontSize: 12,
    marginRight: 8,
  },
  dotDest: {
    fontSize: 12,
    marginRight: 8,
  },
  routeLine: {
    height: 16,
    width: 2,
    backgroundColor: colors.border,
    marginLeft: 6,
    marginVertical: 2,
  },
  routeText: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '700',
  },
  routeLocation: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  metaVal: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
    marginTop: 2,
  },
  rateVal: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 2,
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
  },
  errorText: {
    color: colors.danger,
    marginBottom: 12,
  },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
});
