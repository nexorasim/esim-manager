import { FirebaseService } from '../lib/firebase-service'
import { FirestoreProfile, ProfileStatus, ProfileClass } from '../lib/firestore-types'
import { auth } from '../lib/firebase-config'

export interface CreateProfileData {
  iccid: string
  name: string
  provider?: string
  profileClass?: ProfileClass
  customNotes?: string
  metadata?: Record<string, any>
}

export interface UpdateProfileData {
  name?: string
  status?: ProfileStatus
  deviceId?: string
  customNotes?: string
  metadata?: Record<string, any>
}

export class ProfileService {
  static async createProfile(data: CreateProfileData): Promise<string> {
    if (!auth.currentUser) throw new Error('User not authenticated')
    
    const profileData = {
      ...data,
      provider: data.provider || 'NexoraSIM',
      profileClass: data.profileClass || 'operational' as ProfileClass,
      status: 'pending' as ProfileStatus,
      userId: auth.currentUser.uid
    }
    
    const profileId = await FirebaseService.createProfile(profileData)
    
    // Log profile creation
    await FirebaseService.createAuditLog({
      action: 'profile.create',
      severity: 'info',
      userId: auth.currentUser.uid,
      userEmail: auth.currentUser.email!,
      resourceType: 'profile',
      resourceId: profileId,
      details: { iccid: data.iccid, name: data.name },
      success: true
    })
    
    return profileId
  }
  
  static async getUserProfiles(): Promise<FirestoreProfile[]> {
    if (!auth.currentUser) throw new Error('User not authenticated')
    return FirebaseService.getUserProfiles(auth.currentUser.uid)
  }
  
  static async updateProfile(profileId: string, updates: UpdateProfileData): Promise<void> {
    if (!auth.currentUser) throw new Error('User not authenticated')
    
    await FirebaseService.updateProfile(profileId, updates)
    
    // Log profile update
    await FirebaseService.createAuditLog({
      action: updates.status === 'active' ? 'profile.activate' : 
              updates.status === 'inactive' ? 'profile.deactivate' : 'profile.update',
      severity: 'info',
      userId: auth.currentUser.uid,
      userEmail: auth.currentUser.email!,
      resourceType: 'profile',
      resourceId: profileId,
      details: updates,
      success: true
    })
  }
  
  static async deleteProfile(profileId: string): Promise<void> {
    if (!auth.currentUser) throw new Error('User not authenticated')
    
    await FirebaseService.deleteProfile(profileId)
    
    // Log profile deletion
    await FirebaseService.createAuditLog({
      action: 'profile.delete',
      severity: 'info',
      userId: auth.currentUser.uid,
      userEmail: auth.currentUser.email!,
      resourceType: 'profile',
      resourceId: profileId,
      success: true
    })
  }
  
  static subscribeToProfiles(callback: (profiles: FirestoreProfile[]) => void) {
    if (!auth.currentUser) throw new Error('User not authenticated')
    return FirebaseService.subscribeToUserProfiles(auth.currentUser.uid, callback)
  }
}