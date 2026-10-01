import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import HomeScreen from '../screens/dashboard/HomeScreen';
import FuelHistoryScreen from '../screens/fuel/FuelHistoryScreen';
import AddFuelScreen from '../screens/fuel/AddFuelScreen';
import FuelOCRReviewScreen from '../screens/fuel/FuelOCRReviewScreen';
import MaintenanceHistoryScreen from '../screens/maintenance/MaintenanceHistoryScreen';
import AddMaintenanceScreen from '../screens/maintenance/AddMaintenanceScreen';
import MaintenanceOCRReviewScreen from '../screens/maintenance/MaintenanceOCRReviewScreen';
import TripsScreen from '../screens/trips/TripsScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import VehicleScreen from '../screens/vehicle/VehicleScreen';

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('Home');

  // Sub-screen stack state for nested flows
  const [fuelSubScreen, setFuelSubScreen] = useState('History'); // 'History' | 'Add' | 'Review'
  const [fuelRouteData, setFuelRouteData] = useState(null);

  const [maintSubScreen, setMaintSubScreen] = useState('History'); // 'History' | 'Add' | 'Review'
  const [maintRouteData, setMaintRouteData] = useState(null);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.navy} />
        <Text style={styles.loadingTitle}>RevRoute AI Driver</Text>
        <Text style={styles.loadingSub}>Initializing Mobile Fleet Terminal...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Navigation prop shim for screens expecting navigation object (e.g. HomeScreen navigation.navigate)
  const navigationProp = {
    navigate: (target, params) => {
      if (target === 'Fuel') {
        setActiveTab('Fuel');
        if (params?.screen === 'AddFuel') {
          setFuelSubScreen('Add');
        } else {
          setFuelSubScreen('History');
        }
      } else if (target === 'Maintenance') {
        setActiveTab('Maintenance');
        if (params?.screen === 'AddMaintenance') {
          setMaintSubScreen('Add');
        } else {
          setMaintSubScreen('History');
        }
      } else if (target === 'Vehicle') {
        setActiveTab('Home');
      } else if (target === 'Trips') {
        setActiveTab('Trips');
      } else if (target === 'Profile') {
        setActiveTab('Profile');
      } else {
        setActiveTab(target);
      }
    }
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeScreen navigation={navigationProp} />;

      case 'Fuel':
        if (fuelSubScreen === 'Add') {
          return (
            <AddFuelScreen 
              onBack={() => setFuelSubScreen('History')}
              onNavigateToReview={(data) => {
                setFuelRouteData(data);
                setFuelSubScreen('Review');
              }}
            />
          );
        }
        if (fuelSubScreen === 'Review') {
          return (
            <FuelOCRReviewScreen 
              routeData={fuelRouteData}
              onBack={() => setFuelSubScreen('Add')}
              onSuccess={() => {
                setFuelSubScreen('History');
                setFuelRouteData(null);
              }}
            />
          );
        }
        return (
          <FuelHistoryScreen 
            onNavigateToAdd={() => setFuelSubScreen('Add')}
          />
        );

      case 'Maintenance':
        if (maintSubScreen === 'Add') {
          return (
            <AddMaintenanceScreen 
              onBack={() => setMaintSubScreen('History')}
              onNavigateToReview={(data) => {
                setMaintRouteData(data);
                setMaintSubScreen('Review');
              }}
            />
          );
        }
        if (maintSubScreen === 'Review') {
          return (
            <MaintenanceOCRReviewScreen 
              routeData={maintRouteData}
              onBack={() => setMaintSubScreen('Add')}
              onSuccess={() => {
                setMaintSubScreen('History');
                setMaintRouteData(null);
              }}
            />
          );
        }
        return (
          <MaintenanceHistoryScreen 
            onNavigateToAdd={() => setMaintSubScreen('Add')}
          />
        );

      case 'Trips':
        return <TripsScreen />;

      case 'Notifications':
        return <NotificationsScreen />;

      case 'Profile':
        return <ProfileScreen />;

      default:
        return <HomeScreen navigation={navigationProp} />;
    }
  };

  const tabs = [
    { id: 'Home', label: 'Home', icon: '🏠' },
    { id: 'Fuel', label: 'Fuel', icon: '⛽' },
    { id: 'Maintenance', label: 'Repair', icon: '🛠️' },
    { id: 'Trips', label: 'Trips', icon: '🚛' },
    { id: 'Profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />
      
      <View style={styles.body}>
        {renderActiveScreen()}
      </View>

      {/* Bottom Mobile Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              style={[styles.tabItem, isActive && styles.activeTabItem]}
              onPress={() => {
                setActiveTab(t.id);
                // Reset sub-screens when switching tabs
                if (t.id === 'Fuel') setFuelSubScreen('History');
                if (t.id === 'Maintenance') setMaintSubScreen('History');
              }}
            >
              <Text style={[styles.tabIcon, isActive && styles.activeTabIcon]}>{t.icon}</Text>
              <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.navy,
  },
  body: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    height: 62,
    backgroundColor: colors.navy,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingBottom: Platform.OS === 'ios' ? 10 : 4,
    paddingTop: 4,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabItem: {
    borderTopWidth: 2,
    borderTopColor: colors.primary,
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
    opacity: 0.6,
  },
  activeTabIcon: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  activeTabLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  loadingSub: {
    color: colors.teal,
    fontSize: 14,
  },
});
