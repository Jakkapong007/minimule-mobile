import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Colors } from '../../theme';

export function LoadingSpinner({ fullScreen = false }: { fullScreen?: boolean }) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: 32 },
  fullScreen: { flex: 1 },
});
