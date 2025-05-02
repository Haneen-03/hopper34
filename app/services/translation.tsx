import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const TranslationPage: React.FC = () => {
  const router = useRouter();

  return (
    <ImageBackground
      source={require("../../assets/images/thefillbac.png")}
      style={styles.backgroundImage}
    >
      
      <View style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.container}>
                <view style={styles.arrow}>
                    <TouchableOpacity onPress={() => router.push("/dashboard")}>
                            <Ionicons name="arrow-back" size={24} color="black" />
                        </TouchableOpacity>
                        </view>
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Translation</Text>
            <Text style={styles.description}>
              Here where you can understand everything with just a few steps
            </Text>

            <TouchableOpacity
              onPress={() =>
                window.open(
                  "https://translate.google.com/?sl=auto&tl=ar&op=translate",
                  "_blank"
                )
              }
            >
              <Text style={styles.link}>Click me!</Text>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/profile")}
          >
            <Ionicons name="person" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/dashboard")}
          >
            <Ionicons name="home" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/football")}
          >
            <Ionicons name="football" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  arrow: {
    marginRight: 400,
  },
  card: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 12,
    elevation: 5,
    width: "100%",
    maxWidth: 600,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#0a2463",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  link: {
    fontSize: 16,
    color: "#1e40af",
    textDecorationLine: "underline",
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#0a2463",
    height: 60,
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  navItem: {
    padding: 8,
  },
});

export default TranslationPage;
