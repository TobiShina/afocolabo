import { StyleSheet } from "react-native";

export const CommonStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f8f8",
    paddingTop: 80, // Adjust for logo and status bar
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
    position: "absolute", // To place it at the very top center
    top: 30, // Adjust as needed
    left: 0,
    right: 0,
    zIndex: 100, // Ensure it's above other content
  },
  logo: {
    width: 80, // Adjust size based on your logo
    height: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 40, // Space below the logo
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  inputLabel: {
    flex: 2,
    fontSize: 16,
    marginRight: 10,
  },
  textInput: {
    flex: 3,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    fontSize: 16,
    height: 40,
  },
  thinLine: {
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    marginVertical: 20,
  },
  submitButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
    marginBottom: 50,
    width: "80%",
    alignSelf: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  // For editable text/input
  editableTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  editableTextLabel: {
    fontSize: 16,
    flex: 1,
    fontWeight: "600",
  },
  editableTextInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 2,
    flex: 2,
    fontSize: 16,
  },
  totalText: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "right",
  },
});