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

interface TeamData {
  id: string;
  name: string;
  flag: string;
}

interface TournamentStage {
  id: string;
  name: string;
  teams: TeamData[];
}

interface HighlightMatch {
  matchId: string;
}

function TournamentManagement() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [stages, setStages] = useState<TournamentStage[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [teamModalVisible, setTeamModalVisible] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<TournamentStage>({ id: '', name: '', teams: [] });
  const [currentTeam, setCurrentTeam] = useState<TeamData>({ id: '', name: '', flag: '' });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isEditingTeam, setIsEditingTeam] = useState<boolean>(false);
  const [currentTeamIndex, setCurrentTeamIndex] = useState<number>(-1);
  const [highlightMatch, setHighlightMatch] = useState<string>('');
  const [matches, setMatches] = useState<any[]>([]);

  // Standard tournament stages
  const defaultStages = [
    { id: 'round-of-16', name: 'Round of 16', teams: [] },
    { id: 'quarter-finals', name: 'Quarter Finals', teams: [] },
    { id: 'semi-finals', name: 'Semi Finals', teams: [] },
    { id: 'final', name: 'Final', teams: [] }
  ];

  useEffect(() => {
    fetchTournamentData();
    fetchMatches();
    fetchHighlightMatch();
  }, []);

  const fetchTournamentData = async () => {
    setLoading(true);
    try {
      console.log("Fetching tournament data...");
      const tournamentCollection = collection(db, 'tournament');
      const tournamentSnapshot = await getDocs(tournamentCollection);
      
      if (tournamentSnapshot.empty || tournamentSnapshot.docs.every(doc => doc.id === 'highlight')) {
        console.log("No tournament stages found, using defaults");
        setStages(defaultStages);
      } else {
        const stagesData: TournamentStage[] = [];
        
        tournamentSnapshot.docs.forEach(doc => {
          if (doc.id !== 'highlight') {
            stagesData.push({
              id: doc.id,
              name: doc.data().name || doc.id,
              teams: doc.data().teams || []
            });
          }
        });
        
        // Sort stages in a logical order
        stagesData.sort((a, b) => {
          const order = {
            'round-of-16': 1,
            'quarter-finals': 2,
            'semi-finals': 3,
            'final': 4
          };
          return (order[a.id as keyof typeof order] || 99) - (order[b.id as keyof typeof order] || 99);
        });
        
        console.log("Tournament stages:", stagesData);
        setStages(stagesData);
      }
    } catch (error) {
      console.error("Error fetching tournament data:", error);
      Alert.alert('Error', 'Failed to load tournament data');
      setStages(defaultStages);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    try {
      const matchesCollection = collection(db, 'matches');
      const matchesSnapshot = await getDocs(matchesCollection);
      
      if (!matchesSnapshot.empty) {
        const matchesData = matchesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setMatches(matchesData);
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
    }
  };

  const fetchHighlightMatch = async () => {
    try {
      const highlightRef = doc(db, 'tournament', 'highlight');
      const highlightDoc = await getDoc(highlightRef);
      
      if (highlightDoc.exists()) {
        setHighlightMatch(highlightDoc.data().matchId || '');
      }
    } catch (error) {
      console.error("Error fetching highlight match:", error);
    }
  };

  const initializeTournament = async () => {
    try {
      setLoading(true);
      
      // Create each stage with empty teams array
      for (const stage of defaultStages) {
        await setDoc(doc(db, 'tournament', stage.id), {
          name: stage.name,
          teams: []
        });
      }
      
      // Create highlight document with empty match id
      await setDoc(doc(db, 'tournament', 'highlight'), {
        matchId: ''
      });
      
      Alert.alert('Success', 'Tournament initialized successfully');
      fetchTournamentData();
    } catch (error) {
      console.error('Error initializing tournament:', error);
      Alert.alert('Error', 'Failed to initialize tournament');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStage = async () => {
    if (!currentStage.name) {
      Alert.alert('Error', 'Please enter a stage name');
      return;
    }

    try {
      if (isEditing) {
        // Update existing stage
        const stageRef = doc(db, 'tournament', currentStage.id);
        await updateDoc(stageRef, {
          name: currentStage.name,
          teams: currentStage.teams
        });
        
        // Update local state
        setStages(stages.map(stage => 
          stage.id === currentStage.id ? currentStage : stage
        ));
        
        Alert.alert('Success', 'Tournament stage updated successfully');
      } else {
        // Generate ID from name
        const stageId = currentStage.name.toLowerCase().replace(/\s+/g, '-');
        
        // Add new stage
        await setDoc(doc(db, 'tournament', stageId), {
          name: currentStage.name,
          teams: []
        });
        
        // Add to local state
        setStages([...stages, { ...currentStage, id: stageId, teams: [] }]);
        Alert.alert('Success', 'Tournament stage added successfully');
      }
      
      // Reset and close modal
      setModalVisible(false);
      setCurrentStage({ id: '', name: '', teams: [] });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving tournament stage:', error);
      Alert.alert('Error', 'Failed to save tournament stage');
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this tournament stage?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const stageRef = doc(db, 'tournament', stageId);
              await deleteDoc(stageRef);
              setStages(stages.filter(stage => stage.id !== stageId));
              Alert.alert('Success', 'Tournament stage deleted successfully');
            } catch (error) {
              console.error('Error deleting tournament stage:', error);
              Alert.alert('Error', 'Failed to delete tournament stage');
            }
          }
        }
      ]
    );
  };

  const openEditStageModal = (stage: TournamentStage) => {
    setCurrentStage(stage);
    setIsEditing(true);
    setModalVisible(true);
  };

  const openAddStageModal = () => {
    setCurrentStage({ id: '', name: '', teams: [] });
    setIsEditing(false);
    setModalVisible(true);
  };

  const openEditTeamModal = (stageId: string, team: TeamData, index: number) => {
    setCurrentStage(stages.find(s => s.id === stageId) || { id: stageId, name: '', teams: [] });
    setCurrentTeam(team);
    setCurrentTeamIndex(index);
    setIsEditingTeam(true);
    setTeamModalVisible(true);
  };

  const openAddTeamModal = (stageId: string) => {
    setCurrentStage(stages.find(s => s.id === stageId) || { id: stageId, name: '', teams: [] });
    setCurrentTeam({ id: '', name: '', flag: '' });
    setIsEditingTeam(false);
    setTeamModalVisible(true);
  };

  const handleSaveTeam = async () => {
    if (!currentTeam.name || !currentTeam.flag) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      // Generate team ID if it doesn't exist
      const teamId = currentTeam.id || currentTeam.name.toLowerCase().replace(/\s+/g, '-');
      const updatedTeam = { ...currentTeam, id: teamId };
      
      // Update the stage's teams array
      let updatedStage: TournamentStage;
      
      if (isEditingTeam && currentTeamIndex >= 0) {
        // Replace team at current index
        const updatedTeams = [...currentStage.teams];
        updatedTeams[currentTeamIndex] = updatedTeam;
        updatedStage = { ...currentStage, teams: updatedTeams };
      } else {
        // Add new team to the array
        updatedStage = { 
          ...currentStage, 
          teams: [...currentStage.teams, updatedTeam] 
        };
      }
      
      // Update in Firebase
      const stageRef = doc(db, 'tournament', currentStage.id);
      await updateDoc(stageRef, {
        teams: updatedStage.teams
      });
      
      // Update local state
      setStages(stages.map(stage => 
        stage.id === currentStage.id ? updatedStage : stage
      ));
      
      Alert.alert('Success', isEditingTeam ? 'Team updated successfully' : 'Team added successfully');
      
      // Reset and close modal
      setTeamModalVisible(false);
      setCurrentTeam({ id: '', name: '', flag: '' });
    } catch (error) {
      console.error('Error saving team:', error);
      Alert.alert('Error', 'Failed to save team');
    }
  };

  const handleDeleteTeam = async (stageId: string, teamIndex: number) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this team?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const stage = stages.find(s => s.id === stageId);
              
              if (stage) {
                // Remove team from the array
                const updatedTeams = [...stage.teams];
                updatedTeams.splice(teamIndex, 1);
                
                // Update Firebase
                const stageRef = doc(db, 'tournament', stageId);
                await updateDoc(stageRef, {
                  teams: updatedTeams
                });
                
                // Update local state
                const updatedStage = { ...stage, teams: updatedTeams };
                setStages(stages.map(s => 
                  s.id === stageId ? updatedStage : s
                ));
                
                Alert.alert('Success', 'Team deleted successfully');
              }
            } catch (error) {
              console.error('Error deleting team:', error);
              Alert.alert('Error', 'Failed to delete team');
            }
          }
        }
      ]
    );
  };

  const handleSaveHighlightMatch = async () => {
    try {
      const highlightRef = doc(db, 'tournament', 'highlight');
      await setDoc(highlightRef, {
        matchId: highlightMatch
      });
      
      Alert.alert('Success', 'Highlight match updated successfully');
    } catch (error) {
      console.error('Error saving highlight match:', error);
      Alert.alert('Error', 'Failed to save highlight match');
    }
  };

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
          <Text style={styles.headerTitle}>Manage Tournament</Text>
          <TouchableOpacity onPress={openAddStageModal}>
            <Ionicons name="add-circle" size={24} color="#0a2463" />
          </TouchableOpacity>
        </View>
        
        {/* Initialize Tournament Button */}
        <TouchableOpacity 
          style={styles.initButton}
          onPress={initializeTournament}
        >
          <Text style={styles.initButtonText}>Initialize Tournament</Text>
        </TouchableOpacity>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0a2463" />
          </View>
        ) : (
          <ScrollView style={styles.scrollView}>
            {/* Highlight Match Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Highlight Match</Text>
              <View style={styles.highlightContainer}>
                <View style={styles.pickerContainer}>
                  <TouchableOpacity 
                    style={styles.pickerButton}
                    onPress={() => {
                      // Display a modal to select a match
                      Alert.alert(
                        'Select Highlight Match',
                        'Choose a match to highlight:',
                        matches.map(match => ({
                          text: `${match.teamA} vs ${match.teamB}`,
                          onPress: () => setHighlightMatch(match.id)
                        }))
                      );
                    }}
                  >
                    <Text style={styles.pickerButtonText}>
                      {highlightMatch ? 
                        matches.find(m => m.id === highlightMatch)?.teamA + ' vs ' + 
                        matches.find(m => m.id === highlightMatch)?.teamB : 
                        'Select Match'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#0a2463" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleSaveHighlightMatch}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Tournament Stages */}
            {stages.map((stage) => (
              <View key={stage.id} style={styles.stageCard}>
                <View style={styles.stageHeader}>
                  <Text style={styles.stageName}>{stage.name}</Text>
                  <View style={styles.stageActions}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => openEditStageModal(stage)}
                    >
                      <Ionicons name="create-outline" size={18} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteStage(stage.id)}
                    >
                      <Ionicons name="trash-outline" size={18} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.teamsSection}>
                  <View style={styles.teamsSectionHeader}>
                    <Text style={styles.teamsSectionTitle}>Teams ({stage.teams.length})</Text>
                    <TouchableOpacity 
                      style={styles.addTeamButton}
                      onPress={() => openAddTeamModal(stage.id)}
                    >
                      <Text style={styles.addTeamButtonText}>Add Team</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {stage.teams.length === 0 ? (
                    <Text style={styles.emptyText}>No teams added yet</Text>
                  ) : (
                    <View style={styles.teamsGrid}>
                      {stage.teams.map((team, index) => (
                        <View key={team.id || index} style={styles.teamItem}>
                          <View style={styles.teamContent}>
                            {team.flag ? (
                              <Image 
                                source={{ uri: team.flag }} 
                                style={styles.teamFlag} 
                              />
                            ) : (
                              <View style={styles.teamFlagPlaceholder} />
                            )}
                            <Text style={styles.teamItemName}>{team.name}</Text>
                          </View>
                          <View style={styles.teamItemActions}>
                            <TouchableOpacity
                              onPress={() => openEditTeamModal(stage.id, team, index)}
                            >
                              <Ionicons name="create-outline" size={18} color="#0a2463" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleDeleteTeam(stage.id, index)}
                            >
                              <Ionicons name="trash-outline" size={18} color="#dc3545" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        )}
        
        {/* Stage Edit/Add Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {isEditing ? 'Edit Tournament Stage' : 'Add Tournament Stage'}
              </Text>
              
              <TextInput
                style={styles.input}
                placeholder="Stage Name (e.g., Round of 16)"
                value={currentStage.name}
                onChangeText={(text) => setCurrentStage({...currentStage, name: text})}
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSaveStage}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        
        {/* Team Edit/Add Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={teamModalVisible}
          onRequestClose={() => setTeamModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {isEditingTeam ? 'Edit Team' : 'Add Team'}
              </Text>
              
              <Text style={styles.modalSubtitle}>
                Stage: {currentStage.name}
              </Text>
              
              <TextInput
                style={styles.input}
                placeholder="Team Name"
                value={currentTeam.name}
                onChangeText={(text) => setCurrentTeam({...currentTeam, name: text})}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Flag URL"
                value={currentTeam.flag}
                onChangeText={(text) => setCurrentTeam({...currentTeam, flag: text})}
              />
              
              {currentTeam.flag && (
                <View style={styles.flagPreview}>
                  <Text style={styles.flagPreviewLabel}>Flag Preview:</Text>
                  <Image 
                    source={{ uri: currentTeam.flag }} 
                    style={styles.flagPreviewImage}
                    onError={() => Alert.alert('Error', 'Could not load image from URL')}
                  />
                </View>
              )}
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setTeamModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSaveTeam}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Bottom Navigation */}
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

export default function TournamentManagementScreen() {
  return (
    <AdminProtectedRoute>
      <TournamentManagement />
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
  initButton: {
    backgroundColor: '#28a745',
    margin: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  initButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a2463',
    marginBottom: 12,
  },
  highlightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerContainer: {
    flex: 1,
    marginRight: 8,
  },
  pickerButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: {
    color: '#333',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#0a2463',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  stageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stageName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a2463',
  },
  stageActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  teamsSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
    padding: 12,
  },
  teamsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamsSectionTitle: {
    fontSize: 16,
    color: '#0a2463',
    fontWeight: '500',
  },
  addTeamButton: {
    backgroundColor: '#0a2463',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  addTeamButtonText: {
    color: 'white',
    fontSize: 14,
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 12,
  },
  teamsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  teamItem: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  teamContent: {
    alignItems: 'center',
    marginBottom: 8,
  },
  teamFlag: {
    width: 50,
    height: 30,
    borderRadius: 4,
    marginBottom: 5,
  },
  teamFlagPlaceholder: {
    width: 50,
    height: 30,
    backgroundColor: '#ccc',
    borderRadius: 4,
    marginBottom: 5,
  },
  teamItemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  teamItemActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 8,
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
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#0a2463',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  flagPreview: {
    alignItems: 'center',
    marginBottom: 15,
  },
  flagPreviewLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  flagPreviewImage: {
    width: 100,
    height: 60,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
  modalButtonText: {
    fontWeight: '500',
    color: '#333',
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