const odoo = require('../app/odoo');

class recibosCtrl{

    constructor() {
       
        this.db = odoo;
        this.fields = ['payment_date', 'name', 'journal_id','payment_method_id','partner_id','amount','state'];
     }

  getAll(req,res){
        const p = [[[],this.fields,0,15]];
         this.db.search('account.payment',p)
        .then((result) => { return res.json(result);
        }).catch((err) => {
            return res.json(`${err}`);
        });
    }

    getOne(req,res){
        let id =  parseInt(req.params.id.trim());
     let p = [[[['id','=',id]],this.fields,0,1]];
     this.db.search('account.payment',p)
    .then((r)=>{ return res.json(r);    
    }).catch((c) => {
        return res.json(`${c}`);
    });
    }

     edit(req,res){
        let id =  parseInt(req.params.id.trim());
         this.db.update('account.payment',id,req.body).then((r)=>{
          return res.json(r);
        }).catch((e)=>{
            return res.json(`${e}`);
         });
    }

     delete(req,res){
        let id =  parseInt(req.params.id.trim());
     this.db.borrar('account.payment',id).then((r)=>{
       return res.json(r);
    }).catch((e)=>{ 
        return res.json(`${e}`);
     });
    }

     create(req,res){
        this.db.create('account.payment',req.body).then((r)=>{
           return res.json({ id: r });
       }).catch((e) => {
           return res.json(`${e}`);
     });
    }
}

module.exports = recibosCtrl;

