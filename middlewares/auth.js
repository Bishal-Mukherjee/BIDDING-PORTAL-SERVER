const admin = require("firebase-admin");

const getUserByEmail = async (email) => {
  const db = admin.firestore();
  const usersCollection = db.collection("users");
  try {
    const querySnapshot = await usersCollection
      .where("email", "==", email)
      .limit(1)
      .get();
    if (querySnapshot.empty) {
      return null;
    }
    const userDoc = querySnapshot.docs[0];
    return userDoc.data();
  } catch (error) {
    console.error("Error retrieving user by email:", error);
    throw new Error("Error retrieving user by email");
  }
};

const auth = async (req, res, next) => {
  const idToken = req.headers.authorization;
  if (!idToken) {
    return res.status(401).send("Unauthorized: No token provided");
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const user = await getUserByEmail(decodedToken.email);
    if (!user) {
      return res.status(401).send("Unauthorized: User not found");
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Error verifying ID token:", error);
    return res.status(401).send("Unauthorized: Invalid token");
  }
};

module.exports = { auth };
