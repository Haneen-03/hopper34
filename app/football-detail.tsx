// app/football-detail.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  ImageBackground,
  ActivityIndicator,
  Alert,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface Match {
  id: string;
  teamA: string;
  teamB: string;
  date: string;
  time: string;
  location: string;
  status: 'upcoming' | 'finished';
  score?: string;
  teamALogo?: string;
  teamBLogo?: string;
  description?: string;
  ticketUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function MatchDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params.id as string;
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      fetchMatchDetails(id);
    }
  }, [id]);

  const fetchMatchDetails = async (matchId: string) => {
    setLoading(true);
    try {
      const matchRef = doc(db, 'matches', matchId);
      const matchDoc = await getDoc(matchRef);
      
      if (matchDoc.exists()) {
        const matchData = {
          id: matchDoc.id,
          ...matchDoc.data()
        } as Match;
        setMatch(matchData);
      } else {
        Alert.alert('Error', 'Match not found');
      }
    } catch (error) {
      console.error('Error fetching match details:', error);
      Alert.alert('Error', 'Failed to load match details');
    } finally {
      setLoading(false);
    }
  };

  const openMap = () => {
    if (match && match.location) {
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(match.location)}`;
      Linking.openURL(mapUrl).catch(err => {
        Alert.alert('Error', 'Could not open map');
      });
    }
  };

  if (loading) {
    return (
      <ImageBackground
        source={require("../assets/images/thefillbac.png")}
        style={styles.backgroundImage}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a2463" />
        </View>
      </ImageBackground>
    );
  }

  if (!match) {
    return (
      <ImageBackground
        source={require("../assets/images/thefillbac.png")}
        style={styles.backgroundImage}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Match Details</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Match not found</Text>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.push('/football')}
            >
              <Text style={styles.backButtonText}>Back to Matches</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("../assets/images/thefillbac.png")}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Match Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.matchCard}>
            <View 
              style={[
                styles.statusBadge, 
                match.status === 'upcoming' ? styles.upcomingBadge : styles.finishedBadge
              ]}
            >
              <Text style={styles.statusText}>
                {match.status === 'upcoming' ? 'Upcoming' : 'Finished'}
              </Text>
            </View>

            <View style={styles.teamsContainer}>
              <View style={styles.teamColumn}>
                {match.teamALogo ? (
                  <Image 
                    source={{ uri: match.teamALogo }} 
                    style={styles.teamLogo}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.placeholderLogo}>
                    <Text style={styles.placeholderText}>{match.teamA.charAt(0)}</Text>
                  </View>
                )}
                <Text style={styles.teamName}>{match.teamA}</Text>
              </View>

              {match.status === 'finished' && match.score ? (
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreText}>{match.score}</Text>
                </View>
              ) : (
                <View style={styles.vsContainer}>
                  <Text style={styles.vsText}>VS</Text>
                  <Text style={styles.timeText}>{match.time}</Text>
                </View>
              )}

              <View style={styles.teamColumn}>
                {match.teamBLogo ? (
                  <Image 
                    source={{ uri: match.teamBLogo }} 
                    style={styles.teamLogo}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.placeholderLogo}>
                    <Text style={styles.placeholderText}>{match.teamB.charAt(0)}</Text>
                  </View>
                )}
                <Text style={styles.teamName}>{match.teamB}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={22} color="#0a2463" />
                <Text style={styles.infoText}>{match.date}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={22} color="#0a2463" />
                <Text style={styles.infoText}>{match.time}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={22} color="#0a2463" />
                <Text style={styles.infoText}>{match.location}</Text>
              </View>
            </View>

            {match.description && (
              <View style={styles.descriptionSection}>
                <Text style={styles.descriptionTitle}>About the Match</Text>
                <Text style={styles.descriptionText}>{match.description}</Text>
              </View>
            )}

            <TouchableOpacity 
              style={styles.mapButton}
              onPress={openMap}
            >
              <Ionicons name="map-outline" size={18} color="white" />
              <Text style={styles.mapButtonText}>View Location on Map</Text>
            </TouchableOpacity>

            {match.ticketUrl && (
              <TouchableOpacity
              style={[styles.mapButton, { marginTop: 10 }]}
                onPress={() => {
                  if (match.ticketUrl) {
                    Linking.openURL(match.ticketUrl);
                  } else {
                    Alert.alert("Ticket Unavailable", "No ticket link available for this match.");
                  }
                }}
              >
                <Ionicons name="pricetag-outline" size={18} color="white" />
                <Text style={styles.mapButtonText}>Buy Tickets</Text>
              </TouchableOpacity>
            )}
          </View>

          {match.status === 'upcoming' && (
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Looking Forward</Text>
              <Text style={styles.infoCardText}>
                Don't miss this exciting match between {match.teamA} and {match.teamB}!
                Make sure to arrive early to find good seats.
              </Text>
            </View>
          )}

          {match.status === 'finished' && (
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Match Complete</Text>
              <Text style={styles.infoCardText}>
                This match has been completed with a final score of {match.score}.
                Check out other upcoming matches in our schedule!
              </Text>
            </View>
          )}
        </ScrollView>

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
  backgroundImage: {
    flex: 1,
    resizeMode: 'contain',
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#0a2463',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0a2463',
    marginTop: 15,
  },
  scrollView: {
    padding: 16,
  },
  matchCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  statusBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    zIndex: 10,
  },
  upcomingBadge: {
    backgroundColor: '#28a745',
  },
  finishedBadge: {
    backgroundColor: '#dc3545',
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  teamColumn: {
    alignItems: 'center',
    width: '40%',
  },
  teamLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
  },
  placeholderLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0a2463',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  placeholderText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a2463',
    textAlign: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0a2463',
  },
  vsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0a2463',
    marginBottom: 5,
  },
  timeText: {
    fontSize: 16,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 20,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  descriptionSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a2463',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  mapButton: {
    backgroundColor: '#0a2463',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  mapButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#0a2463',
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a2463',
    marginBottom: 10,
  },
  infoCardText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
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