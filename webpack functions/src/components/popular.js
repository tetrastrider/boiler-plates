const functions = require('firebase-functions');
const crypto = require('crypto');
const fastXmlParser = require('fast-xml-parser');
const fire = require('../app/firebase');

//POPULAR
const createShittyHalfAssedSignature = (payload, key) => {

    const hmac = crypto.createHmac('sha512', key).update(payload).digest('hex');

    return Buffer.from(hmac).toString('base64');

};

//POPULAR
exports.validateMpout = (data) => {

    const mpoutXml = data.mensaje;

    const signature = data['amp;firma'];

    const secretPromise = fire.byId('secrets', 'bdpp');

    return secretPromise
        .then((key) => {
            if (key === null) {
                console.log("ERROR: Key shouldn't be null");
                return Promise.reject(new Error('Key shouldnt be null.'));
            }
            ////////////////////////////
            const hmac = crypto.createHmac('sha512', key.data().secret).update(mpoutXml).digest('hex');

            return hmac === signature;
            //////////////////////
        });
};

//POPULAR
const createPaymentRequest = (transactionId, amount, description, isFiscal) => {

    const payload = {
        MPINI: {
            CNV: 389, // Identificador asignado para el convenio establecido.
            REC: 'BCO-POP',
            TRX: transactionId,
            TOT: amount,
            MDA: 'DOP',
            NROPGO: 1,
            CARRO: {

                DET: {
                    NRO: 1,
                    PRE: amount,
                    MTO: amount,
                    GLS: `PAGO GOODJOB`,
                    ADI: 'NINGUNA'
                }
            }

        }
    };

    const secretPromise = fire.byId('secrets', 'bdpp');

    return secretPromise.then((key) => {
        if (key === null) {
            console.log("ERROR: Key shouldn't be null");
            return Promise.reject(new Error('Key shouldnt be null.'));
        }
        const parser = new fastXmlParser.j2xParser();

        const signature = createShittyHalfAssedSignature(parser.parse(payload), key.data().secret);

        Object.assign(payload, { firma: signature });

        const enveloment = parser.parse({ enveloment: payload });

        const encodedEnveloment = Buffer.from(enveloment).toString('base64');

        return {
            transactionId: transactionId,
            encoded: encodedEnveloment,
            xml: enveloment,
            description: description,
            isFiscal: isFiscal
        };
    });

};

//POPULAR
exports.paymentHandler = (req, resp) => {

    const data = req.body;

    if (data.amount === undefined || data.description === undefined || data.isFiscal === undefined) {
        resp.status(400);
        resp.setHeader('Content-Type', 'application/json');
        return resp.send(JSON.stringify({ error: 'Missing required fields (amount, description, isFiscal)' }));
    }

    const ref = fire.ref('mpini');

    // Prepare MPINI and data to be stored in the database
    const paymentRequestPromise = createPaymentRequest(ref.id, data.amount, data.description, data.isFiscal);

    // Made this way because the payment request should be set and correctly created before being sent to the browser
    return paymentRequestPromise
        .then((pr) => ref.set(pr).then(() => pr) )
        .then((pr) => {
            resp.setHeader('Content-Type', 'application/json');
            return resp.send(JSON.stringify(pr));
        });
};
//POPULAR
exports.llamadaPopular = (data, context) => {
    if (data.amount === undefined || data.description === undefined || data.isFiscal === undefined) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields (amount, description, isFiscal).');
    }

    const ref = fire.ref('mpini');

    // Prepare MPINI and data to be stored in the database
    const paymentRequestPromise = createPaymentRequest(ref.id, data.amount, data.description, data.isFiscal);

    // Made this way because the payment request should be set and correctly created before being sent to the browser
    return paymentRequestPromise
        .then((pr) => ref.set(pr).then(() => pr) )
        .catch((error) => {
            throw new functions.https.HttpsError('unknown', error.message, error);
        });
}

