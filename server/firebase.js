const admin = require("firebase-admin");

const serviceAccount = require("./admin.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "***REMOVED***.appspot.com",
});

const db = admin.firestore();

module.exports = { admin, db };
