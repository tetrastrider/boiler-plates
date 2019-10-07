const odoo = require('../app/odoo');

class clienteCtrl{

    constructor(){ 
        this.db = odoo;
        this.fields = ['name', 'email', 'phone', 'street', 'city', 'supplier', 'customer', 'website', 'category_id', 'mobile', 'title', 'function'];
     }
   
    getAll(req,res){
     const p = [[[], this.fields,0,15]];
       this.db.search('res.partner',p)
        .then((result) => { return res.json(result);
        }).catch((err) => {
            return res.json(`${err}`);
        });
    }

    getOne(req,res){
        let id =  parseInt(req.params.id.trim());
        let p = [[[['id', '=', id]], this.fields,0,1]];
    this.db.search('res.partner',p)
    .then((r)=>{ return res.json(r);    
    }).catch((c) => {
        return res.json(`${c}`);
    });
    }

     edit(req,res){
        let id =  parseInt(req.params.id.trim());
         this.db.update('res.partner',id,req.body).then((r)=>{
          return res.json(r);
        }).catch((e)=>{
            return res.json(`${e}`);
         });
    }

     delete(req,res){
        let id =  parseInt(req.params.id.trim());
     this.db.borrar('res.partner',id).then((r)=>{
        return res.json(r);
    }).catch((e)=>{
  
        return res.json(`${e}`);
     });
    }

     create(req,res){
        this.db.create('res.partner',req.body).then((r)=>{
         return res.json({id:r});
       }).catch((e) => {
           return res.json(`${e}`);
     });
    }
}

module.exports = clienteCtrl;


