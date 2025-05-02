import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const Login = () => {
  const router = useRouter();
  const [fadeAnim] = useState(new Animated.Value(0));
  
  useEffect(() => {
    // Simple fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground
        source={require("../assets/images/logimg.png")}
        style={styles.container}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={styles.innerContainer}>
          
          <Animated.View 
            style={[
              styles.formWrapper, 
              { opacity: fadeAnim }
            ]}
          >
            <View style={styles.formContainer}>
              <View style={styles.taglineContainer}>
                <View style={styles.taglineDivider} />
                <Text style={styles.tagline}>Your gateway to stadiums, stories, and stays!</Text>
                <View style={styles.taglineDivider} />
              </View>

              <TouchableOpacity
                style={[styles.button, styles.signUpButton]}
                onPress={() => router.push("/signup")}             
              >
                <Text style={styles.buttonText}>GET STARTED</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              </TouchableOpacity>
              
              <TouchableOpacity               
                style={[styles.button, styles.signInButton]}               
                onPress={() => router.push("/signin")}             
              >               
                <Text style={styles.altButtonText}>ALREADY A MEMBER</Text>             
              </TouchableOpacity>
              
            </View>
          </Animated.View>
          </ScrollView>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 Hopper App</Text>
        </View>
      </ImageBackground>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  innerContainer: {
    width: "100%",
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 5,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  formWrapper: {
    width: "100%",
    alignItems: "center",
    marginTop: 280,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    backdropFilter: 'blur(10px)',
  },
  taglineContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  taglineDivider: {
    width: 40,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginVertical: 10,
  },
  tagline: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 30,
    paddingHorizontal: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
  },
  button: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  signUpButton: {
    backgroundColor: "#1E3A8A",
  },
  signInButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderColor: "#1E3A8A",
    borderWidth: 1,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  altButtonText: {
    color: "#1E3A8A",
    fontSize: 16,
    fontWeight: "600",
  },
  benefitsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: "100%",
    maxWidth: 400,
    marginTop: 24,
    paddingHorizontal: 10,
  },
  footer: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 20,
  },
  footerText: {
    color: "#FFFFFF",
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default Login;