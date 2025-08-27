
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

export const syncPartnerInventoryLogic = async (db: admin.firestore.Firestore, before: any, after: any) => {
  if (!before || !after) {
    console.log('No data to process.');
    return;
  }

  // Sync inventory only when an order is fulfilled
  if (before.status !== 'fulfilled' && after.status === 'fulfilled') {
    const { items } = after;

    for (const item of items) {
      const { inventoryId, qty } = item;
      const inventoryRef = db.collection('inventories').doc(inventoryId);

      await db.runTransaction(async (transaction) => {
        const inventoryDoc = await transaction.get(inventoryRef);
        if (!inventoryDoc.exists) {
          throw new Error(`Inventory item ${inventoryId} not found.`);
        }
        const newStock = inventoryDoc.data()!.currentStock - qty;
        transaction.update(inventoryRef, { currentStock: newStock });
      });
    }
  }
};

export const syncPartnerInventory = onDocumentUpdated('partsOrders/{orderId}', async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  const db = admin.firestore();
  await syncPartnerInventoryLogic(db, before, after);
});
