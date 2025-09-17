// screens/HomeScreen.js
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { collection, query, orderBy, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import PostCard from "../components/PostCard"; // Your PostCard component
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // For the plus icon

const HomeScreen = ({ route, navigation }) => {
  const { category } = route.params; // Get category from navigation params
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      let q;
      if (category === "All") {
        q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
      } else {
        q = query(
          collection(db, "posts"),
          where("category", "==", category),
          orderBy("timestamp", "desc")
        );
      }
      const querySnapshot = await getDocs(q);
      const fetchedPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      // Optionally show an error message to the user
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category]);

  // Use useFocusEffect to refetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [fetchPosts])
  );

  const renderPost = ({ item }) => <PostCard post={item} />;

  return (
    <View style={styles.container}>
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#6200EE" style={styles.loader} />
      ) : posts.length === 0 ? (
        <Text style={styles.emptyText}>
          No posts in this category yet. Be the first to share!
        </Text>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchPosts}
              colors={["#6200EE"]}
            />
          }
        />
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddPost")}
      >
        <MaterialCommunityIcons name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingBottom: 20, // Add some padding at the bottom
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#777",
  },
  fab: {
    position: "absolute",
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    right: 20,
    bottom: 20,
    backgroundColor: "#6200EE",
    borderRadius: 28,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default HomeScreen;
