// screens/AddPostScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { categories } from "../navigation/AppNavigator"; // Import categories from your navigator

const AddPostScreen = ({ navigation }) => {
  const [postText, setPostText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categories[0]); // Default to first category
  const [loading, setLoading] = useState(false);

  const handleSubmitPost = async () => {
    if (!postText.trim()) {
      Alert.alert("Empty Post", "Please write something before posting.");
      return;
    }
    if (!selectedCategory) {
      Alert.alert("No Category", "Please select a category for your post.");
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert("Authentication Required", "You must be signed in to post.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "posts"), {
        text: postText.trim(),
        category: selectedCategory,
        userId: currentUser.uid,
        username: currentUser.displayName || currentUser.email, // Use display name or email
        hugs: 0,
        huggedBy: [], // Array to store UIDs of users who hugged
        timestamp: serverTimestamp(), // Firebase server timestamp
      });
      Alert.alert("Success", "Your vent has been posted!");
      setPostText("");
      navigation.goBack(); // Go back to the home screen
    } catch (error) {
      console.error("Error adding post:", error);
      Alert.alert("Error", "Failed to post your vent. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Share Your Vent</Text>
      <TextInput
        style={styles.textInput}
        placeholder="What's on your mind? Share your struggles here..."
        multiline
        value={postText}
        onChangeText={setPostText}
        maxLength={500} // Limit post length
      />
      <Text style={styles.charCount}>{postText.length}/500</Text>

      <Text style={styles.label}>Select Category:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              selectedCategory === cat && styles.selectedCategoryButton,
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === cat && styles.selectedCategoryButtonText,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Button
        title={loading ? "Posting..." : "Post Vent"}
        onPress={handleSubmitPost}
        disabled={loading}
        color="#6200EE"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
    paddingTop: 60, // Give space for notch/status bar
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  textInput: {
    height: 150,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#fff",
    fontSize: 16,
    textAlignVertical: "top",
  },
  charCount: {
    textAlign: "right",
    fontSize: 12,
    color: "#777",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#555",
  },
  categoryScroll: {
    marginBottom: 20,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#d0d0d0",
  },
  selectedCategoryButton: {
    backgroundColor: "#6200EE",
    borderColor: "#6200EE",
  },
  categoryButtonText: {
    color: "#333",
    fontWeight: "600",
  },
  selectedCategoryButtonText: {
    color: "#fff",
  },
});

export default AddPostScreen;
