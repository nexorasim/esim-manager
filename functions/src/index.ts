import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp()

// Trigger when a new user is created
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  try {
    // Create user document in Firestore
    await admin.firestore().collection('users').doc(user.uid).set({
      email: user.email,
      name: user.displayName || 'New User',
      role: 'viewer',
      isActive: true,
      failedLoginAttempts: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })

    // Log user creation
    await admin.firestore().collection('auditLogs').add({
      action: 'user.register',
      severity: 'info',
      userId: user.uid,
      userEmail: user.email,
      success: true,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    })

    console.log(`User document created for ${user.email}`)
  } catch (error) {
    console.error('Error creating user document:', error)
  }
})

// Clean up user data when account is deleted
export const onUserDelete = functions.auth.user().onDelete(async (user) => {
  try {
    const batch = admin.firestore().batch()
    
    // Delete user document
    batch.delete(admin.firestore().collection('users').doc(user.uid))
    
    // Delete user's profiles
    const profilesSnapshot = await admin.firestore()
      .collection('profiles')
      .where('userId', '==', user.uid)
      .get()
    
    profilesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref)
    })
    
    // Delete user's devices
    const devicesSnapshot = await admin.firestore()
      .collection('devices')
      .where('userId', '==', user.uid)
      .get()
    
    devicesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref)
    })
    
    await batch.commit()
    
    // Log user deletion
    await admin.firestore().collection('auditLogs').add({
      action: 'admin.user_delete',
      severity: 'info',
      userEmail: user.email,
      success: true,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    })
    
    console.log(`User data cleaned up for ${user.email}`)
  } catch (error) {
    console.error('Error cleaning up user data:', error)
  }
})

// HTTP function for admin operations
export const adminOperations = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated and is admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }
  
  const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get()
  const userData = userDoc.data()
  
  if (!userData || userData.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'User must be admin')
  }
  
  const { operation, targetUserId, updates } = data
  
  try {
    switch (operation) {
      case 'updateUserRole':
        await admin.firestore().collection('users').doc(targetUserId).update({
          role: updates.role,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        })
        
        await admin.firestore().collection('auditLogs').add({
          action: 'admin.user_update',
          severity: 'info',
          userId: context.auth.uid,
          userEmail: context.auth.token.email,
          resourceType: 'user',
          resourceId: targetUserId,
          details: { roleChanged: updates.role },
          success: true,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        })
        
        return { success: true }
        
      default:
        throw new functions.https.HttpsError('invalid-argument', 'Invalid operation')
    }
  } catch (error) {
    console.error('Admin operation error:', error)
    throw new functions.https.HttpsError('internal', 'Operation failed')
  }
})