import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const AboutUsPage: React.FC = () => {
  const router = useRouter();

  return (
    <ImageBackground
      source={require("../assets/images/thefillbac.png")}
      style={styles.backgroundImage}
    >
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
        <view style={styles.arrow}>
            <TouchableOpacity onPress={() => router.push("/dashboard")}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                </view>
          <View style={styles.card}>
            <Text style={styles.title}>Welcome to Hoper</Text>
            <Text style={styles.description}>
              Your ultimate companion for exploring the FIFA World Cup in Saudi
              Arabia. Enjoy your journey and have an unforgettable experience
              during the tournament.
            </Text>

            <Text style={styles.sectionTitle}>About Hopper</Text>
            <Text style={styles.sectionContent}>
             Hopper is a travel companion app designed for football fans and tourists visiting Saudi Arabia during the FIFA World Cup.
            The app connects you with essential services and information to enhance your experience.
            Whether you're a local or international visitor, Hoper helps you navigate Saudi Arabia with ease, 
            ensuring you don't miss any of the excitement both on and off the field.
            </Text>

            <Text style={styles.sectionTitle}>Key Features</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureTitle}>User-Friendly Interface</Text>
                <Text style={styles.featureDescription}>
                Navigate easily between different services and football information with our intuitive design.
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureTitle}>Event Updates</Text>
                <Text style={styles.featureDescription}>
                  Stay up-to-date with live match schedules and any event changes
                  during your visit.
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureTitle}>Comprehensive Service Directory</Text>
                <Text style={styles.featureDescription}>
                Find accommodations, restaurants, transportation options, guides, SIM cards, 
                and banking services available throughout Saudi Arabia.
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Our Mission</Text>
            <Text style={styles.sectionContent}>
              At Hoper, we aim to make the experience of attending the FIFA World
              Cup in Saudi Arabia seamless and enjoyable. Our goal is to provide a
              tool that helps you organize your trip, explore key destinations,
              and stay updated on event schedules to ensure a fulfilling and
              memorable experience.
            </Text>
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
    flexGrow: 1,
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
    maxWidth: 600,
    width: "100%",
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0a2463",
    marginBottom: 12,
    marginTop: 24,
  },
  sectionContent: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  featuresList: {
    width: "100%",
    marginBottom: 20,
  },
  featureItem: {
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#0a2463",
  },
  featureDescription: {
    fontSize: 16,
    color: "#666",
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

export default AboutUsPage;
