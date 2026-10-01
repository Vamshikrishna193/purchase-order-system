using { db } from '../db/schema';

@path: 'purchase-orders'
service PurchaseOrderService {

    @odata.draft.enabled
    entity PurchaseOrders as projection on db.PurchaseOrders
        actions {
            action submit();
            action approve();
            action reject(rejectionComments : String(500));
            action cancel();
            action rework();
        };

    entity PurchaseOrderItems as projection on db.PurchaseOrderItems;

    @readonly
    entity PRValueHelp {
        key prNumber      : String(20);
        status            : String(20);
        requesterName     : String(100);
        department        : String(100);
        currency          : String(3);
        totalAmount       : Decimal(15,2);
    }
}