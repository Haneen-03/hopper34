// import React, { useEffect, useState } from 'react';
// import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Image } from 'react-native';
// import { collection, getDocs, query, where } from 'firebase/firestore';
// import { db } from '../firebase';
// import { useRouter } from 'expo-router';

// interface Match {
//   id: string;
//   teamA: string;
//   teamB: string;
//   score?: string;
//   teamALogo?: string;
//   teamBLogo?: string;
//   stage: string; // Quarterfinal, Semifinal, Final
// }

// export default function KnockoutScreen() {
//   const [matches, setMatches] = useState<Match[]>([]);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     const fetchMatches = async () => {
//       try {
//         const q = query(collection(db, 'matches'), where('stage', '!=', ''));
//         const snapshot = await getDocs(q);
//         const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Match[];
//         setMatches(data);
//       } catch (err) {
//         console.error("Error loading knockout matches:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchMatches();
//   }, []);

//   const renderMatch = (match: Match) => (
//     <View key={match.id} style={styles.matchCard}>
//       <View style={styles.teamRow}>
//         <Image source={{ uri: match.teamALogo }} style={styles.logo} />
//         <Text style={styles.teamName}>{match.teamA}</Text>
//       </View>
//       <Text style={styles.vsText}>{match.score || 'VS'}</Text>
//       <View style={styles.teamRow}>
//         <Image source={{ uri: match.teamBLogo }} style={styles.logo} />
//         <Text style={styles.teamName}>{match.teamB}</Text>
//       </View>
//       <Text style={styles.stageText}>{match.stage}</Text>
//     </View>
//   );

//   const renderBracket = () => {
//     const stages = ['Quarterfinal', 'Semifinal', 'Final'];
//     return stages.map(stage => (
//       <View key={stage} style={styles.stageContainer}>
//         <Text style={styles.stageTitle}>{stage}</Text>
//         {matches.filter(m => m.stage === stage).map(renderMatch)}
//       </View>
//     ));
//   };

//   return (
//     <ScrollView style={styles.container}>
//       {loading ? (
//         <ActivityIndicator size="large" color="#0a2463" />
//       ) : (
//         renderBracket()
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     backgroundColor: '#f3f3f3',
//   },
//   stageContainer: {
//     marginBottom: 24,
//   },
//   stageTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#0a2463',
//     marginBottom: 8,
//   },
//   matchCard: {
//     backgroundColor: 'white',
//     padding: 12,
//     borderRadius: 10,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   teamRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
//   teamName: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   logo: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: '#ddd',
//   },
//   vsText: {
//     textAlign: 'center',
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginVertical: 6,
//   },
//   stageText: {
//     fontSize: 12,
//     color: '#666',
//     textAlign: 'right',
//     marginTop: 4,
//   },
// });
