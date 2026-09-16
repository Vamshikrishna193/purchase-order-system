const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {

    const { PurchaseOrders } = this.entities;
    const { PONumberCounter } = cds.entities('db');

    this.before('CREATE', PurchaseOrders, async (req) => {

        const currentYear = new Date().getFullYear();

        let counter = await SELECT.one
            .from(PONumberCounter)
            .where({
                year: currentYear
            });

        // First PO of the year
        if (!counter) {

            await INSERT.into(PONumberCounter).entries({
                year: currentYear,
                lastNumber: 1
            });

            counter = {
                year: currentYear,
                lastNumber: 1
            };

        }

        // Next PO of the year
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


        // Generate PO Number
        req.data.poNumber =
            `PO-${currentYear}-${String(counter.lastNumber).padStart(6, '0')}`;


        // Default status
        req.data.status = 'Draft';


        // PO Date
        if (!req.data.poDate) {
            req.data.poDate = new Date().toISOString().split('T')[0];
        }

    });


    this.on('submit', PurchaseOrders, async (req) => {

        const ID = req.params[0].ID;

        const po = await SELECT.one
            .from(PurchaseOrders)
            .where({ ID });


        if (!po) {
            return req.error(404, 'Purchase Order not found');
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
            .where({ ID });


        return 'Purchase Order submitted successfully';

    });


    this.on('approve', PurchaseOrders, async (req) => {

        const ID = req.params[0].ID;

        const po = await SELECT.one
            .from(PurchaseOrders)
            .where({ ID });


        if (!po) {
            return req.error(404, 'Purchase Order not found');
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
            .where({ ID });


        return 'Purchase Order approved successfully';

    });


    this.on('reject', PurchaseOrders, async (req) => {

        const ID = req.params[0].ID;

        const po = await SELECT.one
            .from(PurchaseOrders)
            .where({ ID });


        if (!po) {
            return req.error(404, 'Purchase Order not found');
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
            .where({ ID });


        return 'Purchase Order rejected';

    });


    this.on('cancel', PurchaseOrders, async (req) => {

        const ID = req.params[0].ID;

        const po = await SELECT.one
            .from(PurchaseOrders)
            .where({ ID });


        if (!po) {
            return req.error(404, 'Purchase Order not found');
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
            .where({ ID });


        return 'Purchase Order cancelled successfully';

    });

});