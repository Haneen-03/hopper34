// app/admin/content/[serviceType].tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  ActivityIndicator,
  ImageBackground,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { collection, query, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc, where } from 'firebase/firestore';
import { db } from '../../../firebase';
import AdminProtectedRoute from '../../../components/AdminProtectedRoute';

// Define interface for content items
interface ContentItem {
  id: string;
  title: string;
  name?: string;
  description: string;
  imageUrl?: string;
  image?: string;
  price?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  mapUrl?: string;
  cuisineType?: string;
  priceRange?: string;
  provider?: string;
  dataAmount?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any; // Allow for any additional properties
}

function ServiceContentManagement() {
  const router = useRouter();
  const { serviceType } = useLocalSearchParams();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<ContentItem>({ id: '', title: '', description: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [serviceTitle, setServiceTitle] = useState('');

  // Convert serviceType param to readable title
  useEffect(() => {
    if (typeof serviceType === 'string') {
      // Convert 'hotels' to 'Hotels', etc.
      setServiceTitle(serviceType.charAt(0).toUpperCase() + serviceType.slice(1));
    }
  }, [serviceType]);

  // Fetch content items for this service type
  useEffect(() => {
    if (serviceType) {
      fetchItems();
    }
  }, [serviceType]);

  const fetchItems = async () => {
    if (!serviceType) return;
    
    setLoading(true);
    try {
      console.log(`Fetching items for service type: ${serviceType}`);
      
      // We now use the direct document ID approach
      const itemsRef = collection(db, 'services', String(serviceType), 'items');
      const snapshot = await getDocs(itemsRef);
      
      console.log(`Found ${snapshot.size} items`);
      
      if (snapshot.empty) {
        setItems([]);
      } else {
        const itemsData = snapshot.docs.map(doc => {
          console.log(`Item: ${doc.id}, Title: ${doc.data().title || doc.data().name || 'No title'}`);
          return {
            id: doc.id,
            ...doc.data()
          } as ContentItem;
        });
        
        setItems(itemsData);
      }
    } catch (error) {
      console.error(`Error fetching ${serviceType} items:`, error);
      Alert.alert('Error', `Failed to load ${serviceType} content: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal function
  const openEditModal = (item: ContentItem): void => {
    console.log("EDIT: Opening edit modal for item:", item.id, item.title || item.name);
    
    // Make a deep copy of the item to avoid reference issues
    const itemCopy: ContentItem = {
      id: item.id,
      title: item.title || item.name || "",
      name: item.name || item.title || "",
      description: item.description || "",
      price: item.price || "",
      location: item.location || "",
      imageUrl: item.imageUrl || item.image || "",
      image: item.image || item.imageUrl || "",
      website: item.website || "",
      mapUrl: item.mapUrl || "",
      cuisineType: item.cuisineType || "",
      priceRange: item.priceRange || "",
      provider: item.provider || "",
      dataAmount: item.dataAmount || "",
      category: item.category || "",
    };
    
    console.log("EDIT: Setting current item with ID:", itemCopy.id);
    setIsEditing(true);
    setCurrentItem(itemCopy);
    setModalVisible(true);
  };

  // Save function with proper TypeScript typing
  const handleSaveItem = async (): Promise<void> => {
    if (!currentItem.title && !currentItem.name || !currentItem.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
  
    if (!serviceType) {
      Alert.alert('Error', 'Service type not specified');
      return;
    }
  
    try {
      // Ensure title and name are synchronized
      const itemTitle = currentItem.title || currentItem.name;
      const itemName = currentItem.name || currentItem.title;
      
      // Ensure we have both title and name for compatibility
      const updatedItem = {
        ...currentItem,
        title: itemTitle,
        name: itemName
      };
      
      if (isEditing && currentItem.id) {
        console.log(`SAVE: Updating existing item: ${currentItem.id}`);
        
        // Create update data with proper typing
        const updateData: Partial<ContentItem> = {
          title: updatedItem.title,
          name: updatedItem.name,
          description: updatedItem.description,
          updatedAt: new Date().toISOString()
        };
        
        // Add service-specific fields based on service type
        if (updatedItem.price) updateData.price = updatedItem.price;
        if (updatedItem.location) updateData.location = updatedItem.location;
        if (updatedItem.imageUrl) updateData.imageUrl = updatedItem.imageUrl;
        if (updatedItem.image) updateData.image = updatedItem.image;
        if (updatedItem.website) updateData.website = updatedItem.website;
        if (updatedItem.mapUrl) updateData.mapUrl = updatedItem.mapUrl;
        if (updatedItem.cuisineType) updateData.cuisineType = updatedItem.cuisineType;
        if (updatedItem.priceRange) updateData.priceRange = updatedItem.priceRange;
        if (updatedItem.provider) updateData.provider = updatedItem.provider;
        if (updatedItem.dataAmount) updateData.dataAmount = updatedItem.dataAmount;
        if (updatedItem.category) updateData.category = updatedItem.category;
        
        console.log(`SAVE: Update data:`, updateData);
        console.log(`SAVE: Path: services/${serviceType}/items/${currentItem.id}`);
        
        // Get document reference and update
        const docRef = doc(db, 'services', String(serviceType), 'items', currentItem.id);
        await updateDoc(docRef, updateData);
        
        console.log(`SAVE: Document updated successfully`);
        
        // Update local state with type safety
        setItems(prevItems => 
          prevItems.map(item => 
            item.id === currentItem.id 
              ? { ...item, ...updateData } 
              : item
          )
        );
        
        Alert.alert('Success', 'Item updated successfully');
      } else {
        console.log(`SAVE: Creating new item`);
        
        // Prepare new item data with proper typing
        const newItemData: Partial<ContentItem> = {
          title: updatedItem.title,
          name: updatedItem.name,
          description: updatedItem.description,
          createdAt: new Date().toISOString()
        };
        
        // Add service-specific fields
        if (updatedItem.price) newItemData.price = updatedItem.price;
        if (updatedItem.location) newItemData.location = updatedItem.location;
        if (updatedItem.imageUrl) newItemData.imageUrl = updatedItem.imageUrl;
        if (updatedItem.image) newItemData.image = updatedItem.imageUrl;
        if (updatedItem.website) newItemData.website = updatedItem.website;
        if (updatedItem.mapUrl) newItemData.mapUrl = updatedItem.mapUrl;
        if (updatedItem.cuisineType) newItemData.cuisineType = updatedItem.cuisineType;
        if (updatedItem.priceRange) newItemData.priceRange = updatedItem.priceRange;
        if (updatedItem.provider) newItemData.provider = updatedItem.provider;
        if (updatedItem.dataAmount) newItemData.dataAmount = updatedItem.dataAmount;
        if (updatedItem.location) newItemData.location = updatedItem.location;
        if (updatedItem.category) newItemData.category = updatedItem.category;
        
        console.log(`SAVE: New item data:`, newItemData);
        
        // Create reference and add document
        const itemsCollRef = collection(db, 'services', String(serviceType), 'items');
        const newItemRef = await addDoc(itemsCollRef, newItemData);
        
        console.log(`SAVE: New item added with ID: ${newItemRef.id}`);
        
        // Add to local state with type assertion
        const newItemWithId: ContentItem = { 
          ...newItemData, 
          id: newItemRef.id 
        } as ContentItem;
        
        setItems(prevItems => [...prevItems, newItemWithId]);
        
        Alert.alert('Success', 'Item added successfully');
      }
      
      // Close modal and reset form regardless of operation
      setModalVisible(false);
      setCurrentItem({ id: '', title: '', description: '' });
      setIsEditing(false);
    } catch (error: unknown) {
      console.error('Error saving item:', error);
      
      // Properly handle unknown error type
      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      
      Alert.alert('Error', 'Failed to save item: ' + errorMessage);
    }
  };

  // Delete function with proper TypeScript typing
  const handleDeleteItem = async (itemId: string): Promise<void> => {
    console.log(`DELETE: Button pressed for item ID: ${itemId}`);
    
    // Check if we have a valid ID
    if (!itemId || typeof itemId !== 'string') {
      console.error(`DELETE: Invalid item ID provided: ${itemId}, type: ${typeof itemId}`);
      Alert.alert("Error", "Cannot delete item: Invalid ID");
      return;
    }
    
    // Check if service ID is available
    if (!serviceType) {
      console.error(`DELETE: No service type available`);
      Alert.alert("Error", "Cannot delete: Service not found");
      return;
    }
    
    // Look up the item to be deleted
    const itemToDelete = items.find(item => item.id === itemId);
    console.log(`DELETE: Found item to delete:`, itemToDelete);
    
    // Create the confirmation alert
    Alert.alert(
      "Delete Confirmation",
      `Are you sure you want to delete ${itemToDelete?.title || itemToDelete?.name || 'this item'}?`,
      [
        { 
          text: "Cancel", 
          style: "cancel",
          onPress: () => console.log("DELETE: User cancelled deletion")
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              console.log(`DELETE: User confirmed. Deleting item at path: services/${serviceType}/items/${itemId}`);
              
              // Use a direct approach
              const db_ref = doc(db, 'services', String(serviceType), 'items', itemId);
              await deleteDoc(db_ref);
              console.log(`DELETE: Document successfully deleted from Firestore`);
              
              // Update local state
              setItems(items.filter(item => item.id !== itemId));
              console.log(`DELETE: Local state updated, removed item: ${itemId}`);
              
              // Show success message
              Alert.alert("Success", "Item deleted successfully");
            } catch (error: unknown) {
              console.error("DELETE ERROR:", error);
              let errorMessage = "Unknown error";
              
              if (error instanceof Error) {
                errorMessage = error.message;
                console.error("Error details:", {
                  name: error.name,
                  message: error.message,
                  stack: error.stack
                });
              }
              
              Alert.alert("Error", `Failed to delete item: ${errorMessage}`);
            }
          }
        }
      ],
      { cancelable: true }
    );
  };

  const openAddModal = () => {
    console.log("Opening add modal");
    setCurrentItem({ id: '', title: '', description: '' });
    setIsEditing(false);
    setModalVisible(true);
  };

  // Render different form fields based on service type
  const renderFormFields = () => {
    return (
      <>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={currentItem.title}
          onChangeText={(text) => setCurrentItem({...currentItem, title: text, name: text})}
        />
        
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description"
          value={currentItem.description}
          onChangeText={(text) => setCurrentItem({...currentItem, description: text})}
          multiline
        />
        
        {/* Additional fields based on service type */}
        {serviceType === 'hotels' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Price per night"
              value={currentItem.price}
              onChangeText={(text) => setCurrentItem({...currentItem, price: text})}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Location"
              value={currentItem.location}
              onChangeText={(text) => setCurrentItem({...currentItem, location: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Website URL"
              value={currentItem.website}
              onChangeText={(text) => setCurrentItem({...currentItem, website: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Map URL (Google Maps link)"
              value={currentItem.mapUrl}
              onChangeText={(text) => setCurrentItem({...currentItem, mapUrl: text})}
            />
          </>
        )}

        {serviceType === 'bank' && (
        <>
            <TextInput
            style={styles.input}
            placeholder="Location (e.g., Saudi Arabia, Riyadh)"
            value={currentItem.location}
            onChangeText={(text) => setCurrentItem({...currentItem, location: text})}
            />
            <TextInput
            style={styles.input}
            placeholder="Website URL"
            value={currentItem.website}
            onChangeText={(text) => setCurrentItem({...currentItem, website: text})}
            />
        </>
        )}
        
        {serviceType === 'transportation' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Website URL"
              value={currentItem.website}
              onChangeText={(text) => setCurrentItem({...currentItem, website: text})}
            />
            {/* <TextInput
            style={styles.input}
            placeholder="Category (e.g., Taxi apps, Metro, Car rental)"
            value={currentItem.category || ''}
            onChangeText={(text) => setCurrentItem({ ...currentItem, category: text })}
            /> */}
                <Text style={{ fontWeight: 'bold', marginBottom: 6 }}>Category</Text>
                <View style={styles.dropdownContainer}>
                {["Public Transport", "Taxi Apps", "Car Rental", "Bike Sharing", "Airport Shuttle"].map(option => (
                    <TouchableOpacity
                    key={option}
                    style={[
                        styles.dropdownOption,
                        currentItem.category === option && styles.dropdownOptionSelected
                    ]}
                    onPress={() => setCurrentItem({ ...currentItem, category: option })}
                    >
                    <Text style={currentItem.category === option ? styles.dropdownTextSelected : styles.dropdownText}>
                        {option}
                    </Text>
                    </TouchableOpacity>
                ))}
                </View>
          </>
        )}
        
        {serviceType === 'guides' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Location (e.g., Riyadh, Saudi Arabia)"
              value={currentItem.location}
              onChangeText={(text) => setCurrentItem({...currentItem, location: text})}
            />
            <TextInput
            style={styles.input}
            placeholder="LinkedIn Profile URL"
            value={currentItem.website}
            onChangeText={(text) => setCurrentItem({ ...currentItem, website: text })}
            />

          </>
        )}
        
        {serviceType === 'restaurants' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Cuisine Type"
              value={currentItem.cuisineType}
              onChangeText={(text) => setCurrentItem({...currentItem, cuisineType: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Price Range (e.g., $$$)"
              value={currentItem.priceRange}
              onChangeText={(text) => setCurrentItem({...currentItem, priceRange: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Location"
              value={currentItem.location}
              onChangeText={(text) => setCurrentItem({...currentItem, location: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Website URL"
              value={currentItem.website}
              onChangeText={(text) => setCurrentItem({...currentItem, website: text})}
            />
          </>
        )}
        
        {/* UPDATE THIS SECTION FOR SIM CARDS */}
        {serviceType === 'simCards' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Provider (e.g., STC, Mobily, Zain)"
              value={currentItem.provider}
              onChangeText={(text) => setCurrentItem({...currentItem, provider: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Data Amount (e.g., 10GB, Unlimited)"
              value={currentItem.dataAmount}
              onChangeText={(text) => setCurrentItem({...currentItem, dataAmount: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Price (e.g., 100 SAR)"
              value={currentItem.price}
              onChangeText={(text) => setCurrentItem({...currentItem, price: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Location (e.g., Available across Saudi Arabia)"
              value={currentItem.location}
              onChangeText={(text) => setCurrentItem({...currentItem, location: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Website URL"
              value={currentItem.website}
              onChangeText={(text) => setCurrentItem({...currentItem, website: text})}
            />
          </>
        )}
        
        <TextInput
          style={styles.input}
          placeholder="Image URL"
          value={currentItem.imageUrl || currentItem.image}
          onChangeText={(text) => setCurrentItem({...currentItem, imageUrl: text, image: text})}
        />
      </>
    );
  };

  return (
    <ImageBackground
      source={require("../../../assets/images/thefillbac.png")}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/admin/services")}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage {serviceTitle}</Text>
          <TouchableOpacity onPress={openAddModal}>
            <Ionicons name="add-circle" size={24} color="#0a2463" />
          </TouchableOpacity>
        </View>

        {/* Service ID Display for Debugging */}
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>Service Type: {serviceType}</Text>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0a2463" />
          </View>
        ) : (
          <ScrollView style={styles.scrollView}>
            {items.length > 0 ? (
              items.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{item.title || item.name}</Text>
                    <Text style={styles.itemDescription}>
                      {item.description && item.description.length > 100 
                        ? item.description.substring(0, 100) + '...' 
                        : item.description}
                    </Text>
                    
                    {/* Display additional info based on service type */}
                    {item.price && (
                      <Text style={styles.itemDetail}>Price: {item.price}</Text>
                    )}
                    {item.location && (
                      <Text style={styles.itemDetail}>Location: {item.location}</Text>
                    )}
                    {item.cuisineType && (
                      <Text style={styles.itemDetail}>Cuisine: {item.cuisineType}</Text>
                    )}
                    
                    {/* Show ID for debugging */}
                    <Text style={styles.itemIdText}>ID: {item.id}</Text>
                  </View>
                  <View style={styles.itemActions}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.editButton]}
                      activeOpacity={0.7}
                      onPress={() => openEditModal(item)}
                    >
                      <Ionicons name="create-outline" size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.deleteButton]}
                      activeOpacity={0.7}
                      onPress={() => handleDeleteItem(item.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No {serviceTitle} items found. Click the + button to add some.
                </Text>
              </View>
            )}
          </ScrollView>
        )}
        
        {/* Item Edit/Add Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {isEditing ? `Edit ${serviceTitle} Item` : `Add New ${serviceTitle} Item`}
              </Text>
              
              {/* Show item ID in edit mode */}
              {isEditing && currentItem.id && (
                <Text style={styles.itemIdText}>Editing Item ID: {currentItem.id}</Text>
              )}
              
              <ScrollView style={styles.formScrollView}>
                {renderFormFields()}
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
                  onPress={handleSaveItem}
                >
                  <Text style={styles.saveButtonText}>
                    {isEditing ? 'Update' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => router.push("/")}
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

export default function ServiceContentManagementScreen() {
  return (
    <AdminProtectedRoute>
      <ServiceContentManagement />
    </AdminProtectedRoute>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  dropdownContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  
  dropdownOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#eee',
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  
  dropdownOptionSelected: {
    backgroundColor: '#0a2463',
  },
  
  dropdownText: {
    color: '#333',
  },
  
  dropdownTextSelected: {
    color: 'white',
    fontWeight: 'bold',
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
  debugContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  debugText: {
    fontSize: 12,
    color: '#666',
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
  formScrollView: {
    maxHeight: 400,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  itemCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a2463',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  itemDetail: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  itemIdText: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  itemActions: {
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
    maxHeight: '80%',
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