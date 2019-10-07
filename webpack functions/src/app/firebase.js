const functions = require('firebase-functions');
const admin = require("firebase-admin");

  class Database{

    constructor(){
      
    
      this.admin = admin.initializeApp(functions.config().firebase);
      this.data = admin.firestore();
      this.data.settings({});
       
    }

    delete(dir,i){this.data.collection(dir).doc(i).delete();}

    readAll(dir){ return this.data.collection(dir).get(); }

    create(dir,query){

        this.data.collection(dir).data(query,
            e=>{ if(e){console.log("error creando la transaccion"); }else{console.log("transaccion realizada con exito"); } });

    }

    createId(d,i,q){ this.data.collection(d).doc(i).set(q,
            e=>{ if(e){console.log("error creando la transaccion"); }else{console.log("transaccion realizada con exito"); } }) }

    byId(d,i){
        
        return this.data.collection(d).doc(i).get();
    
    }

    ref(dir) { return this.data.collection(dir).doc(); }

    update(d,i,q){ this.data.collection(d).doc(i).update(q); }


}


module.exports = DB = new Database;