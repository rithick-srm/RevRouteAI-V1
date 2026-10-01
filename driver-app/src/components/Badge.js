import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

export default function Badge({ label, status }) {
  let bg = '#F1F5F9';
  let text = COLORS.text;

  const s = status ? status.toLowerCase() : '';

  if (s === 'moving' || s === 'verified' || s === 'delivered' || s === 'driver_confirmed') {
    bg = COLORS.emeraldLight;
    text = COLORS.success;
  } else if (s === 'idle' || s === 'pending' || s === 'in_progress' || s === 'scheduled') {
    bg = COLORS.blueLight;
    text = COLORS.blue;
  } else if (s === 'maintenance' || s === 'review' || s === 'pending_review' || s === 'requires_review') {
    bg = COLORS.amberLight;
    text = COLORS.warning;
  } else if (s === 'flagged' || s === 'rejected' || s === 'offline') {
    bg = COLORS.roseLight;
    text = COLORS.danger;
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: text }]}>{label || status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
