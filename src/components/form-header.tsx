import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';

type FormHeaderProps = {
  title: string;
};

export function FormHeader({ title }: FormHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  function goBack() {
    router.back();
  }

  return (
    <View style={[styles.nav, { paddingTop: insets.top + 4 }]}>
      <Pressable style={styles.iconBtn} onPress={goBack} accessibilityLabel="Volver">
        <SymbolView
          name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
          size={18}
          tintColor={colors.text}
        />
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <Pressable style={styles.iconBtn} onPress={goBack} accessibilityLabel="Cancelar">
        <SymbolView
          name={{ ios: 'xmark', android: 'close', web: 'close' }}
          size={18}
          tintColor={colors.text}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
    backgroundColor: colors.background,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: colors.text,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
