const functions = require('firebase-functions');

const express = require('express');

const app = express();

const router = express.Router();

const compression = require('compression');

const helmet = require('helmet');

const morgan = require('morgan');

const cors = require('cors');

const fastXmlParser = require('fast-xml-parser');

const activadores = require('./components/activadores');

const azul = require('./components/azul');

const popular = require('./components/popular');

const fire = require('./app/firebase');
//
const corsOptions = {origin:true,optionsSuccessStatus: 200};
// END REQUIRE
app.use(morgan('dev'));
router.use(helmet());
router.use(compression()); // Compress all routes
router.use(express.json()); // RECIBIR JSON
router.use(express.urlencoded({extended:false})); // RECIBIR DATOS DESDE FORMULARIOS
router.use(cors(corsOptions)); // USAR CROSS ORIGIN RESPONSE

// RUTAS WEB
router.use('/api/clientes', require('./route/clientes.routes'));
router.use('/api/Facturas', require('./route/facturas.routes'));
router.use('/api/recibos', require('./route/recibos.routes'));
router.use('/api/otras',require('./route/other'));
//RUTAS APP
// Rewrite Firebase hosting requests: /pp/:path => /:path
app.use((req, res, next) => {
    console.log(`Request URL ${req.url}`);
    if (req.url.indexOf('/pp/') === 0) {
        req.url = req.url.substring('pp'.length + 1);
    }
    next();
});

//POPULAR MPOUT
app.post('/mpout', (req, resp) => {

    console.log(`MPOUT body: ${JSON.stringify(req.body)}`);

    const doc = fastXmlParser.parse(req.body.mensaje);
    
    return fire.createId('mpout', String(doc.MPOUT.IDTRX), doc).then(() => popular.validateMpout(req.body)).then((isValid) => {
            resp.setHeader('Content-Type', 'text/xml');
            const parser = new fastXmlParser.j2xParser();
            const payload = parser.parse({ NOTIFICA: isValid ? 'OK' : 'ERROR' });
            return resp.send(payload);
        });
});

//POPULAR MPFIN
app.post('/mpfin', (req, resp) => {
    console.log(`MPFIN received: ${JSON.stringify(req.body)}`);

    const doc = fastXmlParser.parse(req.body.MPFIN);

    return fire.createId('mpfin', String(doc.MPFIN.IDTRX), doc).then(() => {
            resp.setHeader('Content-Type', 'text/xml');
            const parser = new fastXmlParser.j2xParser();
            const payload = parser.parse({ NOTIFICA: 'OK' });
            return resp.send(payload);
        });
});

//AZUL
app.get('/azul/approve', (req, resp) => {
    console.log(`Azul aproval received: ${JSON.stringify(req.query)}`);

    // TODO hash verification:
    // OrderNumber + Amount + AuthorizationCode + DateTime 
    // + ResponseCode + ISOCode + ResponseMessage + ErrorDescription + RRN + AuthKey

    const orderId = req.query.CustomField2Value;
    
    return fire.createId('AzulPayments', orderId, { aproved: true }).then((val) => resp.send(200, 'OK'));
});

//AZUL
app.get('/azul/cancel', (req, resp) => {
    console.log(`Azul cancel received: ${JSON.stringify(req.query)}`);

    // TODO hash verification:
    // OrderNumber + Amount + AuthorizationCode + DateTime 
    // + ResponseCode + ISOCode + ResponseMessage + ErrorDescription + RRN + AuthKey

    const orderId = req.query.CustomField2Value;

    return fire.createId('AzulPayments', orderId, { aproved: false }).then((val) => resp.send(200, 'OK'));
});

//AZUL
app.get('/azul/decline', (req, resp) => {
    console.log(`Azul decline received: ${JSON.stringify(req.query)}`);

    // TODO hash verification:
    // OrderNumber + Amount + AuthorizationCode + DateTime 
    // + ResponseCode + ISOCode + ResponseMessage + ErrorDescription + RRN + AuthKey

    const orderId = req.query.CustomField2Value;

    return fire.createId('AzulPayments', orderId, { aproved: false }).then((val) => resp.send(200, 'OK'));
});

//POPULAR
app.post('/mpini', popular.paymentHandler);



//ODOO SERVICE
exports.odooService = functions.https.onRequest(router);
//LLAMADA POPULAR
exports.mpini = functions.https.onCall(popular.llamadaPopular);
//LLAMADA AZUL
exports.azulHash = functions.https.onCall(azul.llamadaAzul);
//EXPORT TO FIREBASE
exports.pp = functions.https.onRequest(app);

// ACTIVADORES
exports.onGenerateExtraCharge = functions.firestore.document('jobs/{jobId}/extras/{extraId}').onCreate((snap, context) => {
   activadores.extracharge(snap, context);
});

exports.onCreateJob = functions.firestore.document('jobs/{jobId}').onCreate((snap, context) => {
    activadores.createjob(snap, context);
    });

exports.onAssignProvider = functions.firestore.document('jobs/{jobId}').onUpdate((change, context) => {
    activadores.assignprovider(change, context);
    });

exports.onClosedJob = functions.firestore.document('jobs/{jobId}').onUpdate((change, context) => {
    activadores.closedjob(change, context);
    });

 exports.createOdooPartner = functions.firestore.document('users/{userId}').onCreate((snap, context) => {
        activadores.createodoopartner(snap, context);
    });