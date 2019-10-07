const PushNotifications = function(messaging) {

    const prepareMessage = (topic, payload) => {
        let message = {
            topic: topic,
            android: {
                data: payload
            },
            apns: {
              payload: {
                aps: {
                    alert : {
                       title : payload.title,
                       body : payload.message
                    }
                 }
              }
            }
          };
        return message;
    }
    
    const send = (topic, snapshot) => {
        const msg = prepareMessage(topic, snapshot);
        return messaging.send(msg);
    };


    this.send = send;
};

exports.PushNotifications = PushNotifications;