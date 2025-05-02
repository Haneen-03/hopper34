import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

interface Match {
  id: string;
  teamA: string;
  teamB: string;
  date: string;
  time: string;
  location: string;
  status: "upcoming" | "finished" | "stadiums";
  score?: string;
  teamALogo?: string;
  teamBLogo?: string;
  description?: string;
}

export default function FootballScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<"upcoming" | "finished" | "all">("upcoming");
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const matchesCollection = collection(db, 'matches');
      const matchesSnapshot = await getDocs(matchesCollection);

      if (matchesSnapshot.empty) {
        setMatches([]);
      } else {
        const matchesData = matchesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Match[];

        matchesData.sort((a, b) => {
          if (a.status === 'upcoming' && b.status === 'finished') return -1;
          if (a.status === 'finished' && b.status === 'upcoming') return 1;
          return a.date.localeCompare(b.date);
        });

        setMatches(matchesData);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load matches');
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter(match =>
    selectedTab === "all" ? true : match.status === selectedTab
  );

  return (
    <ImageBackground
      source={require("../assets/images/thefillbac.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/dashboard")}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Football Matches</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {["upcoming", "finished", "all"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, selectedTab === tab && styles.activeTab]}
              onPress={() => setSelectedTab(tab as any)}
            >
              <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Matches */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0a2463" />
          </View>
        ) : (
          <ScrollView style={styles.scrollView}
          contentContainerStyle={{
            alignItems: 'center',
            width: '100%',
            paddingBottom: 20,
          }}
          >
            {filteredMatches.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No {selectedTab !== 'all' ? selectedTab : ''} matches found.</Text>
              </View>
            ) : (
              filteredMatches.map((match) => (
                <View key={match.id} style={styles.matchCard}>
                  <View style={styles.teamsContainer}>
                    <View style={styles.teamSection}>
                      {match.teamALogo ? (
                        <Image
                          source={{ uri: match.teamALogo }}
                          style={styles.teamLogo}
                          resizeMode="contain"
                        />
                      ) : (
                        <View style={styles.placeholderLogo}>
                          <Text style={styles.placeholderText}>{match.teamA.charAt(0)}</Text>
                        </View>
                      )}
                      <Text style={styles.teamName}>{match.teamA}</Text>
                    </View>

                    <View style={styles.matchInfo}>
                      {match.status === 'finished' && match.score ? (
                        <Text style={styles.scoreText}>{match.score}</Text>
                      ) : (
                        <Text style={styles.vsText}>VS</Text>
                      )}
                      <Text style={styles.matchTime}>{match.time}</Text>
                    </View>

                    <View style={styles.teamSection}>
                      {match.teamBLogo ? (
                        <Image
                          source={{ uri: match.teamBLogo }}
                          style={styles.teamLogo}
                          resizeMode="contain"
                        />
                      ) : (
                        <View style={styles.placeholderLogo}>
                          <Text style={styles.placeholderText}>{match.teamB.charAt(0)}</Text>
                        </View>
                      )}
                      <Text style={styles.teamName}>{match.teamB}</Text>
                    </View>
                  </View>

                  <View style={styles.matchDetails}>
                    <Text style={styles.matchDate}>
                      <Ionicons name="calendar-outline" size={14} color="#666" /> {match.date}
                    </Text>
                    <Text style={styles.matchLocation}>
                      <Ionicons name="location-outline" size={14} color="#666" /> {match.location}
                    </Text>
                    <Text style={match.status === 'upcoming' ? styles.upcomingStatus : styles.finishedStatus}>
                      <Ionicons
                        name={match.status === 'upcoming' ? "time-outline" : "checkmark-circle-outline"}
                        size={14}
                        color={match.status === 'upcoming' ? "#28a745" : "#dc3545"}
                      /> {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.detailButton}
                    onPress={() => {
                      router.push({
                        pathname: "/football-detail",
                        params: { id: match.id }
                      });
                    }}
                  >
                    <Text style={styles.buttonText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>
        )}

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
}

const styles = StyleSheet.create({
 filterContainer: {
    width: '92%',
    alignSelf: 'center',
    },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0a2463",
    marginTop: 15,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    backgroundColor: "rgba(240, 240, 240, 0.8)",
    paddingHorizontal: 10,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#ccc",
  },
  activeTab: {
    backgroundColor: "#0a2463",
  },
  tabText: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 12,
  },
  activeTabText: {
    color: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  scrollView: {
    padding: 16,
    flex: 1,
    width: '100%',
  },
  matchCard: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    alignSelf: 'center', 
    width: '92%',
  },
  teamsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  teamSection: {
    alignItems: "center",
    width: "35%",
  },
  teamLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
    backgroundColor: '#f0f0f0',
  },
  placeholderLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#0a2463",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  placeholderText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  teamName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0a2463",
    textAlign: "center",
  },
  matchInfo: {
    alignItems: "center",
    width: "30%",
  },
  vsText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0a2463",
  },
  scoreText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0a2463",
  },
  matchTime: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  matchDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    paddingTop: 12,
    marginBottom: 12,
  },
  matchDate: {
    fontSize: 13,
    color: "#666",
  },
  matchLocation: {
    fontSize: 13,
    color: "#666",
  },
  upcomingStatus: {
    fontSize: 13,
    color: "#28a745",
  },
  finishedStatus: {
    fontSize: 13,
    color: "#dc3545",
  },
  detailButton: {
    backgroundColor: "#0a2463",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#0a2463',
    height: 60,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  navItem: {
    padding: 8,
  },
});
