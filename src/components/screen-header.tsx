import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';

type ScreenHeaderProps = {
  title: string;
  onBack?: () => void;
  compact?: boolean;
};

export function ScreenHeader({ title, onBack, compact = false }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable
          accessibilityLabel="Volver"
          accessibilityRole="button"
          onPress={onBack}
          style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
        >
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
      ) : (
        <View style={styles.spacer} />
      )}
      <Text numberOfLines={1} style={[styles.title, compact && styles.titleCompact]}>
        {title}
      </Text>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flexDirection: 'row',
    gap: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 999,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  iconButtonPressed: {
    opacity: 0.65,
  },
  backIcon: {
    color: colors.text,
    fontSize: 32,
    lineHeight: 36,
  },
  spacer: {
    height: 40,
    width: 40,
  },
  title: {
    color: colors.text,
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2.5,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  titleCompact: {
    fontSize: 13,
    letterSpacing: 1,
  },
});
