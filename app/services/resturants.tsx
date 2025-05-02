// app/services/restaurants.tsx
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ImageBackground,
  Image,
  ActivityIndicator,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Stack } from 'expo-router';

interface RestaurantItem {
  id: string;
  name: string;
  title?: string;
  description?: string;
  location: string;
  image: string;
  imageUrl?: string;
  mapUrl?: string;
  website?: string;
  cuisineType?: string;
  priceRange?: string;
}

export default function RestaurantsScreen() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<RestaurantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantItem | null>(null);

  // Fetch restaurants directly from the 'restaurants' document
  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      console.log(`Fetching restaurants from the 'restaurants' document`);
      // Direct reference to the restaurants document with logical ID
      const restaurantsRef = collection(db, 'services', 'restaurants', 'items');
      const snapshot = await getDocs(restaurantsRef);
      
      console.log(`Found ${snapshot.size} restaurants`);
      
      if (snapshot.empty) {
        setRestaurants([]);
      } else {
        const restaurantsData = snapshot.docs.map(doc => {
          console.log(`Restaurant: ${doc.id}`, doc.data());
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || data.title || "Unnamed Restaurant",
            title: data.title || data.name || "Unnamed Restaurant",
            description: data.description || "",
            location: data.location || "Saudi Arabia",
            image: data.image || data.imageUrl || "https://via.placeholder.com/400x200?text=No+Image",
            imageUrl: data.imageUrl || data.image || "https://via.placeholder.com/400x200?text=No+Image",
            mapUrl: data.mapUrl || `https://www.google.com/maps?q=${encodeURIComponent(data.location || "")}`,
            website: data.website || "",
            cuisineType: data.cuisineType || "",
            priceRange: data.priceRange || ""
          };
        }) as RestaurantItem[];
        
        console.log("Restaurants data:", restaurantsData);
        setRestaurants(restaurantsData);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const openWebsite = (url: string) => {
    if (url) {
      Linking.openURL(url).catch((err) =>
        console.error("Error opening website:", err)
      );
    }
  };
  
  const openMap = (mapUrl: string) => {
    if (mapUrl) {
      Linking.openURL(mapUrl).catch((err) =>
        console.error("Error opening map:", err)
      );
    }
  };

  const showRestaurantDetails = (restaurant: RestaurantItem) => {
    setSelectedRestaurant(restaurant);
  };

  const backToList = () => {
    setSelectedRestaurant(null);
  };

  const renderRestaurantsList = () => {
    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Restaurants in Saudi Arabia</Text>
          
          {restaurants.length > 0 ? (
            restaurants.map(restaurant => (
              <View key={restaurant.id} style={styles.restaurantCard}>
                <Image 
                  source={{ uri: restaurant.image || restaurant.imageUrl }} 
                  style={styles.restaurantImage}
                />
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName}>{restaurant.name || restaurant.title}</Text>
                  {restaurant.location && (
                    <Text style={styles.restaurantLocation}>{restaurant.location}</Text>
                  )}
                  {restaurant.cuisineType && (
                    <Text style={styles.cuisineType}>Cuisine: {restaurant.cuisineType}</Text>
                  )}
                  {restaurant.priceRange && (
                    <Text style={styles.priceRange}>Price Range: {restaurant.priceRange}</Text>
                  )}
                  
                  <View style={styles.buttonRow}>
                    <TouchableOpacity 
                      style={styles.detailButton}
                      onPress={() => showRestaurantDetails(restaurant)}
                    >
                      <Text style={styles.buttonText}>View Details</Text>
                    </TouchableOpacity>
                    
                    {restaurant.mapUrl && (
                      <TouchableOpacity 
                        style={styles.mapButton}
                        onPress={() => openMap(restaurant.mapUrl as string)}
                      >
                        <Text style={styles.buttonText}>View on Map</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  {restaurant.website && (
                    <TouchableOpacity 
                      style={styles.websiteButton}
                      onPress={() => openWebsite(restaurant.website as string)}
                    >
                      <Text style={styles.buttonText}>Visit Website</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No restaurants available at the moment.</Text>
          )}
        </View>
      </ScrollView>
    );
  };

  const renderRestaurantDetails = () => {
    if (!selectedRestaurant) return null;
    
    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.detailContainer}>
          <Image 
            source={{ uri: selectedRestaurant.image || selectedRestaurant.imageUrl }} 
            style={styles.detailImage}
          />
          <Text style={styles.detailName}>{selectedRestaurant.name || selectedRestaurant.title}</Text>
          <Text style={styles.detailLocation}>{selectedRestaurant.location}</Text>
          
          {/* Description is shown only in the detail view */}
          {selectedRestaurant.description && (
            <Text style={styles.detailDescription}>{selectedRestaurant.description}</Text>
          )}
          
          {selectedRestaurant.cuisineType && (
            <Text style={styles.detailInfo}>Cuisine: {selectedRestaurant.cuisineType}</Text>
          )}
          
          {selectedRestaurant.priceRange && (
            <Text style={styles.detailInfo}>Price Range: {selectedRestaurant.priceRange}</Text>
          )}
          
          <View style={styles.detailButtonRow}>
            {selectedRestaurant.mapUrl && (
              <TouchableOpacity 
                style={styles.detailMapButton}
                onPress={() => openMap(selectedRestaurant.mapUrl as string)}
              >
                <Text style={styles.detailButtonText}>View on Map</Text>
              </TouchableOpacity>
            )}
            
            {selectedRestaurant.website && (
              <TouchableOpacity 
                style={styles.detailWebsiteButton}
                onPress={() => openWebsite(selectedRestaurant.website as string)}
              >
                <Text style={styles.detailButtonText}>Visit Website</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={backToList}
          >
            <Text style={styles.backButtonText}>Back to Restaurants</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  return (
    <ImageBackground
      source={require("../../assets/images/thefillbac.png")}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => selectedRestaurant ? backToList() : router.back()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {selectedRestaurant ? selectedRestaurant.name || selectedRestaurant.title : ""}
          </Text>
          <View style={{ width: 24 }} /> {/* Empty view for balance */}
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0a2463" />
          </View>
        ) : (
          selectedRestaurant ? renderRestaurantDetails() : renderRestaurantsList()
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0a2463',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  restaurantCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
  },
  restaurantImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
  restaurantInfo: {
    padding: 16,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a2463',
    marginBottom: 4,
    textAlign: 'center',
  },
  restaurantLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  cuisineType: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  priceRange: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  detailButton: {
    backgroundColor: '#0a2463',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 5,
  },
  mapButton: {
    backgroundColor: '#0a2463',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginLeft: 5,
  },
  websiteButton: {
    backgroundColor: '#0a2463',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  // Restaurant Details Styles
  detailContainer: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    margin: 16,
  },
  detailImage: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 16,
    resizeMode: 'contain',
  },
  detailName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0a2463',
    textAlign: 'center',
    marginBottom: 8,
  },
  detailLocation: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  detailDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  detailInfo: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  detailButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 16,
  },
  detailMapButton: {
    backgroundColor: '#0a2463',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  detailWebsiteButton: {
    backgroundColor: '#0a2463',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  detailButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  backButton: {
    backgroundColor: '#0a2463',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
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