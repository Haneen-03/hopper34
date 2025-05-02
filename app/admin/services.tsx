// app/admin/services.tsx
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
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { collection, getDocs, doc, getDoc, updateDoc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import AdminProtectedRoute from '../../components/AdminProtectedRoute';

// Define TypeScript interfaces
interface Service {
  id: string;
  name: string;
  description: string;
  route: string;
  [key: string]: any; // Allow for additional properties
}

interface ServiceType {
  id: string;
  name: string;
  description: string;
  route: string;
}

function ServiceManagement() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [services, setServices] = useState<Service[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [currentService, setCurrentService] = useState<Service>({ id: '', name: '', description: '', route: '' });
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Define your service types
  const serviceTypes: ServiceType[] = [
    { id: 'hotels', name: 'Hotels', description: 'Accommodation services', route: '/services/hotels' },
    { id: 'restaurants', name: 'Restaurants', description: 'Dining services', route: '/services/restaurants' },
    { id: 'transportation', name: 'Transportation', description: 'Getting around', route: '/services/transportation' },
    { id: 'simCards', name: 'SIM Cards', description: 'Connectivity services', route: '/services/simCards' },
    { id: 'guides', name: 'Guides', description: 'Tour guide services', route: '/services/guides' },
    { id: 'bank', name: 'Banks', description: 'Bank services', route: '/services/bank' },
    { id: 'events', name: 'Events', description: 'Events services', route: '/services/events' }


  ];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      console.log("Fetching services...");
      const servicesCollection = collection(db, 'services');
      const servicesSnapshot = await getDocs(servicesCollection);
      
      console.log("Services snapshot size:", servicesSnapshot.size);
      
      if (servicesSnapshot.empty) {
        console.log("No services found, using predefined types");
        setServices(serviceTypes);
      } else {
        console.log("Services found in Firestore");
        const servicesData = servicesSnapshot.docs.map(doc => {
          console.log("Service doc:", doc.id, doc.data());
          return {
            id: doc.id,
            ...doc.data()
          };
        }) as Service[];
        
        console.log("Setting services:", servicesData);
        setServices(servicesData);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      Alert.alert('Error', 'Failed to load services');
      
      // Fallback to predefined types if Firestore fetch fails
      setServices(serviceTypes);
    } finally {
      setLoading(false);
    }
  };

  const initializeFixedServices = async () => {
    try {
      console.log("Initializing fixed services...");
      
      // Add all predefined services to Firestore with logical IDs
      for (const service of serviceTypes) {
        // Use the service ID directly as the document ID
        await setDoc(doc(db, 'services', service.id), {
          id: service.id,
          name: service.name,
          description: service.description,
          route: service.route,
          createdAt: new Date().toISOString()
        });
        console.log(`Service ${service.name} added with ID ${service.id}`);
      }
      
      Alert.alert('Success', 'Fixed services initialized successfully');
      fetchServices(); // Refresh the list
    } catch (error) {
      console.error('Error initializing services:', error);
      Alert.alert('Error', 'Failed to initialize services');
    }
  };

  const handleSaveService = async () => {
    if (!currentService.name || !currentService.description || !currentService.route) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Make sure ID is URL-friendly (lowercase, no spaces)
    const serviceId = currentService.id || currentService.name.toLowerCase().replace(/\s+/g, '-');

    try {
      if (isEditing) {
        // Update existing service
        console.log(`Updating service with ID: ${currentService.id}`);
        const serviceRef = doc(db, 'services', currentService.id);
        await updateDoc(serviceRef, {
          name: currentService.name,
          description: currentService.description,
          route: currentService.route,
          updatedAt: new Date().toISOString()
        });
        
        // Update local state
        setServices(services.map(service => 
          service.id === currentService.id ? currentService : service
        ));
        
        Alert.alert('Success', 'Service updated successfully');
      } else {
        // Add new service with direct document ID
        console.log(`Creating new service with ID: ${serviceId}`);
        await setDoc(doc(db, 'services', serviceId), {
          id: serviceId,
          name: currentService.name,
          description: currentService.description,
          route: currentService.route,
          createdAt: new Date().toISOString()
        });
        
        // Add to local state
        setServices([...services, { ...currentService, id: serviceId }]);
        Alert.alert('Success', 'Service added successfully');
      }
      
      // Reset and close modal
      setModalVisible(false);
      setCurrentService({ id: '', name: '', description: '', route: '' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving service:', error);
      Alert.alert('Error', 'Failed to save service');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this service?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const serviceRef = doc(db, 'services', serviceId);
              await deleteDoc(serviceRef);
              setServices(services.filter(service => service.id !== serviceId));
              Alert.alert('Success', 'Service deleted successfully');
            } catch (error) {
              console.error('Error deleting service:', error);
              Alert.alert('Error', 'Failed to delete service');
            }
          }
        }
      ]
    );
  };

  const openEditModal = (service: Service) => {
    setCurrentService(service);
    setIsEditing(true);
    setModalVisible(true);
  };

  const openAddModal = () => {
    setCurrentService({ id: '', name: '', description: '', route: '' });
    setIsEditing(false);
    setModalVisible(true);
  };

  const navigateToServiceContent = (serviceType: string) => {
    // Navigate to specific service content management
    router.push(`/admin/content/${serviceType}` as any);
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
          <Text style={styles.headerTitle}>Manage Services</Text>
          <TouchableOpacity onPress={openAddModal}>
            <Ionicons name="add-circle" size={24} color="#0a2463" />
          </TouchableOpacity>
        </View>
        

        {/* <TouchableOpacity 
          style={styles.initButton}
          onPress={initializeFixedServices}
        >
          <Text style={styles.initButtonText}>Initialize Fixed Services</Text>
        </TouchableOpacity> */}
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0a2463" />
          </View>
        ) : (
          <ScrollView style={styles.scrollView}>
            {services.map((service) => (
              <View key={service.id} style={styles.serviceCard}>
                <TouchableOpacity 
                  style={styles.serviceContent}
                  onPress={() => navigateToServiceContent(service.id)}
                >
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceDescription}>
                      {service.description || 'No description'}
                    </Text>
                    <Text style={styles.serviceRoute}>
                      Route: {service.route}
                    </Text>
                    <Text style={styles.serviceId}>
                      ID: {service.id}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#0a2463" />
                </TouchableOpacity>
                <View style={styles.serviceActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => openEditModal(service)}
                  >
                    <Ionicons name="create-outline" size={20} color="white" />
                  </TouchableOpacity>
                  {/* <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteService(service.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="white" />
                  </TouchableOpacity> */}
                </View>
              </View>
            ))}
          </ScrollView>
        )}
        
        {/* Service Edit/Add Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {isEditing ? 'Edit Service' : 'Add New Service'}
              </Text>
              
              {!isEditing && (
                <TextInput
                  style={styles.input}
                  placeholder="Service ID (lowercase, no spaces)"
                  value={currentService.id}
                  onChangeText={(text) => setCurrentService({...currentService, id: text.toLowerCase().replace(/\s+/g, '-')})}
                />
              )}
              
              <TextInput
                style={styles.input}
                placeholder="Service Name"
                value={currentService.name}
                onChangeText={(text) => setCurrentService({...currentService, name: text})}
              />
              
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description"
                value={currentService.description}
                onChangeText={(text) => setCurrentService({...currentService, description: text})}
                multiline
              />
              
              <TextInput
                style={styles.input}
                placeholder="Route (e.g., /services/hotels)"
                value={currentService.route}
                onChangeText={(text) => setCurrentService({...currentService, route: text})}
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
                  onPress={handleSaveService}
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

export default function ServiceManagementScreen() {
  return (
    <AdminProtectedRoute>
      <ServiceManagement />
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
    marginTop: 15,
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
  serviceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  serviceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a2463',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  serviceRoute: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  serviceId: {
    fontSize: 10,
    color: '#aaa',
    marginTop: 2,
    fontStyle: 'italic',
  },
  serviceActions: {
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
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#0a2463',
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
  },
});