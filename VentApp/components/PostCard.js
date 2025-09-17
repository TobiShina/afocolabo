// components/PostCard.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";

const PostCard = ({ post }) => {
  const currentUserId = auth.currentUser?.uid;
  const hasHugged = post.huggedBy?.includes(currentUserId);

  const handleHug = async () => {
    if (!currentUserId) {
      Alert.alert("Sign In Required", "Please sign in to drop a hug.");
      return;
    }

    const postRef = doc(db, "posts", post.id); // 'post.id' is the Firestore document ID

    try {
      if (hasHugged) {
        // User wants to un-hug
        await updateDoc(postRef, {
          hugs: post.hugs - 1,
          huggedBy: arrayRemove(currentUserId),
        });
      } else {
        // User wants to hug
        await updateDoc(postRef, {
          hugs: post.hugs + 1,
          huggedBy: arrayUnion(currentUserId),
        });
      }
    } catch (error) {
      console.error("Error updating hug:", error);
      Alert.alert("Error", "Could not update hug. Please try again.");
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.category}>{post.category}</Text>
      <Text style={styles.postText}>{post.text}</Text>
      <Text style={styles.username}>- {post.username}</Text>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.hugButton} onPress={handleHug}>
          <Text style={styles.hugButtonText}>
            {hasHugged ? "Unhug 🫂" : "Drop a Hug 🫂"} ({post.hugs || 0})
          </Text>
        </TouchableOpacity>
        <Text style={styles.timestamp}>
          {post.timestamp?.toDate().toLocaleString()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  category: {
    fontSize: 12,
    color: "#6200EE",
    fontWeight: "bold",
    marginBottom: 5,
  },
  postText: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 22,
  },
  username: {
    fontSize: 13,
    color: "#555",
    fontStyle: "italic",
    textAlign: "right",
    marginBottom: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  hugButton: {
    backgroundColor: "#E0BBE4",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  hugButtonText: {
    color: "#6200EE",
    fontWeight: "bold",
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
  },
});

export default PostCard;
