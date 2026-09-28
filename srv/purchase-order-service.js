const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {

    const {
        PurchaseOrders,
        PurchaseOrderItems
    } = this.entities;

    const { PONumberCounter } = cds.entities('db');


    // =========================================================
    // TEMPORARY MOCK PR DATA
    // =========================================================

    const mockPRs = {
        'PR-2026-000001': {
            status: 'Approved'
        },

        'PR-2026-000002': {
            status: 'Submitted'
        },

        'PR-2026-000003': {
            status: 'Rejected'
        },

        'PR-2026-000004': {
            status: 'Cancelled'
        }
    };


    // =========================================================
    // RULE 1 + PO NUMBER GENERATION
    // =========================================================

    this.before('CREATE', PurchaseOrders, async (req) => {

        const prNumber = req.data.prNumber;

        if (!prNumber) {
            return req.error(
                400,
                'PR Number is mandatory for Purchase Order creation.'
            );
        }

        const pr = mockPRs[prNumber];

        if (!pr) {
            return req.error(
                400,
                `PR ${prNumber} does not exist.`
            );
        }

        if (pr.status !== 'Approved') {
            return req.error(
                400,
                `PO cannot be created for PR ${prNumber}. PR status is ${pr.status}. Only Approved PRs are allowed.`
            );
        }


        const currentYear = new Date().getFullYear();

        let counter = await SELECT.one
            .from(PONumberCounter)
            .where({
                year: currentYear
            });


        if (!counter) {

            await INSERT.into(PONumberCounter).entries({
                year: currentYear,
                lastNumber: 1
            });

            counter = {
                year: currentYear,
                lastNumber: 1
            };

        } else {

            counter.lastNumber++;

            await UPDATE(PONumberCounter)
                .set({
                    lastNumber: counter.lastNumber
                })
                .where({
                    year: currentYear
                });

        }


        req.data.poNumber =
            `PO-${currentYear}-${String(counter.lastNumber).padStart(6, '0')}`;

        req.data.status = 'Draft';

        if (!req.data.poDate) {
            req.data.poDate =
                new Date().toISOString().split('T')[0];
        }

    });


    // =========================================================
    // RULE 4: DUPLICATE PR ITEM PREVENTION
    // =========================================================

    this.before(['CREATE', 'UPDATE'], PurchaseOrderItems, async (req) => {


    const {
    prItemNumber,
    parent_ID,
    quantity
    } = req.data;


    // =========================================================
     // RULE 8
    if (
        quantity === null ||
        quantity === undefined ||
        quantity <= 0
    ) {
        return req.error(
            400,
            'PO Quantity must be greater than zero.'
        );
    }

    // =========================================================
// RULE 10: UNIT PRICE MUST BE GREATER THAN 0
// =========================================================

if (
    unitPrice === null ||
    unitPrice === undefined ||
    unitPrice <= 0
) {
    return req.error(
        400,
        'Unit Price must be greater than zero.'
    );
}



    // =========================================================
    // RULE 4: DUPLICATE PR ITEM PREVENTION
    // =========================================================

    if (!prItemNumber) {
        return req.error(
            400,
            'PR Item Number is mandatory.'
        );
    }


    if (!parent_ID) {
        return req.error(
            400,
            'Purchase Order reference is missing.'
        );
    }


    const po = await SELECT.one
        .from(PurchaseOrders)
        .where({
            ID: parent_ID
        });


    if (!po) {
        return req.error(
            404,
            'Parent Purchase Order not found.'
        );
    }


    const existingItems = await SELECT
        .from(PurchaseOrderItems)
        .where({
            prItemNumber: prItemNumber
        });


    for (const item of existingItems) {

        const existingPO = await SELECT.one
            .from(PurchaseOrders)
            .where({
                ID: item.parent_ID
            });


        if (
            existingPO &&
            existingPO.prNumber === po.prNumber
        ) {

            return req.error(
                400,
                `PR Item ${prItemNumber} from PR ${po.prNumber} has already been used in another Purchase Order.`
            );

        }
    }

});


    // =========================================================
    // YOUR EXISTING SUBMIT ACTION
    // =========================================================

    this.on('submit', PurchaseOrders, async (req) => {

        // your existing submit code...

    });


    // =========================================================
    // YOUR EXISTING APPROVE ACTION
    // =========================================================

    this.on('approve', PurchaseOrders, async (req) => {

        // your existing approve code...

    });


    // =========================================================
    // YOUR EXISTING REJECT ACTION
    // =========================================================

    this.on('reject', PurchaseOrders, async (req) => {

        // your existing reject code...

    });


    // =========================================================
    // YOUR EXISTING CANCEL ACTION
    // =========================================================

    this.on('cancel', PurchaseOrders, async (req) => {

        // your existing cancel code...

    });

});