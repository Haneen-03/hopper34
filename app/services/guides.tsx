// app/services/guides.tsx
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

interface GuideItem {
  id: string;
  name: string;
  location: string;
  image: string;
  website?: string;
}

export default function GuidesScreen() {
  const router = useRouter();
  const [guides, setGuides] = useState<GuideItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuide, setSelectedGuide] = useState<GuideItem | null>(null);

  // Fetch guides directly from the 'guides' document
  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    setLoading(true);
    try {
      console.log(`Fetching guides from the 'guides' document`);
      // Direct reference to the guides document with logical ID
      const guidesRef = collection(db, 'services', 'guides', 'items');
      const snapshot = await getDocs(guidesRef);
      
      console.log(`Found ${snapshot.size} guides`);
      
      if (snapshot.empty) {
        setGuides([]);
      } else {
        const guidesData = snapshot.docs.map(doc => {
          console.log(`Guide: ${doc.id}`, doc.data());
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || "Unnamed Guide",
            location: data.location || "Saudi Arabia",
            image: data.image || "https://via.placeholder.com/400x400?text=No+Image",
            website: data.website || "",
          };
        }) as GuideItem[];
        
        console.log("Guides data:", guidesData);
        setGuides(guidesData);
      }
    } catch (error) {
      console.error('Error fetching guides:', error);
      setGuides([]);
    } finally {
      setLoading(false);
    }
  };

  const openwebsite = (url: string) => {
    if (url) {
      // Add https:// if not already present
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      Linking.openURL(fullUrl).catch((err) =>
        console.error("Error opening website profile:", err)
      );
    }
  };

  const showGuideDetails = (guide: GuideItem) => {
    setSelectedGuide(guide);
  };

  const backToList = () => {
    setSelectedGuide(null);
  };

  const renderGuidesList = () => {
    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Tour Guides in Saudi Arabia</Text>
          
          {guides.length > 0 ? (
            <View style={styles.guideList}>
              {guides.map(guide => (
                <TouchableOpacity 
                  key={guide.id} 
                  style={styles.guideCard}
                  onPress={() => showGuideDetails(guide)}
                >
                  <Image 
                    source={{ uri: guide.image }} 
                    style={styles.guideImage}
                  />
                  <Text style={styles.guideName}>{guide.name}</Text>
                  <Text style={styles.guideLocation}>{guide.location}</Text>
                  {guide.website && (
                    <TouchableOpacity
                        style={styles.websiteButton}
                        onPress={() => showGuideDetails(guide)}
                        >
                        <Text style={styles.buttonText}>Details</Text>
                    </TouchableOpacity>

                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No tour guides available at the moment.</Text>
          )}
        </View>
      </ScrollView>
    );
  };

  const renderGuideDetails = () => {
    if (!selectedGuide) return null;
    
    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.detailContainer}>
          <Image 
            source={{ uri: selectedGuide.image }} 
            style={styles.detailImage}
          />
          <Text style={styles.detailName}>{selectedGuide.name}</Text>
          <Text style={styles.detailLocation}>{selectedGuide.location}</Text>
          
          {selectedGuide.website && (
            <TouchableOpacity 
              style={styles.detailwebsiteButton}
              onPress={() => openwebsite(selectedGuide.website as string)}
            >
              <Text style={styles.buttonText}>visit linkedin\website</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={backToList}
          >
            <Text style={styles.backButtonText}>Back to Guides</Text>
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
            <TouchableOpacity onPress={() => selectedGuide ? backToList() : router.back()}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {selectedGuide ? selectedGuide.name : ""}
            </Text>
            <View style={{ width: 24 }} /> {/* Empty view for balance */}
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0a2463" />
            </View>
          ) : (
            selectedGuide ? renderGuideDetails() : renderGuidesList()
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
  guideList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  guideCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 16,
    width: '48%', // Two columns
    alignItems: 'center',
  },
  guideImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  guideName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a2463',
    marginBottom: 4,
    textAlign: 'center',
  },
  guideLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  websiteButton: {
    backgroundColor: '#0077b5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  // Guide Details Styles
  detailContainer: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    margin: 16,
    alignItems: 'center',
  },
  detailImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 16,
  },
  detailName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0a2463',
    marginBottom: 8,
  },
  detailLocation: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
  },
  detailwebsiteButton: {
    backgroundColor: '#0077b5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    width: '80%',
  },
  backButton: {
    backgroundColor: '#0a2463',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    width: '80%',
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