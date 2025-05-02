// app/admin/football.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  Alert,
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  Modal,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { collection, getDocs, doc, getDoc, updateDoc, deleteDoc, addDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import AdminProtectedRoute from '../../components/AdminProtectedRoute';

// Define TypeScript interfaces
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

function FootballManagement() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [currentMatch, setCurrentMatch] = useState<Match>({
    id: '', 
    teamA: '', 
    teamB: '', 
    date: '', 
    time: '',
    location: '',
    status: 'upcoming'
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'finished'>('all');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      console.log("Fetching football matches...");
      const matchesCollection = collection(db, 'matches');
      const matchesSnapshot = await getDocs(matchesCollection);
      
      console.log("Matches snapshot size:", matchesSnapshot.size);
      
      if (matchesSnapshot.empty) {
        console.log("No matches found");
        setMatches([]);
      } else {
        console.log("Matches found in Firestore");
        const matchesData = matchesSnapshot.docs.map(doc => {
          console.log("Match doc:", doc.id, doc.data());
          return {
            id: doc.id,
            ...doc.data()
          };
        }) as Match[];
        
        // Sort matches: upcoming first, then by date
        matchesData.sort((a, b) => {
          // First sort by status (upcoming first)
          if (a.status === 'upcoming' && b.status === 'finished') return -1;
          if (a.status === 'finished' && b.status === 'upcoming') return 1;
          
          // If same status, sort by date (assuming date strings can be compared)
          return a.date.localeCompare(b.date);
        });
        
        console.log("Setting matches:", matchesData);
        setMatches(matchesData);
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
      Alert.alert('Error', 'Failed to load matches');
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  // Generate a URL-friendly slug from a string
  const createSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove non-word chars
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/-+/g, '-')      // Replace multiple hyphens with a single one
      .trim();                  // Trim leading/trailing spaces
  };

  // Generate a custom ID for a match
  const generateMatchId = (match: Match): string => {
    const teamASlug = createSlug(match.teamA);
    const teamBSlug = createSlug(match.teamB);
    const dateSlug = createSlug(match.date);
    
    return `${teamASlug}-vs-${teamBSlug}-${dateSlug}`;
  };

  
  const handleSaveMatch = async () => {
    if (!currentMatch.teamA) {
      Alert.alert('Missing Information', 'Please enter Team A name');
      return;
    }
    if (!currentMatch.teamB) {
      Alert.alert('Missing Information', 'Please enter Team B name');
      return;
    }
    if (!currentMatch.date) {
      Alert.alert('Missing Information', 'Please enter a match date');
      return;
    }
    if (!currentMatch.time) {
      Alert.alert('Missing Information', 'Please enter a match time');
      return;
    }
    if (!currentMatch.location) {
      Alert.alert('Missing Information', 'Please enter a match location');
      return;
    }
  
    try {
      setLoading(true);
  
      if (isEditing) {
        const matchRef = doc(db, 'matches', currentMatch.id);
        const updateData = {
          teamA: currentMatch.teamA,
          teamB: currentMatch.teamB,
          date: currentMatch.date,
          time: currentMatch.time,
          location: currentMatch.location,
          status: currentMatch.status,
          score: currentMatch.score || '',
          teamALogo: currentMatch.teamALogo || '',
          teamBLogo: currentMatch.teamBLogo || '',
          description: currentMatch.description || '',
          ticketUrl: currentMatch.ticketUrl || '',
          updatedAt: new Date().toISOString(),
        };
        await updateDoc(matchRef, updateData);
        setMatches(matches.map(m => m.id === currentMatch.id ? { ...currentMatch } : m));
        Alert.alert('Success', 'Match updated successfully');
      } else {
        const customId = generateMatchId(currentMatch);
        const matchData = {
          teamA: currentMatch.teamA,
          teamB: currentMatch.teamB,
          date: currentMatch.date,
          time: currentMatch.time,
          location: currentMatch.location,
          status: currentMatch.status,
          score: currentMatch.score || '',
          teamALogo: currentMatch.teamALogo || '',
          teamBLogo: currentMatch.teamBLogo || '',
          description: currentMatch.description || '',
          ticketUrl: currentMatch.ticketUrl || '',
          createdAt: new Date().toISOString(),
        };
        const matchRef = doc(db, 'matches', customId);
        await setDoc(matchRef, matchData);
        setMatches([...matches, { ...currentMatch, id: customId }]);
        Alert.alert('Success', 'Match added successfully');
      }
  
      setModalVisible(false);
      setCurrentMatch({
        id: '',
        teamA: '',
        teamB: '',
        date: '',
        time: '',
        location: '',
        status: 'upcoming',
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving match:', error);
      Alert.alert('Error', 'Failed to save match');
    } finally {
      setLoading(false);
    }
  };
  

  const handleDeleteMatch = async (matchId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this match?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const matchRef = doc(db, 'matches', matchId);
              await deleteDoc(matchRef);
              setMatches(matches.filter(match => match.id !== matchId));
              Alert.alert('Success', 'Match deleted successfully');
            } catch (error) {
              console.error('Error deleting match:', error);
              Alert.alert('Error', 'Failed to delete match');
            }
          }
        }
      ]
    );
  };

  const openEditModal = (match: Match) => {
    setCurrentMatch(match);
    setIsEditing(true);
    setModalVisible(true);
  };

  const openAddModal = () => {
    setCurrentMatch({
      id: '', 
      teamA: '', 
      teamB: '', 
      date: '', 
      time: '',
      location: '',
      status: 'upcoming'
    });
    setIsEditing(false);
    setModalVisible(true);
  };

  const openMatchPreview = (match: Match) => {
    router.push({
      pathname: "/football-detail",
      params: { id: match.id }
    });
  };

  const filteredMatches = filterStatus === 'all' 
    ? matches 
    : matches.filter(match => match.status === filterStatus);

  return (
    <ImageBackground
      source={require("../../assets/images/thefillbac.png")}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/admin")}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Football Matches</Text>
          <TouchableOpacity onPress={openAddModal}>
            <Ionicons name="add-circle" size={24} color="#0a2463" />
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0a2463" />
          </View>
        ) : (
          <ScrollView style={styles.scrollView}>
            {/* Stats Overview */}
            <View style={styles.statsContainer}>
              <TouchableOpacity 
                style={[styles.statBox, filterStatus === 'all' && styles.activeStatBox]} 
                onPress={() => setFilterStatus('all')}
              >
                <Text style={[styles.statNumber, filterStatus === 'all' && styles.activeStatText]}>
                  {matches.length}
                </Text>
                <Text style={[styles.statLabel, filterStatus === 'all' && styles.activeStatText]}>
                  All Matches
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.statBox, filterStatus === 'upcoming' && styles.activeStatBox]} 
                onPress={() => setFilterStatus('upcoming')}
              >
                <Text style={[styles.statNumber, filterStatus === 'upcoming' && styles.activeStatText]}>
                  {matches.filter(m => m.status === 'upcoming').length}
                </Text>
                <Text style={[styles.statLabel, filterStatus === 'upcoming' && styles.activeStatText]}>
                  Upcoming
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.statBox, filterStatus === 'finished' && styles.activeStatBox]} 
                onPress={() => setFilterStatus('finished')}
              >
                <Text style={[styles.statNumber, filterStatus === 'finished' && styles.activeStatText]}>
                  {matches.filter(m => m.status === 'finished').length}
                </Text>
                <Text style={[styles.statLabel, filterStatus === 'finished' && styles.activeStatText]}>
                  Finished
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.tabContainer}>
              <Text style={styles.tabTitle}>
                {filterStatus === 'all' ? 'All Matches' : 
                 filterStatus === 'upcoming' ? 'Upcoming Matches' : 'Finished Matches'}
              </Text>
            </View>
            
            {filteredMatches.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  No {filterStatus !== 'all' ? filterStatus : ''} matches found. 
                  Click the + button to add a match.
                </Text>
              </View>
            ) : (
              filteredMatches.map((match) => (
                <View key={match.id} style={styles.matchCard}>
                  <TouchableOpacity 
                    style={styles.matchContent}
                    onPress={() => openMatchPreview(match)}
                  >
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
                      <Text style={styles.matchDetail}>
                        <Ionicons name="calendar-outline" size={14} color="#666" /> {match.date}
                      </Text>
                      <Text style={styles.matchDetail}>
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
                    
                    {/* Document ID display for reference */}
                    <Text style={styles.idText}>ID: {match.id}</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.matchActions}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => openEditModal(match)}
                    >
                      <Ionicons name="create-outline" size={20} color="white" />
                    </TouchableOpacity>
                    {/* <TouchableOpacity 
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteMatch(match.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color="white" />
                    </TouchableOpacity> */}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        )}
        
        {/* Match Edit/Add Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {isEditing ? 'Edit Football Match' : 'Add New Football Match'}
              </Text>

              <Text style={styles.inputLabel}>Ticket URL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://ticketing.com/match123"
                  value={currentMatch.ticketUrl}
                  onChangeText={(text) => setCurrentMatch({ ...currentMatch, ticketUrl: text })}
                />

              {/* Show generated ID preview when adding */}
              {!isEditing && currentMatch.teamA && currentMatch.teamB && currentMatch.date && (
                <View style={styles.idPreviewContainer}>
                  <Text style={styles.idPreviewLabel}>Generated ID:</Text>
                  <Text style={styles.idPreviewValue}>{generateMatchId(currentMatch)}</Text>
                </View>
              )}
              
              {/* Show actual ID when editing */}
              {isEditing && (
                <View style={styles.idPreviewContainer}>
                  <Text style={styles.idPreviewLabel}>Document ID:</Text>
                  <Text style={styles.idPreviewValue}>{currentMatch.id}</Text>
                </View>
              )}
              
              <ScrollView style={styles.modalScrollView}>
                <Text style={styles.inputLabel}>Team A</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Team A name"
                  value={currentMatch.teamA}
                  onChangeText={(text) => setCurrentMatch({...currentMatch, teamA: text})}
                />
                
                <Text style={styles.inputLabel}>Team A Logo URL (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://example.com/teamA-logo.png"
                  value={currentMatch.teamALogo}
                  onChangeText={(text) => setCurrentMatch({...currentMatch, teamALogo: text})}
                />
                
                <Text style={styles.inputLabel}>Team B</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Team B name"
                  value={currentMatch.teamB}
                  onChangeText={(text) => setCurrentMatch({...currentMatch, teamB: text})}
                />
                
                <Text style={styles.inputLabel}>Team B Logo URL (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://example.com/teamB-logo.png"
                  value={currentMatch.teamBLogo}
                  onChangeText={(text) => setCurrentMatch({...currentMatch, teamBLogo: text})}
                />
                
                <Text style={styles.inputLabel}>Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Monday, January 1"
                  value={currentMatch.date}
                  onChangeText={(text) => setCurrentMatch({...currentMatch, date: text})}
                />
                
                <Text style={styles.inputLabel}>Time</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 3:00 PM"
                  value={currentMatch.time}
                  onChangeText={(text) => setCurrentMatch({...currentMatch, time: text})}
                />
                
                <Text style={styles.inputLabel}>Location</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Stadium or venue name"
                  value={currentMatch.location}
                  onChangeText={(text) => setCurrentMatch({...currentMatch, location: text})}
                />
                
                <Text style={styles.inputLabel}>Status</Text>
                <View style={styles.statusOptions}>
                  <TouchableOpacity
                    style={[
                      styles.statusOption,
                      currentMatch.status === 'upcoming' && styles.selectedStatus
                    ]}
                    onPress={() => setCurrentMatch({...currentMatch, status: 'upcoming'})}
                  >
                    <Text style={[
                      styles.statusText,
                      currentMatch.status === 'upcoming' && styles.selectedStatusText
                    ]}>Upcoming</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.statusOption,
                      currentMatch.status === 'finished' && styles.selectedStatus
                    ]}
                    onPress={() => setCurrentMatch({...currentMatch, status: 'finished'})}
                  >
                    <Text style={[
                      styles.statusText,
                      currentMatch.status === 'finished' && styles.selectedStatusText
                    ]}>Finished</Text>
                  </TouchableOpacity>
                </View>
                
                {currentMatch.status === 'finished' && (
                  <>
                    <Text style={styles.inputLabel}>Score</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., 2-1"
                      value={currentMatch.score}
                      onChangeText={(text) => setCurrentMatch({...currentMatch, score: text})}
                    />
                  </>
                )}
                
                <Text style={styles.inputLabel}>Description (optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Add details about the match"
                  value={currentMatch.description}
                  onChangeText={(text) => setCurrentMatch({...currentMatch, description: text})}
                  multiline
                />
              </ScrollView>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSaveMatch}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <View style={styles.bottomNav}>
        <TouchableOpacity 
            style={styles.navItem}
            onPress={() => router.push("/profile")} // 👤 Profile page
        >
            <Ionicons name="person" size={24} color="white" />
        </TouchableOpacity>


        <TouchableOpacity 
            style={styles.navItem}
            onPress={() => router.push("/dashboard")} // 🏠 Dashboard
        >
            <Ionicons name="home" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity 
            style={styles.navItem}
            onPress={() => router.push("/football")} // ⚽ Football
        >
            <Ionicons name="football" size={24} color="white" />
        </TouchableOpacity>
        </View>

      </View>
    </ImageBackground>
  );
}

export default function FootballManagementScreen() {
  return (
    <AdminProtectedRoute>
      <FootballManagement />
    </AdminProtectedRoute>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0a2463',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    width: '31%',
    borderWidth: 1,
    borderColor: 'rgba(10, 36, 99, 0.1)',
  },
  activeStatBox: {
    backgroundColor: '#0a2463',
    borderColor: '#0a2463',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0a2463',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  activeStatText: {
    color: 'white',
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
    flex: 1,
    padding: 16,
  },
  tabContainer: {
    marginBottom: 16,
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a2463',
  },
  matchCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  matchContent: {
    marginBottom: 12,
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamSection: {
    alignItems: 'center',
    width: '40%',
  },
  teamLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 5,
    backgroundColor: '#f0f0f0',
  },
  placeholderLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0a2463',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  placeholderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  teamName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0a2463',
    textAlign: 'center',
  },
  matchInfo: {
    alignItems: 'center',
    width: '20%',
  },
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a2463',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0a2463',
  },
  matchTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  matchDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 12,
    justifyContent: 'space-between',
  },
  matchDetail: {
    fontSize: 13,
    color: '#666',
    marginRight: 12,
    marginBottom: 4,
  },
  upcomingStatus: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#28a745',
  },
  finishedStatus: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#dc3545',
  },
  idText: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
  matchActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#0a2463',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  idPreviewContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#0a2463',
  },
  idPreviewLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  idPreviewValue: {
    fontSize: 14,
    color: '#0a2463',
    fontWeight: '500',
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#0a2463',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  statusOptions: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  statusOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
  },
  selectedStatus: {
    backgroundColor: '#0a2463',
    borderColor: '#0a2463',
  },
  statusText: {
    color: '#333',
  },
  selectedStatusText: {
    color: 'white',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#0a2463',
  },
  modalButtonText: {
    fontWeight: '500',
    color: '#333',
  },
  saveButtonText: {
    fontWeight: '500',
    color: 'white',
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
  }
});