import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  ImageBackground,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  doc,
  getDoc,
  updateDoc,
  setDoc
} from 'firebase/firestore';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from '../firebase';

export default function Profile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    livesInSaudi: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.log('No authenticated user found');
          setLoading(false);
          return;
        }

        console.log('Fetching user data for UID:', user.uid);
        
        // Get user document from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          // User document exists in Firestore
          const userData = userDocSnap.data();
          console.log('User data retrieved from Firestore:', userData);
          
          setFormData({
            fullName: userData.fullName || user.displayName || '',
            email: userData.email || user.email || '',
            phone: userData.phone || '',
            livesInSaudi: userData.livesInSaudi || '',
          });
        } else {
          // User document doesn't exist in Firestore, create it from auth data
          console.log('No Firestore document found for user, using auth data');
          
          const newUserData = {
            fullName: user.displayName || '',
            email: user.email || '',
            phone: '',
            livesInSaudi: '',
            createdAt: new Date().toISOString(),
            uid: user.uid,
          };
          
          // Create the user document in Firestore
          await setDoc(userDocRef, newUserData);
          console.log('Created new user document in Firestore');
          
          setFormData({
            fullName: newUserData.fullName,
            email: newUserData.email,
            phone: '',
            livesInSaudi: '',
          });
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        setError('Could not load user profile.');
        Alert.alert('Error', 'Could not load user profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'You must be signed in to update your profile');
      return;
    }

    // If email is being changed, require password confirmation
    if (formData.email !== user.email) {
      setShowPasswordModal(true);
      return;
    }

    // Otherwise, proceed with save
    await saveData();
  };

  const confirmAndSave = async () => {
    if (!passwordInput.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }
    
    await saveData();
  };

  const saveData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setSaving(true);
    setError('');
    
    try {
      // Store reference to the updated data for error handling
      let updatedAuthProfile = false;
      let updatedFirestore = false;
      
      // Step 1: Update Firebase Auth email if changed
      if (formData.email !== user.email && passwordInput) {
        try {
          const credential = EmailAuthProvider.credential(user.email!, passwordInput);
          await reauthenticateWithCredential(user, credential);
          await updateEmail(user, formData.email);
          updatedAuthProfile = true;
          console.log('Email updated successfully in Auth');
        } catch (authError: any) {
          console.error('Error updating email:', authError);
          Alert.alert(
            'Authentication Error', 
            authError.message || 'Failed to update email. Please check your password and try again.'
          );
          setSaving(false);
          return;
        }
      }
      
      // Step 2: Update Firebase Auth displayName if changed
      if (formData.fullName !== user.displayName) {
        try {
          await updateProfile(user, { displayName: formData.fullName });
          updatedAuthProfile = true;
          console.log('Display name updated successfully in Auth');
        } catch (profileError) {
          console.error('Error updating Auth profile:', profileError);
          // Continue with Firestore update even if Auth profile update fails
        }
      }
      
      // Step 3: Update Firestore document
      try {
        const userDocRef = doc(db, 'users', user.uid);
        
        const userData = {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          livesInSaudi: formData.livesInSaudi,
          updatedAt: new Date().toISOString(),
          uid: user.uid,
        };

        await updateDoc(userDocRef, userData);
        updatedFirestore = true;
        console.log('Firestore document updated successfully');
      } catch (firestoreError) {
        console.error('Error updating Firestore:', firestoreError);
        if (!updatedAuthProfile) {
          // Only show this error if we haven't updated anything yet
          throw firestoreError;
        }
      }
      
      // Only show success if at least one update succeeded
      if (updatedAuthProfile || updatedFirestore) {
        Alert.alert('Success', 'Profile updated successfully.');
        setShowPasswordModal(false);
        setPasswordInput('');
      } else {
        throw new Error('No changes were saved.');
      }
    } catch (error: any) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#001D75" />
      </View>
    );
  }

  return (
    <ImageBackground source={require('../assets/images/thefillbac.png')} style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Edit Profile</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={formData.fullName}
          onChangeText={text => handleChange('fullName', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={formData.email}
          onChangeText={text => handleChange('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Phone"
          value={formData.phone}
          onChangeText={text => handleChange('phone', text)}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Do you live in Saudi Arabia?</Text>
        <View style={styles.radioContainer}>
          <TouchableOpacity onPress={() => handleChange('livesInSaudi', 'yes')} style={styles.radio}>
            <Ionicons name={formData.livesInSaudi === 'yes' ? 'radio-button-on' : 'radio-button-off'} size={20} color="#001D75" />
            <Text style={styles.radioText}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleChange('livesInSaudi', 'no')} style={styles.radio}>
            <Ionicons name={formData.livesInSaudi === 'no' ? 'radio-button-on' : 'radio-button-off'} size={20} color="#001D75" />
            <Text style={styles.radioText}>No</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={handleSave} 
          style={styles.button} 
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal 
        visible={showPasswordModal} 
        transparent 
        animationType="slide"
        onRequestClose={() => {
          setShowPasswordModal(false);
          setPasswordInput('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Password</Text>
            <Text style={styles.modalDesc}>
              You're changing your email address. Please enter your password to confirm this change.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              secureTextEntry
              value={passwordInput}
              onChangeText={setPasswordInput}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={confirmAndSave}
              disabled={saving || !passwordInput}
            >
              <Text style={styles.buttonText}>
                {saving ? 'Saving...' : 'Confirm & Save'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#ccc', marginTop: 10 }]}
              onPress={() => {
                setShowPasswordModal(false);
                setPasswordInput('');
              }}
            >
              <Text style={[styles.buttonText, { color: '#333' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    paddingTop: 100,
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#001D75',
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
    width: '100%',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  label: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    fontWeight: '500',
    color: '#001D75',
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  radio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioText: {
    marginLeft: 5,
    color: '#001D75',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#001D75',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalDesc: {
    textAlign: 'center',
    marginBottom: 15,
    color: '#555',
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