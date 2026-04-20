import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { Colors, Radius, Typography } from '../../theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  icon,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const variantStyle = { primary: styles.primary, secondary: styles.secondary, ghost: styles.ghost, danger: styles.danger, outline: styles.outline }[variant];
  const sizeStyle = { sm: styles.size_sm, md: styles.size_md, lg: styles.size_lg }[size];
  const textVariantStyle = { primary: styles.text_primary, secondary: styles.text_secondary, ghost: styles.text_ghost, danger: styles.text_danger, outline: styles.text_outline }[variant];
  const textSizeStyle = { sm: styles.textSize_sm, md: styles.textSize_md, lg: styles.textSize_lg }[size];

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={isDisabled}
      style={[styles.base, variantStyle, sizeStyle, fullWidth && styles.fullWidth, isDisabled && styles.disabled, style]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' ? Colors.white : Colors.primary} />
      ) : (
        <View style={styles.inner}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text style={[styles.text, textVariantStyle, textSizeStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', borderRadius: Radius.md },
  inner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconWrap: { marginRight: 2 },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.45 },

  primary: { backgroundColor: Colors.primary },
  secondary: { backgroundColor: Colors.gray900 },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: Colors.error },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.gray300 },

  size_sm: { paddingVertical: 8, paddingHorizontal: 14 },
  size_md: { paddingVertical: 13, paddingHorizontal: 20 },
  size_lg: { paddingVertical: 16, paddingHorizontal: 28 },

  text: { fontWeight: Typography.bold, letterSpacing: 0.2 },
  text_primary: { color: Colors.white },
  text_secondary: { color: Colors.white },
  text_ghost: { color: Colors.primary },
  text_danger: { color: Colors.white },
  text_outline: { color: Colors.gray700 },
  textSize_sm: { fontSize: 13 },
  textSize_md: { fontSize: 15 },
  textSize_lg: { fontSize: 16 },
});
