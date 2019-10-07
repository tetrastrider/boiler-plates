const fire = require('../app/firebase');

const pn = require('./push-notifications');

const pusher = new pn.PushNotifications(fire.admin.messaging());

const odoo = require('../app/odoo');

// ACTIVADORES
exports.extracharge =(snap,context) => {

        const data = {
            jobId: context.params.jobId,
            extraChargeId: context.params.extraId,
            message: "Un cargo extra en camino",
            title: "Cargo extra pedido",
            messageType: "requestedExtraCharge"
        }

        const jobC = fire.byId('jobs', context.params.jobId);
        return jobC.then((jobSnap) => {
            const job = jobSnap.data();
            console.log(`Extra charge for doc: ${JSON.stringify(job)}`);
            data['img'] = job.category.localImg;
            return pusher.send(`users_${job.user.id}_extracharges`, data);
        });

    };

exports.createjob = (snap, context) => {

    const newJob = snap.data();

    const data = {
        jobId: context.params.jobId,
        message: "Nuevo trabajo pedido",
        title: "Trabajo pedido",
        messageType: "requestedJob",
        img: newJob.category.localImg
    }

    return pusher.send(`category_${newJob.category.id}`, data);

};

exports.assignprovider = (change, context) => {

    const newData = change.after.data().provider;
    const prevData = change.before.data().provider;

    if (prevData.id === "" && newData !== null) {
        const data = {
            jobId: context.params.jobId,
            providerId: newData.id,
            message: "Trabajo tomado",
            title: "Trabajo tomado mensaje",
            messageType: "takenJob"
        }

        const jobC = fire.byId('jobs',context.params.jobId);

        return jobC.then((jobSnap) => {
            const job = jobSnap.data();
            data['img'] = job.category.localImg;
            return pusher.send(`users_${job.user.id}_jobs`, data);
        });
    }

    return null;

};

exports.closedjob = (change, context) => {

        const newState = change.after.data().state;
        const prevState = change.before.data().state;

        if (prevState === "completed" && newState === "closed") {
            const data = {
                jobId: context.params.jobId,
                providerId: newData.id,
                message: "Trabajo Concluido",
                title: "Trabajo concluido mensaje",
                messageType: "closedJob"
            }

            const jobC = fire.byId('jobs',context.params.jobId);

            return jobC.then((jobSnap) => {
                const job = jobSnap.data();
                data['img'] = job.category.localImg;
                return pusher.send(`users_${job.user.id}_jobs`, data);
            });
        }

        return null;

    };

exports.createodoopartner = (snap, context) => {
   
         const newUser = snap.data();

        return odoo.createUser(newUser).then((partnerId) => {
                if(partnerId !== undefined) {
                    return snap.ref.set({ partnerId: partnerId }, { merge: true });
                } else {
                   return console.log('usuario no creado');
                }
            }); 
    };