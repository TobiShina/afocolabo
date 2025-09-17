// screens/AuthScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebaseConfig"; // Your Firebase config

WebBrowser.maybeCompleteAuthSession();

const AuthScreen = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: "YOUR_IOS_CLIENT_ID",
    androidClientId: "YOUR_ANDROID_CLIENT_ID",
    webClientId: "YOUR_WEB_CLIENT_ID", // This is usually the one you get from Firebase for web apps.
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.authentication;
      if (id_token) {
        setLoading(true);
        const credential = GoogleAuthProvider.credential(id_token);
        signInWithCredential(auth, credential)
          .then(() => {
            // User signed in successfully
            setLoading(false);
          })
          .catch((error) => {
            Alert.alert("Sign-in Error", error.message);
            setLoading(false);
          });
      }
    } else if (response?.type === "error") {
      Alert.alert(
        "Authentication Error",
        response.error.message || "Something went wrong during Google sign-in."
      );
    }
  }, [response]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await promptAsync();
    } catch (error) {
      Alert.alert(
        "Error",
        "Could not initiate Google sign-in. " + error.message
      );
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vent App</Text>
      <Text style={styles.subtitle}>Share your challenges, find support.</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#6200EE" />
      ) : (
        <Button
          title="Sign in with Google"
          onPress={handleGoogleSignIn}
          disabled={!request}
          color="#6200EE"
        />
      )}
      <Text style={styles.disclaimer}>
        By signing in, you agree to share anonymous vent posts with other users
        of this app.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 40,
    textAlign: "center",
  },
  disclaimer: {
    marginTop: 30,
    fontSize: 12,
    color: "#888",
    textAlign: "center",
  },
});

export default AuthScreen;
