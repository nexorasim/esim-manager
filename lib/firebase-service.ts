import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from '../firebase-config'
import { 
  FirestoreUser, 
  FirestoreProfile, 
  FirestoreDevice, 
  FirestoreAuditLog,
  FirestoreProfileTemplate 
} from './firestore-types'

export class FirebaseService {
  // User operations
  static async createUser(userData: Omit<FirestoreUser, 'id' | 'createdAt' | 'updatedAt'>) {
    const docRef = await addDoc(collection(db, 'users'), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  }

  static async getUser(userId: string): Promise<FirestoreUser | null> {
    const docRef = doc(db, 'users', userId)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as FirestoreUser : null
  }

  static async updateUser(userId: string, updates: Partial<FirestoreUser>) {
    const docRef = doc(db, 'users', userId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  }

  // Profile operations
  static async createProfile(profileData: Omit<FirestoreProfile, 'id' | 'createdAt' | 'updatedAt'>) {
    const docRef = await addDoc(collection(db, 'profiles'), {
      ...profileData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  }

  static async getUserProfiles(userId: string): Promise<FirestoreProfile[]> {
    const q = query(
      collection(db, 'profiles'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreProfile))
  }

  static async updateProfile(profileId: string, updates: Partial<FirestoreProfile>) {
    const docRef = doc(db, 'profiles', profileId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  }

  static async deleteProfile(profileId: string) {
    await deleteDoc(doc(db, 'profiles', profileId))
  }

  // Device operations
  static async createDevice(deviceData: Omit<FirestoreDevice, 'id' | 'createdAt' | 'updatedAt'>) {
    const docRef = await addDoc(collection(db, 'devices'), {
      ...deviceData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  }

  static async getUserDevices(userId: string): Promise<FirestoreDevice[]> {
    const q = query(
      collection(db, 'devices'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreDevice))
  }

  static async updateDevice(deviceId: string, updates: Partial<FirestoreDevice>) {
    const docRef = doc(db, 'devices', deviceId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  }

  static async deleteDevice(deviceId: string) {
    await deleteDoc(doc(db, 'devices', deviceId))
  }

  // Audit log operations
  static async createAuditLog(logData: Omit<FirestoreAuditLog, 'id' | 'timestamp'>) {
    await addDoc(collection(db, 'auditLogs'), {
      ...logData,
      timestamp: serverTimestamp()
    })
  }

  static async getAuditLogs(limitCount = 100): Promise<FirestoreAuditLog[]> {
    const q = query(
      collection(db, 'auditLogs'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreAuditLog))
  }

  // Real-time subscriptions
  static subscribeToUserProfiles(userId: string, callback: (profiles: FirestoreProfile[]) => void) {
    const q = query(
      collection(db, 'profiles'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    return onSnapshot(q, (snapshot) => {
      const profiles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreProfile))
      callback(profiles)
    })
  }

  static subscribeToUserDevices(userId: string, callback: (devices: FirestoreDevice[]) => void) {
    const q = query(
      collection(db, 'devices'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    return onSnapshot(q, (snapshot) => {
      const devices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreDevice))
      callback(devices)
    })
  }
}