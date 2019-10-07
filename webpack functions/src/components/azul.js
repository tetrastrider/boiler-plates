const functions = require('firebase-functions');
const crypto = require('crypto');
const fire = require('../app/firebase');

//AZUL
exports.llamadaAzul = (data, context) => {

    if (data.amount === undefined || data.description === undefined || data.isFiscal === undefined) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields (amount, description, isFiscal).');
    }

    // AzulPaymentId
    const ref = fire.ref('AzulPayments').doc();

    const merchantId = '39325170017';
    const merchantName = 'GoodJob';
    const merchantType = 'sale';
    const currencyCode = '$';
    const orderNumber = ref.id.substring(0, 10);
    const amount = parseInt(data.amount * 100).toString(); // Prevent decimal
    const itbis = '000';
    const approvedUrl = 'https://us-central1-goodjob-development.cloudfunctions.net/pp/azul/approve/';
    const declinedUrl = 'https://us-central1-goodjob-development.cloudfunctions.net/pp/azul/decline/';
    const cancelUrl = 'https://us-central1-goodjob-development.cloudfunctions.net/pp/azul/cancel/';
    const responsePostUrl = '';
    const useCustomField1 = 1;
    const customField1Label = 'Servicio';
    const customField1Value = data.description;
    const useCustomField2 = 1;
    const customField2Label = 'paymentId';
    const customField2Value = ref.id;
    const savetodatavault = 1;

    const secretPromise = fire.byId('secrets','azul-secret');

    return secretPromise.then((key) => {
        if (key === null) {
            console.log("ERROR: Azul Key shouldn't be null");
            return Promise.reject(new functions.https.HttpsError("Azul Key shouldn't be null"));
        }

        const authKey = key.data().secret;

        const concatFields =
            merchantId
            + merchantName
            + merchantType
            + currencyCode
            + orderNumber
            + amount
            + itbis
            + approvedUrl
            + declinedUrl
            + cancelUrl
            + responsePostUrl
            + useCustomField1.toString()
            + customField1Label
            + customField1Value
            + useCustomField2.toString()
            + customField2Label
            + customField2Value
            + authKey;

        const authHash = crypto.createHmac('sha512', authKey).update(concatFields).digest('hex');

        console.log(`Generated Azul payment Id: ${ref.id}\nWith key: ${authKey}\nWith AuthHash: ${authHash}`);

        return {
            AuthHash: authHash,
            MerchantId: merchantId,
            MerchantName: merchantName,
            MerchantType: merchantType,
            CurrencyCode: currencyCode,
            OrderNumber: orderNumber,
            Amount: amount,
            ITBIS: itbis,
            ApprovedUrl: approvedUrl,
            DeclinedUrl: declinedUrl,
            CancelUrl: cancelUrl,
            UseCustomField1: useCustomField1,
            CustomField1Label: customField1Label,
            CustomField1Value: customField1Value,
            UseCustomField2: useCustomField2,
            CustomField2Label: customField2Label,
            CustomField2Value: customField2Value,
            SaveToDataVault: savetodatavault,
        };
    });
}