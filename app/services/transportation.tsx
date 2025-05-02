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
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Stack } from 'expo-router';

interface TransportItem {
  id: string;
  name: string;
  description: string;
  image: string;
  website?: string;
  category?: string;
}

export default function TransportScreen() {
  const router = useRouter();
  const [transportOptions, setTransportOptions] = useState<TransportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransport, setSelectedTransport] = useState<TransportItem | null>(null);

  useEffect(() => {
    fetchTransportOptions();
  }, []);

  const fetchTransportOptions = async () => {
    setLoading(true);
    try {
      const transportRef = collection(db, 'services', 'transportation', 'items');
      const snapshot = await getDocs(transportRef);
      if (snapshot.empty) {
        setTransportOptions([]);
      } else {
        const transportData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'Unnamed Transport',
            description: data.description || '',
            image: data.image || 'https://via.placeholder.com/400x200?text=No+Image',
            website: data.website || '',
            category: data.category || 'Other',
          };
        }) as TransportItem[];
        setTransportOptions(transportData);
      }
    } catch (error) {
      console.error('Error fetching transport options:', error);
      setTransportOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const openWebsite = (url: string) => {
    if (url) {
      Linking.openURL(url).catch((err) =>
        console.error('Error opening website:', err)
      );
    }
  };

  const showTransportDetails = (transport: TransportItem) => {
    setSelectedTransport(transport);
  };

  const backToList = () => {
    setSelectedTransport(null);
  };

  const renderTransportList = () => {
    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>

          {transportOptions.length > 0 ? (
            Object.entries(
              transportOptions.reduce((acc, item) => {
                const key = item.category || 'Other';
                if (!acc[key]) acc[key] = [];
                acc[key].push(item);
                return acc;
              }, {} as Record<string, TransportItem[]>)
            ).map(([category, items]) => (
              <View key={category}>
                <Text style={styles.sectionTitle}>{category}</Text>
                {items.map((transport) =>
                  transport.website ? (
                    <TouchableOpacity
                      key={transport.id}
                      style={styles.transportCard}
                      onPress={() => openWebsite(transport.website!)}
                      activeOpacity={0.9}
                    >
                      <Image
                        source={{ uri: transport.image }}
                        style={styles.transportImage}
                      />
                      <View style={styles.transportInfo}>
                        <Text style={styles.transportTitle}>{transport.name}</Text>
                        <View style={styles.buttonRow}>
                          <TouchableOpacity
                            style={styles.detailButton}
                            onPress={() => showTransportDetails(transport)}
                          >
                            <Text style={styles.buttonText}>View Details</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.websiteButton}
                            onPress={() => openWebsite(transport.website!)}
                          >
                            <Text style={styles.buttonText}>Visit Website</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <View key={transport.id} style={styles.transportCard}>
                      <Image
                        source={{ uri: transport.image }}
                        style={styles.transportImage}
                      />
                      <View style={styles.transportInfo}>
                        <Text style={styles.transportTitle}>{transport.name}</Text>
                        <View style={styles.buttonRow}>
                          <TouchableOpacity
                            style={styles.detailButton}
                            onPress={() => showTransportDetails(transport)}
                          >
                            <Text style={styles.buttonText}>View Details</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )
                )}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              No transportation options available at the moment.
            </Text>
          )}
        </View>
      </ScrollView>
    );
  };

  const renderTransportDetails = () => {
    if (!selectedTransport) return null;

    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.detailContainer}>
          <Image
            source={{ uri: selectedTransport.image }}
            style={styles.detailImage}
          />
          <Text style={styles.detailTitle}>{selectedTransport.name}</Text>
          <Text style={styles.detailDescription}>{selectedTransport.description}</Text>
          {selectedTransport.website && (
            <TouchableOpacity
              style={styles.detailWebsiteButton}
              onPress={() => openWebsite(selectedTransport.website!)}
            >
              <Text style={styles.buttonText}>Visit Website</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.backButton} onPress={backToList}>
            <Text style={styles.backButtonText}>Back to List</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ImageBackground
        source={require('../../assets/images/thefillbac.png')}
        style={styles.backgroundImage}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => (selectedTransport ? backToList() : router.back())}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {selectedTransport ? selectedTransport.name : ''}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0a2463" />
            </View>
          ) : selectedTransport ? (
            renderTransportDetails()
          ) : (
            renderTransportList()
          )}

          <View style={styles.bottomNav}>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => router.push('/profile')}
            >
              <Ionicons name="person" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => router.push('/dashboard')}
            >
              <Ionicons name="home" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => router.push('/football')}
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
  transportCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
  },
  transportImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
  transportInfo: {
    padding: 16,
  },
  transportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a2463',
    marginBottom: 4,
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
  websiteButton: {
    backgroundColor: '#0a2463',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
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
  detailDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  detailWebsiteButton: {
    backgroundColor: '#0a2463',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
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
