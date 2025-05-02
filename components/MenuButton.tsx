// app/components/MenuButton.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function MenuButton() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)}>
          <Text style={styles.menuIcon}>≡</Text>
        </TouchableOpacity>

        {menuOpen && (
          <View style={styles.dropdown}>
            <TouchableOpacity
              style={styles.item}
              onPress={() => {
                setMenuOpen(false);
                router.push('/about');
              }}
            >
              <Text style={styles.itemText}>About Us</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.item}
              onPress={() => {
                setMenuOpen(false);
                router.push('/services/translation');
              }}
            >
              <Text style={styles.itemText}>Translation</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.item, styles.logout]}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {menuOpen && (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    right: 16,
    zIndex: 100,
    alignItems: 'flex-end',
  },
  menuIcon: {
    fontSize: 26,
    color: '#000',
    padding: 8,
  },
  dropdown: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: 6,
    width: 150,
    paddingVertical: 6,
    elevation: 4,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }),
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  itemText: {
    fontSize: 16,
    color: '#000',
  },
  logout: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 6,
  },
  logoutText: {
    color: 'red',
    fontSize: 16,
  },
});
