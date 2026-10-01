const cds = require('@sap/cds');
const axios = require('axios');
require('dotenv').config();


module.exports = cds.service.impl(async function () {

    const {
        PurchaseOrders,
        PurchaseOrderItems,
        PRValueHelp
    } = this.entities;

    const { PONumberCounter } = cds.entities('db');

    // =========================================================
// RULE 11
// CALCULATE PURCHASE ORDER HEADER TOTALS
// =========================================================

async function recalculatePOTotals(poID) {

    const items = await SELECT
        .from(PurchaseOrderItems)
        .where({
            parent_ID: poID
        });

    let totalNetAmount = 0;
    let totalTaxAmount = 0;
    let totalGrossAmount = 0;

    for (const item of items) {

        totalNetAmount +=
            Number(item.netAmount || 0);

        totalTaxAmount +=
            Number(item.taxAmount || 0);

        totalGrossAmount +=
            Number(item.grossAmount || 0);
    }

    await UPDATE(PurchaseOrders)
        .set({
            totalNetAmount:
                Number(totalNetAmount.toFixed(2)),

            totalTaxAmount:
                Number(totalTaxAmount.toFixed(2)),

            totalGrossAmount:
                Number(totalGrossAmount.toFixed(2))
        })
        .where({
            ID: poID
        });
}

    // =========================================================
    // GET ACCESS TOKEN FROM XSUAA
    // =========================================================

    async function getAccessToken() {

        const tokenUrl = process.env.PR_TOKEN_URL;
        const clientId = process.env.PR_CLIENT_ID;
        const clientSecret = process.env.PR_CLIENT_SECRET;

        const response = await axios.post(

            tokenUrl,

            new URLSearchParams({
                grant_type: 'client_credentials'
            }).toString(),

            {
                auth: {
                    username: clientId,
                    password: clientSecret
                },

                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        console.log('XSUAA token received successfully');

        return response.data.access_token;
    }


    // =========================================================
    // F4 VALUE HELP - READ PR DATA FROM PR API
    // =========================================================

    this.on('READ', PRValueHelp, async (req) => {

    try {

        const token = await getAccessToken();

        console.log('Calling PR API...');
        console.log('PR_API_URL =', process.env.PR_API_URL);

        const response = await axios.get(
            process.env.PR_API_URL,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        console.log('PR API response received');

        return response.data.value
        //.filter(pr => pr.status === 'Approved')
        .map(pr => ({
            prNumber: pr.requestNo,
            status: pr.status,
            requesterName: pr.requesterName,
            department: pr.department,
            currency: pr.currency,
            totalAmount: pr.totalAmount
        }));

    } catch (error) {

        console.error(
            'Error while fetching PR data:',
            error.response?.data || error.message
        );

        return req.error(
            500,
            'Unable to fetch Purchase Request data.'
        );
    }
});

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


    // CHECK PR FROM REAL PR API

    const token = await getAccessToken();

    const response = await axios.get(
        process.env.PR_API_URL,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const pr = response.data.value.find(
        item => item.requestNo === prNumber
    );


    // PR NOT FOUND

    if (!pr) {

        return req.error(
            400,
            `PR ${prNumber} does not exist.`
        );

    }

    // ONLY APPROVED PR CAN CREATE PO

    if (pr.status !== 'Approved') {

        return req.error(
            400,
            `PO cannot be created for PR ${prNumber}. PR status is ${pr.status}. Only Approved PRs are allowed.`
        );

    }
    // Copy information from PR
      req.data.requesterName = pr.requesterName;
      req.data.department = pr.department;
      req.data.currency = pr.currency;


        // GENERATE PO NUMBER

        const currentYear = new Date().getFullYear();
            let counter = await SELECT
            .one
            .from(PONumberCounter)
            .where({
                year: currentYear
            });


        // FIRST PO OF THE YEAR

        if (!counter) {

            await INSERT
                .into(PONumberCounter)
                .entries({
                    year: currentYear,
                    lastNumber: 1
                });


            counter = {
                year: currentYear,
                lastNumber: 1
            };

        }

        // EXISTING COUNTER

        else {

            counter.lastNumber++;

            await UPDATE(PONumberCounter)
                .set({
                    lastNumber: counter.lastNumber
                })
                .where({
                    year: currentYear
                });

        }


        // CREATE PO NUMBER
        req.data.poNumber =
            `PO-${currentYear}-${String(counter.lastNumber).padStart(6, '0')}`;


        // DEFAULT STATUS
        req.data.status = 'Draft';


        // DEFAULT PO DATE
        if (!req.data.poDate) {

            req.data.poDate =
                new Date()
                    .toISOString()
                    .split('T')[0];

        }

    });



// =========================================================
// PURCHASE ORDER ITEM VALIDATION
// Rules 3, 8, 10, 11, 12, 16, 18
// =========================================================

this.before(['CREATE', 'UPDATE'],PurchaseOrderItems,async (req) => {


    console.log('>>> PurchaseOrderItems CREATE/UPDATE triggered');
        const {
            ID,
            prItemNumber,
            parent_ID,
            quantity,
            unitPrice,
            deliveryDate,
            taxRate
        } = req.data;


        // =====================================================
        // GET EXISTING ITEM FOR UPDATE
        // =====================================================

        let existingItem = null;

        if (req.event === 'UPDATE' && ID) {

            existingItem = await SELECT
                .one
                .from(PurchaseOrderItems)
                .where({
                    ID: ID
                });

        }


        // =====================================================
        // MERGE EXISTING VALUES + CHANGED VALUES
        // =====================================================

        const finalPrItemNumber =
            prItemNumber ?? existingItem?.prItemNumber;

        const finalParentID =
            parent_ID ?? existingItem?.parent_ID;

        const finalQuantity =
            quantity ?? existingItem?.quantity;

        const finalUnitPrice =
            unitPrice ?? existingItem?.unitPrice;

        const finalDeliveryDate =
            deliveryDate ?? existingItem?.deliveryDate;

        const finalTaxRate =
            taxRate ?? existingItem?.taxRate ?? 18;


        // =====================================================
        // RULE 3
        // PR ITEM NUMBER MANDATORY
        // =====================================================

        if (!finalPrItemNumber) {

            return req.error(
                400,
                'PR Item Number is mandatory.'
            );

        }


        // =====================================================
        // RULE 3
        // PARENT PO REFERENCE MANDATORY
        // =====================================================

        if (!finalParentID) {

            return req.error(
                400,
                'Purchase Order reference is missing.'
            );

        }


        // =====================================================
        // GET PARENT PO
        // =====================================================

        const po = await SELECT
            .one
            .from(PurchaseOrders)
            .where({
                ID: finalParentID
            });


        if (!po) {

            return req.error(
                404,
                'Parent Purchase Order not found.'
            );

        }


        // =====================================================
        // RULE 8
        // QUANTITY MUST BE GREATER THAN ZERO
        // =====================================================

        if (
            finalQuantity === null ||
            finalQuantity === undefined ||
            Number(finalQuantity) <= 0
        ) {

            return req.error(
                400,
                'PO Quantity must be greater than zero.'
            );

        }


        // =====================================================
        // RULE 10
        // UNIT PRICE MUST BE GREATER THAN ZERO
        // =====================================================

        if (
            finalUnitPrice === null ||
            finalUnitPrice === undefined ||
            Number(finalUnitPrice) <= 0
        ) {

            return req.error(
                400,
                'Unit Price must be greater than zero.'
            );

        }


        // =====================================================
        // RULE 12
        // DEFAULT TAX RATE = 18%
        // =====================================================

        const calculatedTaxRate =
            Number(finalTaxRate);


        // =====================================================
        // RULE 11
        // AUTOMATIC AMOUNT CALCULATION
        // =====================================================

        const netAmount =
            Number(finalQuantity) *
            Number(finalUnitPrice);

        const taxAmount =
            netAmount *
            (calculatedTaxRate / 100);

        const grossAmount =
            netAmount +
            taxAmount;


        req.data.taxRate =
            calculatedTaxRate;

        req.data.netAmount =
            Number(netAmount.toFixed(2));

        req.data.taxAmount =
            Number(taxAmount.toFixed(2));

        req.data.grossAmount =
            Number(grossAmount.toFixed(2));


        // =====================================================
        // RULE 16
        // DELIVERY DATE VALIDATION
        // =====================================================

        if (!finalDeliveryDate) {

            return req.error(
                400,
                `Delivery Date is mandatory for PR Item ${finalPrItemNumber}.`
            );

        }


        if (
            po.poDate &&
            new Date(finalDeliveryDate) <
            new Date(po.poDate)
        ) {

            return req.error(
                400,
                'Delivery Date cannot be earlier than PO Date.'
            );

        }


        // =====================================================
        // RULE 18
        // DUPLICATE PR ITEM IN SAME PO
        // =====================================================

        const duplicateItem = await SELECT
            .one
            .from(PurchaseOrderItems)
            .where({
                parent_ID: finalParentID,
                prItemNumber: finalPrItemNumber
            });


        if (
            duplicateItem &&
            duplicateItem.ID !== ID
        ) {

            return req.error(
                400,
                `PR Item ${finalPrItemNumber} already exists in this Purchase Order.`
            );

        }

    }
);

    // =========================================================
    // SUBMIT PO
    // =========================================================

    this.on('submit', PurchaseOrders, async (req) => {

        const ID = req.params[0].ID;


        const po = await SELECT
            .one
            .from(PurchaseOrders)
            .where({
                ID
            });


        if (!po) {

            return req.error(
                404,
                'Purchase Order not found.'
            );

        }


        if (po.status !== 'Draft') {

            return req.error(
                400,
                `PO can be submitted only from Draft status. Current status: ${po.status}`
            );

        }


        await UPDATE(PurchaseOrders)
            .set({
                status: 'Submitted'
            })
            .where({
                ID
            });


        return 'Purchase Order submitted successfully';

    });


    // APPROVE PO

    this.on('approve', PurchaseOrders, async (req) => {

        const ID = req.params[0].ID;
        const po = await SELECT
            .one
            .from(PurchaseOrders)
            .where({
                ID
            });


        if (!po) {

            return req.error(
                404,
                'Purchase Order not found.'
            );

        }


        if (po.status !== 'Submitted') {

            return req.error(
                400,
                `PO can be approved only from Submitted status. Current status: ${po.status}`
            );

        }


        await UPDATE(PurchaseOrders)
            .set({
                status: 'Approved'
            })
            .where({
                ID
            });


        return 'Purchase Order approved successfully';

    });


    // =========================================================
    // REJECT PO
    // =========================================================

    this.on('reject', PurchaseOrders, async (req) => {

        const ID = req.params[0].ID;
        const po = await SELECT
            .one
            .from(PurchaseOrders)
            .where({
                ID
            });


        if (!po) {

            return req.error(
                404,
                'Purchase Order not found.'
            );

        }


        if (po.status !== 'Submitted') {

            return req.error(
                400,
                `PO can be rejected only from Submitted status. Current status: ${po.status}`
            );

        }


        await UPDATE(PurchaseOrders)
            .set({
                status: 'Rejected'
            })
            .where({
                ID
            });


        return 'Purchase Order rejected';

    });


    // =========================================================
    // CANCEL PO
    // =========================================================

    this.on('cancel', PurchaseOrders, async (req) => {

        const ID = req.params[0].ID;
        const po = await SELECT
            .one
            .from(PurchaseOrders)
            .where({
                ID
            });


        if (!po) {

            return req.error(
                404,
                'Purchase Order not found.'
            );

        }


        if (
            po.status !== 'Draft' &&
            po.status !== 'Submitted'
        ) {

            return req.error(
                400,
                `PO cannot be cancelled from ${po.status} status`
            );

        }


        await UPDATE(PurchaseOrders)
            .set({
                status: 'Cancelled'
            })
            .where({
                ID
            });


        return 'Purchase Order cancelled successfully';

    });

});