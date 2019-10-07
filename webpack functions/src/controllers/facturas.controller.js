const odoo = require('../app/odoo');

class facturasCtrl{

    constructor(){
         this.db = odoo;
        this.fields = ['name', 'account_id', 'amount_total', 'partner_id', 'date_invoice', 'user_id', 'amount_total_signed', 'residual_signed', 'state'];
        }

     getAll(req,res){
     const p = [[[], this.fields,0,15]];
         this.db.search('account.invoice',p)
        .then((result) => { return res.json(result);
        }).catch((err) => {
            return res.json(`${err}`);
        });
    }

     getOne(req,res){
        let id =  parseInt(req.params.id.trim());
        let p = [[[['id', '=', id]], this.fields,0,1]];
     this.db.search('account.invoice',p)
    .then((r)=>{ return res.json(r);    
    }).catch((c) => {
        return res.json(`${c}`);
    });
    }

     edit(req,res){
        let id =  parseInt(req.params.id.trim());
         this.db.update('account.invoice',id,req.body).then((r)=>{
          return res.json(r);
        }).catch((e)=>{
            return res.json(`${e}`);
         });
    }

     delete(req,res){
        let id =  parseInt(req.params.id.trim());
     this.db.borrar('account.invoice',id).then((r)=>{
       return res.json(r);
    }).catch((e)=>{ 
        return res.json(`${e}`);
     });
    }

     create(req,res){
 //generateInvoice(user, cantidad, isFiscal, partnerId, precio, productId, state, shop_id, payment_term_id, fiscal_position_id)    
        this.db.generateInvoice(1, req.body.quantity,req.body.fiscal, 194, req.body.amount_total_signed, req.body.product_id,req.body.state).then((r) => {
       
            return res.json({ id: r });
        }).catch((e) => {
            return res.json(`${e}`);
        });
    }
}

module.exports = facturasCtrl;

