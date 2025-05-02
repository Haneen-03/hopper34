// app/services/hotels.tsx
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

interface HotelItem {
  id: string;
  title: string;
  name?: string;
  description?: string;
  price?: string;
  location?: string;
  imageUrl?: string;
  image?: string;
  mapUrl?: string;
  website?: string;
}

export default function HotelsScreen() {
  const router = useRouter();
  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState<HotelItem | null>(null);

  // Fetch hotels directly from the 'hotels' document
  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      console.log(`Fetching hotels from the 'hotels' document`);
      // Direct reference to the hotels document with logical ID
      const hotelsRef = collection(db, 'services', 'hotels', 'items');
      const snapshot = await getDocs(hotelsRef);
      
      console.log(`Found ${snapshot.size} hotels`);
      
      if (snapshot.empty) {
        setHotels([]);
      } else {
        const hotelsData = snapshot.docs.map(doc => {
          console.log(`Hotel: ${doc.id}`, doc.data());
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || data.name || "Unnamed Hotel",
            name: data.name || data.title || "Unnamed Hotel",
            description: data.description || "",
            price: data.price || "",
            location: data.location || "",
            imageUrl: data.imageUrl || data.image || "https://via.placeholder.com/400x200?text=No+Image",
            image: data.image || data.imageUrl || "https://via.placeholder.com/400x200?text=No+Image",
            mapUrl: data.mapUrl || `https://www.google.com/maps?q=${encodeURIComponent(data.location || "")}`,
            website: data.website || "",
          };
        }) as HotelItem[];
        
        console.log("Hotels data:", hotelsData);
        setHotels(hotelsData);
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
      setHotels([]);
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

  const showHotelDetails = (hotel: HotelItem) => {
    setSelectedHotel(hotel);
  };

  const backToList = () => {
    setSelectedHotel(null);
  };

  const renderHotelsList = () => {
    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Hotels in Saudi Arabia</Text>
          
          {hotels.length > 0 ? (
            hotels.map(hotel => (
              <View key={hotel.id} style={styles.hotelCard}>
                <Image 
                  source={{ uri: hotel.imageUrl || hotel.image }} 
                  style={styles.hotelImage}
                />
                <View style={styles.hotelInfo}>
                  <Text style={styles.hotelTitle}>{hotel.title || hotel.name}</Text>
                  {hotel.location && (
                    <Text style={styles.hotelLocation}>📍 {hotel.location}</Text>
                  )}
                  {hotel.price && (
                    <Text style={styles.hotelPrice}>Price: {hotel.price} per night</Text>
                  )}
                  
                  <View style={styles.buttonRow}>
                    <TouchableOpacity 
                      style={styles.detailButton}
                      onPress={() => showHotelDetails(hotel)}
                    >
                      <Text style={styles.buttonText}>View Details</Text>
                    </TouchableOpacity>

                    {hotel.mapUrl && (
                      <TouchableOpacity 
                        style={styles.mapButton}
                        onPress={() => openMap(hotel.mapUrl as string)}
                      >
                        <Text style={styles.buttonText}>View on Map</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  {hotel.website && (
                    <TouchableOpacity 
                      style={styles.websiteButton}
                      onPress={() => openWebsite(hotel.website as string)}
                    >
                      <Text style={styles.buttonText}>Visit Website</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No hotels available at the moment.</Text>
          )}
        </View>
      </ScrollView>
    );
  };

  const renderHotelDetails = () => {
    if (!selectedHotel) return null;
    
    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.detailContainer}>
          <Image 
            source={{ uri: selectedHotel.imageUrl || selectedHotel.image }} 
            style={styles.detailImage}
          />
          <Text style={styles.detailTitle}>{selectedHotel.title || selectedHotel.name}</Text>
          <Text style={styles.detailLocation}>📍 {selectedHotel.location}</Text>
          
          {selectedHotel.description && (
            <Text style={styles.detailDescription}>{selectedHotel.description}</Text>
          )}
          
          {selectedHotel.price && (
            <Text style={styles.detailPrice}>Price: {selectedHotel.price} per night</Text>
          )}
          
          <View style={styles.detailButtonRow}>
            {selectedHotel.mapUrl && (
              <TouchableOpacity 
                style={styles.detailMapButton}
                onPress={() => openMap(selectedHotel.mapUrl as string)}
              >
                <Text style={styles.buttonText}>View on Map</Text>
              </TouchableOpacity>
            )}
            
            {selectedHotel.website && (
              <TouchableOpacity 
                style={styles.detailWebsiteButton}
                onPress={() => openWebsite(selectedHotel.website as string)}
              >
                <Text style={styles.buttonText}>Visit Website</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={backToList}
          >
            <Text style={styles.backButtonText}>🔙 Back to List</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  return (
    <>
      <Stack.Screen options={{ 
        headerShown: false  // This hides the black header
      }} />
      
      <ImageBackground
        source={require("../../assets/images/thefillbac.png")}
        style={styles.backgroundImage}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => selectedHotel ? backToList() : router.back()}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {selectedHotel ? selectedHotel.title || selectedHotel.name : ""}
            </Text>
            <View style={{ width: 24 }} />
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0a2463" />
            </View>
          ) : (
            selectedHotel ? renderHotelDetails() : renderHotelsList()
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
    </>
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
  hotelCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
  },
  hotelImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
  hotelInfo: {
    padding: 16,
  },
  hotelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a2463',
    marginBottom: 4,
  },
  hotelLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  hotelDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  hotelPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0a2463',
    marginBottom: 12,
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
  // Hotel Details Styles
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
  detailTitle: {
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
    marginBottom: 16,
    textAlign: 'center',
  },
  detailPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0a2463',
    textAlign: 'center',
    marginBottom: 24,
  },
  detailButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
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