namespace db;

using { cuid, managed } from '@sap/cds/common';


entity PurchaseOrders : cuid, managed {

    poNumber          : String(20);
    prNumber          : String(20);
    vendorId          : String(50);
    vendorName        : String(100);
    vendorAddress     : String(255);
    requesterName     : String(100);
    department        : String(100);
    poDate            : Date;
    validFrom         : Date;
    validTo           : Date;
    currency          : String(3);
    totalNetAmount    : Decimal(15,2);
    totalTaxAmount    : Decimal(15,2);
    totalGrossAmount  : Decimal(15,2);
    status            : String(20) default 'Draft';
    purchasingGroup   : String(50);
    buyer             : String(100);
    paymentTerms      : String(100);
    deliveryLocation  : String(255);
    notes             : String(500);

    items : Composition of many PurchaseOrderItems
        on items.parent = $self;
}


entity PurchaseOrderItems : cuid {

    parent            : Association to PurchaseOrders;
    poItemNumber      : String(10);
    prItemNumber      : String(10);
    materialNumber    : String(50);
    description       : String(255);
    quantity          : Decimal(15,3);
    unit              : String(10);
    unitPrice         : Decimal(15,2);
    taxRate           : Decimal(5,2);
    netAmount         : Decimal(15,2);
    taxAmount         : Decimal(15,2);
    grossAmount       : Decimal(15,2);
    deliveryDate      : Date;
    deliveryLocation  : String(255);
    itemStatus        : String(20);
}



entity PONumberCounter {

    key year : Integer;

    lastNumber : Integer;
}