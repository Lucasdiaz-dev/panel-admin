import { StyleSheet, Text, View } from 'react-native';

export default function NewProductScreen() {
  return (
    <View style={styles.container}>
      <Text>Nuevo producto</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
