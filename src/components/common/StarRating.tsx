import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../theme';

interface Props {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export function StarRating({ rating, maxRating = 5, size = 16, interactive = false, onRate }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: maxRating }, (_, i) => {
        const filled = i < Math.round(rating);
        if (interactive) {
          return (
            <TouchableOpacity key={i} onPress={() => onRate?.(i + 1)} activeOpacity={0.7}>
              <Text style={{ fontSize: size, color: filled ? Colors.warning : Colors.gray300 }}>★</Text>
            </TouchableOpacity>
          );
        }
        return (
          <Text key={i} style={{ fontSize: size, color: filled ? Colors.warning : Colors.gray300 }}>★</Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 2 },
});
