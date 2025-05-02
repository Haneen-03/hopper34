// app/admin.tsx
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  ImageBackground,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import AdminProtectedRoute from '../components/AdminProtectedRoute';

export default function AdminScreen() {
  return (
    <AdminProtectedRoute>
      <AdminDashboard />
    </AdminProtectedRoute>
  );
}

function AdminDashboard() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Redirect non-admin users
    if (!isAdmin) {
      Alert.alert('Access Denied', 'You do not have admin privileges.');
      router.replace('/dashboard');
      return;
    }
  }, [isAdmin]);

  return (
    <ImageBackground
      source={require("../assets/images/thefillbac.png")}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin Panel</Text>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0a2463" />
          </View>
        ) : (
          <ScrollView style={styles.scrollView}>

            <View style={styles.actionsContainer}>
              <Text style={styles.sectionTitle}>Admin Actions</Text>
              
              <TouchableOpacity 
                style={styles.actionCard}
                onPress={() => router.push('/admin/services')}
              >
                <Ionicons name="grid-outline" size={24} color="#0a2463" />
                <Text style={styles.actionText}>Manage Services</Text>
                <Ionicons name="chevron-forward" size={20} color="#0a2463" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionCard}
                onPress={() => router.push('/admin/football')}
              >
                <Ionicons name="football-outline" size={24} color="#0a2463" />
                <Text style={styles.actionText}>Manage Football</Text>
                <Ionicons name="chevron-forward" size={20} color="#0a2463" />
              </TouchableOpacity>

              
            </View>
            
          </ScrollView>
        )}

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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0a2463',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  actionsContainer: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    marginHorizontal: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0a2463',
    flex: 1,
    marginLeft: 12,
  },
  infoContainer: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    marginHorizontal: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0a2463',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#0a2463',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#0a2463',
    height: 60,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    padding: 10,
  },
});