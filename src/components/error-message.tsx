import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';

type ErrorMessageProps = {
  message: string;
  onRetry: () => void;
  title?: string;
};

export function ErrorMessage({
  message,
  onRetry,
  title = 'No pudimos cargar los productos',
}: ErrorMessageProps) {
  return (
    <View accessibilityRole="alert" style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Text style={styles.buttonText}>Reintentar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  message: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.text,
    borderRadius: 999,
    justifyContent: 'center',
    marginTop: 24,
    minHeight: 48,
    paddingHorizontal: 24,
  },
  buttonPressed: {
    opacity: 0.72,
  },
  buttonText: {
    color: colors.inverse,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
