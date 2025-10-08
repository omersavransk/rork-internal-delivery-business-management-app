import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View, I18nManager } from "react-native";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "אופס!" }} />
      <View style={styles.container}>
        <Text style={styles.title}>הדף לא נמצא</Text>

        <Link href="/(tabs)" style={styles.link}>
          <Text style={styles.linkText}>חזרה לדף הבית</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold" as const,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: "#2563EB",
  },
});
