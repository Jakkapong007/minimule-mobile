import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Typography } from '../../theme';

interface Props {
  label: string;
  color?: string;
  bgColor?: string;
  size?: 'sm' | 'md';
}

export function Badge({ label, color = Colors.white, bgColor = Colors.primary, size = 'sm' }: Readonly<Props>) {
  return (
    <View style={[styles.badge, { backgroundColor: bgColor }, size === 'md' && styles.md]}>
      <Text style={[styles.text, { color }, size === 'md' && styles.textMd]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  md: { paddingHorizontal: 12, paddingVertical: 5 },
  text: { fontSize: Typography.xs, fontWeight: Typography.bold, letterSpacing: 0.3 },
  textMd: { fontSize: Typography.sm },
});
