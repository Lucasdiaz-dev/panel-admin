import { StyleSheet, View } from 'react-native';

import { ProductForm } from '@/components/product-form';
import { colors } from '@/constants/colors';

export default function NewProductScreen() {
  return (
    <View style={styles.container}>
      <ProductForm />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
