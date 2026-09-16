using { db } from '../db/schema';

@path: 'purchase-orders'
service PurchaseOrderService {

    @odata.draft.enabled
    entity PurchaseOrders as projection on db.PurchaseOrders
        actions {
            action submit();
            action approve();
            action reject();
            action cancel();
        };

    entity PurchaseOrderItems as projection on db.PurchaseOrderItems;
}