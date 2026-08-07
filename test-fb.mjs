import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAuhAqniAxpjhFNpmZd_adRSOyfAWprLNk",
  authDomain: "bros-and-bitez-60e6f.firebaseapp.com",
  projectId: "bros-and-bitez-60e6f",
  storageBucket: "bros-and-bitez-60e6f.firebasestorage.app",
  messagingSenderId: "266857464996",
  appId: "1:266857464996:web:591ad17092ff517ada1231"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  console.log("Testing Firestore Connection...");
  
  try {
    const docRef = doc(db, "settings", "testConnection");
    const testData = { timestamp: Date.now() };
    
    console.log("Writing to Firestore...");
    // Give it a 5-second timeout in case it hangs
    await Promise.race([
      setDoc(docRef, testData),
      new Promise((_, r) => setTimeout(() => r(new Error("Timeout")), 5000))
    ]);
    console.log("✅ WRITE SUCCESSFUL");
    
    console.log("Reading from Firestore...");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      console.log("✅ READ SUCCESSFUL:", snap.data());
    } else {
      console.log("❌ READ FAILED: Document does not exist");
    }
    
    console.log("\nFIREBASE IS FULLY HEALTHY AND WORKING!");
  } catch (error) {
    console.error("\n❌ FIREBASE ERROR:");
    console.error(error.message || error);
    if (error.code === 'permission-denied') {
      console.error("This means your Firestore Security Rules are blocking access!");
    }
  }
  
  process.exit(0);
}

test();
