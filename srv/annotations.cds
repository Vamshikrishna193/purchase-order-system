using PurchaseOrderService as service from './purchase-order-service';


annotate service.PurchaseOrders with @(

    UI: {
        HeaderInfo: {
            TypeName: 'Purchase Order',
            TypeNamePlural: 'Purchase Orders',

            Title: {
                $Type: 'UI.DataField',
                Value: poNumber
            },

            Description: {
                $Type: 'UI.DataField',
                Value: vendorName
            }
        },

        Identification: [
    {
        $Type: 'UI.DataFieldForAction',
        Action: 'PurchaseOrderService.submit',
        Label: 'Submit PO'
    },
    {
        $Type: 'UI.DataFieldForAction',
        Action: 'PurchaseOrderService.approve',
        Label: 'Approve PO'
    },
    {
        $Type: 'UI.DataFieldForAction',
        Action: 'PurchaseOrderService.reject',
        Label: 'Reject PO'
    },
    {
        $Type: 'UI.DataFieldForAction',
        Action: 'PurchaseOrderService.cancel',
        Label: 'Cancel PO'
    }
    ],


        LineItem: [

            {
                $Type: 'UI.DataField',
                Value: poNumber,
                Label: 'PO Number'
            },

            {
                $Type: 'UI.DataField',
                Value: prNumber,
                Label: 'PR Number'
            },

            {
                $Type: 'UI.DataField',
                Value: vendorName,
                Label: 'Vendor'
            },

            {
                $Type: 'UI.DataField',
                Value: requesterName,
                Label: 'Requester'
            },

            {
                $Type: 'UI.DataField',
                Value: department,
                Label: 'Department'
            },

            {
                $Type: 'UI.DataField',
                Value: poDate,
                Label: 'PO Date'
            },

            {
                $Type: 'UI.DataField',
                Value: currency,
                Label: 'Currency'
            },

            {
                $Type: 'UI.DataField',
                Value: totalNetAmount,
                Label: 'Net Amount'
            },

            {
                $Type: 'UI.DataField',
                Value: totalTaxAmount,
                Label: 'Tax Amount'
            },

            {
                $Type: 'UI.DataField',
                Value: totalGrossAmount,
                Label: 'Gross Amount'
            },

            {
                $Type: 'UI.DataField',
                Value: status,
                Label: 'Status'
            },

            {
                $Type: 'UI.DataField',
                Value: buyer,
                Label: 'Buyer'
            }
        ],


        FieldGroup #GeneralInformation: {
            $Type: 'UI.FieldGroupType',

            Data: [

                {
                    $Type: 'UI.DataField',
                    Value: poNumber,
                    Label: 'PO Number'
                },

                {
                    $Type: 'UI.DataField',
                    Value: prNumber,
                    Label: 'PR Number'
                },

                {
                    $Type: 'UI.DataField',
                    Value: requesterName,
                    Label: 'Requester'
                },

                {
                    $Type: 'UI.DataField',
                    Value: department,
                    Label: 'Department'
                },

                {
                    $Type: 'UI.DataField',
                    Value: status,
                    Label: 'Status'
                }

            ]
        },


        FieldGroup #VendorInformation: {
            $Type: 'UI.FieldGroupType',

            Data: [

                {
                    $Type: 'UI.DataField',
                    Value: vendorId,
                    Label: 'Vendor ID'
                },

                {
                    $Type: 'UI.DataField',
                    Value: vendorName,
                    Label: 'Vendor Name'
                },

                {
                    $Type: 'UI.DataField',
                    Value: vendorAddress,
                    Label: 'Vendor Address'
                },

                {
                    $Type: 'UI.DataField',
                    Value: currency,
                    Label: 'Currency'
                }

            ]
        },

        FieldGroup #Dates: {
            $Type: 'UI.FieldGroupType',

            Data: [

                {
                    $Type: 'UI.DataField',
                    Value: poDate,
                    Label: 'PO Date'
                },

                {
                    $Type: 'UI.DataField',
                    Value: validFrom,
                    Label: 'Valid From'
                },

                {
                    $Type: 'UI.DataField',
                    Value: validTo,
                    Label: 'Valid To'
                }

            ]
        },


        FieldGroup #Amounts: {
            $Type: 'UI.FieldGroupType',

            Data: [

                {
                    $Type: 'UI.DataField',
                    Value: totalNetAmount,
                    Label: 'Total Net Amount'
                },

                {
                    $Type: 'UI.DataField',
                    Value: totalTaxAmount,
                    Label: 'Total Tax Amount'
                },

                {
                    $Type: 'UI.DataField',
                    Value: totalGrossAmount,
                    Label: 'Total Gross Amount'
                },

                {
                    $Type: 'UI.DataField',
                    Value: currency,
                    Label: 'Currency'
                }

            ]
        },


        FieldGroup #ProcurementInformation: {
            $Type: 'UI.FieldGroupType',

            Data: [

                {
                    $Type: 'UI.DataField',
                    Value: purchasingGroup,
                    Label: 'Purchasing Group'
                },

                {
                    $Type: 'UI.DataField',
                    Value: buyer,
                    Label: 'Buyer'
                },

                {
                    $Type: 'UI.DataField',
                    Value: paymentTerms,
                    Label: 'Payment Terms'
                }

            ]
        },

        FieldGroup #DeliveryInformation: {
            $Type: 'UI.FieldGroupType',

            Data: [

                {
                    $Type: 'UI.DataField',
                    Value: deliveryLocation,
                    Label: 'Delivery Location'
                },

                {
                    $Type: 'UI.DataField',
                    Value: validFrom,
                    Label: 'Valid From'
                },

                {
                    $Type: 'UI.DataField',
                    Value: validTo,
                    Label: 'Valid To'
                }

            ]
        },



        FieldGroup #Notes: {
            $Type: 'UI.FieldGroupType',

            Data: [

                {
                    $Type: 'UI.DataField',
                    Value: notes,
                    Label: 'Notes'
                }

            ]
        },



        Facets: [

            {
                $Type: 'UI.ReferenceFacet',
                ID: 'GeneralInformationFacet',
                Label: 'General Information',
                Target: '@UI.FieldGroup#GeneralInformation'
            },

            {
                $Type: 'UI.ReferenceFacet',
                ID: 'VendorInformationFacet',
                Label: 'Vendor Information',
                Target: '@UI.FieldGroup#VendorInformation'
            },

            {
                $Type: 'UI.ReferenceFacet',
                ID: 'DatesFacet',
                Label: 'Dates',
                Target: '@UI.FieldGroup#Dates'
            },

            {
                $Type: 'UI.ReferenceFacet',
                ID: 'AmountsFacet',
                Label: 'Amounts',
                Target: '@UI.FieldGroup#Amounts'
            },

            {
                $Type: 'UI.ReferenceFacet',
                ID: 'ProcurementInformationFacet',
                Label: 'Procurement Information',
                Target: '@UI.FieldGroup#ProcurementInformation'
            },

            {
                $Type: 'UI.ReferenceFacet',
                ID: 'DeliveryInformationFacet',
                Label: 'Delivery Information',
                Target: '@UI.FieldGroup#DeliveryInformation'
            },

            {
                $Type: 'UI.ReferenceFacet',
                ID: 'NotesFacet',
                Label: 'Notes',
                Target: '@UI.FieldGroup#Notes'
            },

            {
                $Type: 'UI.ReferenceFacet',
                ID: 'ItemsFacet',
                Label: 'Purchase Order Items',
                Target: 'items/@UI.LineItem'
            }

        ]

    }
);


annotate service.PurchaseOrderItems with @(
    UI: {

        LineItem: [

            {
                $Type: 'UI.DataField',
                Value: poItemNumber,
                Label: 'PO Item'
            },

            {
                $Type: 'UI.DataField',
                Value: prItemNumber,
                Label: 'PR Item'
            },

            {
                $Type: 'UI.DataField',
                Value: materialNumber,
                Label: 'Material Number'
            },

            {
                $Type: 'UI.DataField',
                Value: description,
                Label: 'Description'
            },

            {
                $Type: 'UI.DataField',
                Value: quantity,
                Label: 'Quantity'
            },

            {
                $Type: 'UI.DataField',
                Value: unit,
                Label: 'Unit'
            },

            {
                $Type: 'UI.DataField',
                Value: unitPrice,
                Label: 'Unit Price'
            },

            {
                $Type: 'UI.DataField',
                Value: taxRate,
                Label: 'Tax Rate'
            },

            {
                $Type: 'UI.DataField',
                Value: netAmount,
                Label: 'Net Amount'
            },

            {
                $Type: 'UI.DataField',
                Value: taxAmount,
                Label: 'Tax Amount'
            },

            {
                $Type: 'UI.DataField',
                Value: grossAmount,
                Label: 'Gross Amount'
            },

            {
                $Type: 'UI.DataField',
                Value: deliveryDate,
                Label: 'Delivery Date'
            },

            {
                $Type: 'UI.DataField',
                Value: deliveryLocation,
                Label: 'Delivery Location'
            },

            {
                $Type: 'UI.DataField',
                Value: itemStatus,
                Label: 'Item Status'
            }

        ],


        HeaderInfo: {

            TypeName: 'Purchase Order Item',
            TypeNamePlural: 'Purchase Order Items',

            Title: {
                $Type: 'UI.DataField',
                Value: poItemNumber
            },

            Description: {
                $Type: 'UI.DataField',
                Value: description
            }

        },


        FieldGroup #ItemInformation: {
            $Type: 'UI.FieldGroupType',

            Data: [

                {
                    $Type: 'UI.DataField',
                    Value: poItemNumber,
                    Label: 'PO Item'
                },

                {
                    $Type: 'UI.DataField',
                    Value: prItemNumber,
                    Label: 'PR Item'
                },

                {
                    $Type: 'UI.DataField',
                    Value: materialNumber,
                    Label: 'Material Number'
                },

                {
                    $Type: 'UI.DataField',
                    Value: description,
                    Label: 'Description'
                },

                {
                    $Type: 'UI.DataField',
                    Value: itemStatus,
                    Label: 'Item Status'
                }

            ]
        },


        FieldGroup #QuantityAndPrice: {
            $Type: 'UI.FieldGroupType',

            Data: [

                {
                    $Type: 'UI.DataField',
                    Value: quantity,
                    Label: 'Quantity'
                },

                {
                    $Type: 'UI.DataField',
                    Value: unit,
                    Label: 'Unit'
                },

                {
                    $Type: 'UI.DataField',
                    Value: unitPrice,
                    Label: 'Unit Price'
                },

                {
                    $Type: 'UI.DataField',
                    Value: taxRate,
                    Label: 'Tax Rate'
                }

            ]
        },


        FieldGroup #ItemAmounts: {
            $Type: 'UI.FieldGroupType',

            Data: [

                {
                    $Type: 'UI.DataField',
                    Value: netAmount,
                    Label: 'Net Amount'
                },

                {
                    $Type: 'UI.DataField',
                    Value: taxAmount,
                    Label: 'Tax Amount'
                },

                {
                    $Type: 'UI.DataField',
                    Value: grossAmount,
                    Label: 'Gross Amount'
                }

            ]
        },


        FieldGroup #ItemDelivery: {
            $Type: 'UI.FieldGroupType',

            Data: [

                {
                    $Type: 'UI.DataField',
                    Value: deliveryDate,
                    Label: 'Delivery Date'
                },

                {
                    $Type: 'UI.DataField',
                    Value: deliveryLocation,
                    Label: 'Delivery Location'
                }

            ]
        },


        Facets: [

            {
                $Type: 'UI.ReferenceFacet',
                ID: 'ItemInformationFacet',
                Label: 'Item Information',
                Target: '@UI.FieldGroup#ItemInformation'
            },

            {
                $Type: 'UI.ReferenceFacet',
                ID: 'QuantityAndPriceFacet',
                Label: 'Quantity & Price',
                Target: '@UI.FieldGroup#QuantityAndPrice'
            },

            {
                $Type: 'UI.ReferenceFacet',
                ID: 'ItemAmountsFacet',
                Label: 'Amounts',
                Target: '@UI.FieldGroup#ItemAmounts'
            },

            {
                $Type: 'UI.ReferenceFacet',
                ID: 'ItemDeliveryFacet',
                Label: 'Delivery',
                Target: '@UI.FieldGroup#ItemDelivery'
            }

        ]

    }
);