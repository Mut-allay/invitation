
import * as admin from 'firebase-admin';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

export const acceptInvitation = async (
  db: admin.firestore.Firestore,
  invitationId: string
): Promise<void> => {
  const invitationRef = db.collection('partnerBusinesses').doc(invitationId);

  await invitationRef.update({
    status: 'active',
    acceptedDate: admin.firestore.Timestamp.now(),
  });
};
