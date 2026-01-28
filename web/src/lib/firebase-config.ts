import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'

const firebaseConfig = {
  apiKey: "AIzaSyApn4RKllECl9Hz11PivtvJj94G1CWSez8",
  authDomain: "nexora-sim.firebaseapp.com",
  projectId: "nexora-sim",
  storageBucket: "nexora-sim.firebasestorage.app",
  messagingSenderId: "7469720952",
  appId: "1:7469720952:web:fc169e89e51ae58aaad48d",
  measurementId: "G-Q6EE0MHN9B"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const functions = getFunctions(app)
export default app