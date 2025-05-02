// app/dashboard.tsx
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ImageBackground,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getData } from '../services/databaseService';
import { useAuth } from '../context/AuthContext';


// Define TypeScript interfaces
interface Service {
  id: string;
  name?: string;
  description?: string;
  route?: string;
  [key: string]: any; // Allow for additional properties
}

export default function Dashboard() {
  const router = useRouter();
  const { currentUser, isAdmin } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  
  // Define your service blocks with proper routes
  const serviceBlocks = [
    { id: 'hotels', name: 'Hotels', description: 'Find the best accommodations', route: '/services/hotels' },
    { id: 'restaurants', name: 'Restaurants', description: 'Discover local cuisine', route: '/services/resturants' },
    { id: 'transportation', name: 'Transportation', description: 'Get around easily', route: '/services/transportation' },
    { id: 'simCards', name: 'SIM Cards', description: 'Stay connected', route: '/services/simCards' },
    { id: 'guides', name: 'Guides', description: 'Explore with local guides', route: '/services/guides' },
    { id: 'bank', name: 'Banks', description: 'find your best trasfer method', route: '/services/bank' },
  ];
  
  // Get services on component mount
  useEffect(() => {
    // Fetch services from Firestore
    const fetchServices = async () => {
      const { data, error } = await getData('services');
      if (error) {
        console.error('Error fetching services:', error);
        return;
      }
      
      if (data && data.length > 0) {
        setServices(data as Service[]);
      }
    };
    
    fetchServices();
  }, []);

  // Update filtered services when search query changes or when services change
  useEffect(() => {
    if (searchQuery.trim() === '') {
      // If no search query, show all service blocks
      setFilteredServices(serviceBlocks);
    } else {
      // Filter service blocks based on search query
      const filtered = serviceBlocks.filter(service => 
        service.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        service.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredServices(filtered);
    }
  }, [searchQuery, services]);

  // Initialize filtered services with all service blocks
  useEffect(() => {
    setFilteredServices(serviceBlocks);
  }, []);
  
  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };
  
  
  return (
    <ImageBackground
      source={require("../assets/images/thefillbac.png")}
      style={styles.backgroundImage}
      
    >
      <View style={styles.container}>
        {/* Header */}

        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={{uri: 'https://via.placeholder.com/40'}}
              style={styles.logoImage}
            />
            <Text style={styles.logoText}>Home</Text>
          </View>
          <View style={styles.headerButtons}>
          {isAdmin && (
            <TouchableOpacity 
              style={styles.adminButton}
              onPress={() => router.push('/admin')}
            >
              <Ionicons name="settings-outline" size={24} color="#0a2463" />
              <Text style={styles.adminText}>Admin</Text>
            </TouchableOpacity>
          )}
          </View>
        </View>
        
        {/* User Welcome */}
        {currentUser && (
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>
              Welcome, {currentUser?.fullName}!
              {isAdmin ? ' (Admin)' : ''}
            </Text>
          </View>
        )}
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="gray" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="gray"
            value={searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="gray" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Search Results or Empty State */}
        {filteredServices.length === 0 && searchQuery.trim() !== '' ? (
          <View style={styles.emptyResultContainer}>
            <Text style={styles.emptyResultText}>No results found for "{searchQuery}"</Text>
          </View>
        ) : (
          /* Service Blocks Grid */
          <ScrollView style={styles.scrollView}>
            <View style={styles.gridContainer}>
              {filteredServices.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={styles.serviceBlock}
                  onPress={() => router.push(service.route as any)}
                >
                  <Text style={styles.serviceTitle}>{service.name}</Text>
                  <Text style={styles.serviceDescription}>{service.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
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
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 30,
  },
  adminText: {
    marginLeft: 4,
    fontWeight: '500',
    color: '#0a2463',
  },
  welcomeContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginHorizontal: 16,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    height: 40,
    flex: 1,
  },
  clearButton: {
    padding: 4,
  },
  emptyResultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyResultText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  serviceBlock: {
    width: '48%',
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 10,
    marginBottom: 16,
    padding: 12,
    justifyContent: 'center',
  },
  serviceTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#0a2463',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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