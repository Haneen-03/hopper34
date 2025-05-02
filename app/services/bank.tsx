// app/services/bank.tsx
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

interface BankItem {
  id: string;
  name: string;
  title?: string;
  description?: string;
  location: string;
  image: string;
  imageUrl?: string;
  website?: string;
}

export default function BanksScreen() {
  const router = useRouter();
  const [banks, setBanks] = useState<BankItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBank, setSelectedBank] = useState<BankItem | null>(null);

  // Fetch banks directly from the 'banks' document
  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    setLoading(true);
    try {
      console.log(`Fetching banks from the 'banks' document`);
      // Direct reference to the banks document with logical ID
      const banksRef = collection(db, 'services', 'bank', 'items');
      const snapshot = await getDocs(banksRef);
      
      console.log(`Found ${snapshot.size} banks`);
      
      if (snapshot.empty) {
        setBanks([]);
      } else {
        const banksData = snapshot.docs.map(doc => {
          console.log(`Bank: ${doc.id}`, doc.data());
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || data.title || "Unnamed Bank",
            title: data.title || data.name || "Unnamed Bank",
            description: data.description || "",
            location: data.location || "Saudi Arabia",
            image: data.image || data.imageUrl || "https://via.placeholder.com/400x200?text=No+Image",
            imageUrl: data.imageUrl || data.image || "https://via.placeholder.com/400x200?text=No+Image",
            website: data.website || ""
          };
        }) as BankItem[];
        
        console.log("Banks data:", banksData);
        setBanks(banksData);
      }
    } catch (error) {
      console.error('Error fetching banks:', error);
      setBanks([]);
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

  const showBankDetails = (bank: BankItem) => {
    setSelectedBank(bank);
  };

  const backToList = () => {
    setSelectedBank(null);
  };

  const renderCurrencyInfoCard = () => {
    return (
      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>What you should know about currencies</Text>
        <Text style={styles.infoCardDescription}>
          Tourists visiting Saudi Arabia can easily exchange currencies and carry out all financial transactions without hassle
          thanks to the digital transformation of the country's banking sector. In fact, travelling with too much cash is discouraged.
          Banks in the Kingdom, as major foreign exchange establishments, handle currency exchanges and money transfers.
        </Text>
        
        <View style={styles.infoCardSection}>
          <Text style={styles.infoCardSectionTitle}>Basic Information About the Saudi Currency</Text>
          <Text style={styles.infoCardSectionText}>
            The national currency of the Kingdom of Saudi Arabia is the Saudi Riyal (SAR), which is subdivided into 
            100 halalas. Banknotes are available in denominations of 1, 5, 10, 50, 100, and 500 riyals. Coins are 
            available in denominations of 1 Riyal, 2 Riyals, and 1, 5, 10, 25, and 50 halalas.
          </Text>
        </View>
        
        <View style={styles.infoCardSection}>
          <Text style={styles.infoCardSectionTitle}>What is the Exchange Rate in Saudi Arabia?</Text>
          <Text style={styles.infoCardSectionText}>
            All banks in Saudi Arabia offer currency exchange services. You can also 
            find exchange offices at airports, some shopping malls, and various 
            locations throughout the Kingdom. Typically, banking hours are from 9:30 
            AM to 4:30 PM, Saturday to Thursday. Exchange offices usually open later 
            but may charge higher commission fees.
          </Text>
        </View>
        
        <View style={styles.infoCardSection}>
          <Text style={styles.infoCardSectionTitle}>Saudi Riyal Conversion Calculator Website</Text>
          <TouchableOpacity 
            style={styles.infoCardButton}
            onPress={() => openWebsite("https://xe.com")}
          >
            <Text style={styles.infoCardButtonText}>Visit xe.com</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderBanksList = () => {
    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Render the currency info card at the top */}
          {renderCurrencyInfoCard()}
                    
          <View style={styles.banksContainer}>
            <Text style={styles.containerTitle}>Available Banking Options</Text>
            {banks.length > 0 ? (
              banks.map(bank => (
                <View key={bank.id} style={styles.bankCard}>
                  <Image 
                    source={{ uri: bank.image || bank.imageUrl }} 
                    style={styles.bankImage}
                  />
                  <View style={styles.bankInfo}>
                    <Text style={styles.bankName}>{bank.name || bank.title}</Text>
                    {bank.location && (
                      <Text style={styles.bankLocation}>{bank.location}</Text>
                    )}
                    
                    <View style={styles.buttonRow}>
                      <TouchableOpacity 
                        style={styles.detailButton}
                        onPress={() => showBankDetails(bank)}
                      >
                        <Text style={styles.buttonText}>View Details</Text>
                      </TouchableOpacity>
                      
                      {bank.website && (
                        <TouchableOpacity 
                          style={styles.websiteButton}
                          onPress={() => openWebsite(bank.website as string)}
                        >
                          <Text style={styles.buttonText}>Visit Website</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No banks available at the moment.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderBankDetails = () => {
    if (!selectedBank) return null;
    
    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.detailContainer}>
          <Image 
            source={{ uri: selectedBank.image || selectedBank.imageUrl }} 
            style={styles.detailImage}
          />
          <Text style={styles.detailName}>{selectedBank.name || selectedBank.title}</Text>
          
          {/* Description is shown only in the detail view */}
          {selectedBank.description && (
            <Text style={styles.detailDescription}>{selectedBank.description}</Text>
          )}
          
          {selectedBank.location && selectedBank.location !== selectedBank.description && (
            <Text style={styles.detailLocation}>{selectedBank.location}</Text>
          )}
          
          {selectedBank.website && (
            <TouchableOpacity 
              style={styles.detailWebsiteButton}
              onPress={() => openWebsite(selectedBank.website as string)}
            >
              <Text style={styles.detailButtonText}>Visit Website</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={backToList}
          >
            <Text style={styles.backButtonText}>Back to Banks</Text>
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
          <TouchableOpacity onPress={() => selectedBank ? backToList() : router.back()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {selectedBank ? selectedBank.name || selectedBank.title : ""}
          </Text>
          <View style={{ width: 24 }} /> {/* Empty view for balance */}
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0a2463" />
          </View>
        ) : (
          selectedBank ? renderBankDetails() : renderBanksList()
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
  // Info Card Styles
  infoCard: {
    backgroundColor: '#0a2463',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  infoCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  infoCardDescription: {
    fontSize: 14,
    color: 'white',
    marginBottom: 16,
    lineHeight: 20,
  },
  infoCardSection: {
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    paddingTop: 8,
  },
  infoCardSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  infoCardSectionText: {
    fontSize: 14,
    color: 'white',
    lineHeight: 18,
  },
  infoCardButton: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'center',
  },
  infoCardButtonText: {
    color: '#0a2463',
    fontWeight: 'bold',
    fontSize: 14,
  },
  // Bank Container Styles
  banksContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  containerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a2463',
    marginBottom: 16,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    paddingBottom: 8,
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
  bankCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eaeaea',
  },
  bankImage: {
    width: '100%',
    height: 100,
    resizeMode: 'contain',
    backgroundColor: 'white',
  },
  bankInfo: {
    padding: 16,
  },
  bankName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a2463',
    marginBottom: 4,
    textAlign: 'center',
  },
  bankLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
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
  // Bank Details Styles
  detailContainer: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    margin: 16,
  },
  detailImage: {
    width: '60%',
    height: 120,
    borderRadius: 10,
    marginBottom: 16,
    resizeMode: 'contain',
    backgroundColor: 'white',
    alignSelf: 'center',
  },
  detailName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0a2463',
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
  detailLocation: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  detailWebsiteButton: {
    backgroundColor: '#0a2463',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 16,
    width: '80%',
    alignSelf: 'center',
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
    width: '80%',
    alignSelf: 'center',
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