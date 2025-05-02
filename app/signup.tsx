import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const Signup = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!fullName || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Starting signup process...");
      
      // Create user in Firebase Auth
      console.log("Attempting to create auth user");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Auth user created successfully:", user.uid);
      
      // Create user document in Firestore
      console.log("Creating Firestore document for user");
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: email,
        fullName: fullName,
        isAdmin: false,
        createdAt: new Date().toISOString(),
      });
      
      console.log("Firestore document created");
      console.log("User creation complete");
      
      // Navigate to dashboard
      router.replace("/dashboard");
    } catch (error) {
      console.error("Error during signup:", error);
      
      // Get detailed error information
      let errorMessage = "Failed to create account. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        
        // If it's a Firebase Auth error, it might have a code
        if ('code' in error) {
          console.error("Error code:", (error as any).code);
        }
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/logimg.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.innerContainer}>
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "SIGNING UP..." : "SIGN UP"}
            </Text>
          </TouchableOpacity>

          <View style={styles.loginLink}>
            <Text style={styles.text}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/signin")}>
              <Text style={styles.linkText}>SIGN IN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      {/* Bottom Navigation */}
      {/* <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push("/")}
        >
          <Ionicons name="person" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push("/football")}
        >
          <Ionicons name="football" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push("/dashboard")}
        >
          <Ionicons name="home" size={24} color="white" />
        </TouchableOpacity>
      </View> */}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%"
  },
  innerContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: 20,
    paddingTop: 350,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingLeft: 10,
  },
  button: {
    backgroundColor: "#001D75",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginLink: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "center",
  },
  text: {
    fontSize: 14,
    color: "#888",
  },
  linkText: {
    fontSize: 14,
    color: "#001D75",
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#0a2463',
    height: 60,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    padding: 10,
  },
});

export default Signup;