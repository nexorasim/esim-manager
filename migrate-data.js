const admin = require('firebase-admin');
const { MongoClient } = require('mongodb');

// Initialize Firebase Admin
const serviceAccount = require('./service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateData() {
  const mongoClient = new MongoClient(process.env.MONGO_URL);
  await mongoClient.connect();
  const mongodb = mongoClient.db(process.env.DB_NAME);

  // Migrate users
  const users = await mongodb.collection('users').find({}).toArray();
  for (const user of users) {
    await db.collection('users').doc(user._id.toString()).set({
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      failedLoginAttempts: user.failedLoginAttempts || 0,
      createdAt: admin.firestore.Timestamp.fromDate(user.createdAt),
      updatedAt: admin.firestore.Timestamp.fromDate(user.updatedAt)
    });
  }

  // Migrate profiles
  const profiles = await mongodb.collection('esimprofiles').find({}).toArray();
  for (const profile of profiles) {
    await db.collection('profiles').add({
      iccid: profile.iccid,
      name: profile.name,
      provider: profile.provider,
      status: profile.status,
      profileClass: profile.profileClass,
      userId: profile.userId.toString(),
      deviceId: profile.deviceId?.toString(),
      customNotes: profile.customNotes,
      metadata: profile.metadata,
      createdAt: admin.firestore.Timestamp.fromDate(profile.createdAt),
      updatedAt: admin.firestore.Timestamp.fromDate(profile.updatedAt)
    });
  }

  // Migrate devices
  const devices = await mongodb.collection('devices').find({}).toArray();
  for (const device of devices) {
    await db.collection('devices').add({
      name: device.name,
      eid: device.eid,
      connectionType: device.connectionType,
      status: device.status,
      ipAddress: device.ipAddress,
      macAddress: device.macAddress,
      userId: device.userId.toString(),
      metadata: device.metadata,
      createdAt: admin.firestore.Timestamp.fromDate(device.createdAt),
      updatedAt: admin.firestore.Timestamp.fromDate(device.updatedAt)
    });
  }

  await mongoClient.close();
  console.log('Migration complete');
}

migrateData().catch(console.error);