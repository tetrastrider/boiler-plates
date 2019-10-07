/* eslint-disable promise/no-nesting */
const moment = require('moment');
const firebase = require('../app/firebase');
const Odoo = require('odoo-xmlrpc');
const cred =firebase.byId('secrets','odoo');

class odooclass{

    constructor(){ 
        cred.then((t)=>{
       return  this.db = new Odoo(t.data());
        }).catch((e)=>{
            return new Error(e);
        });


     }

    connect(cb){ this.db.connect(err=>{ if (err) { return console.log(err); } }); cb }

     search(modelo,busqueda){
        return new Promise((resolve,reject)=>{ 
        this.db.connect((err)=>{if (err) { return console.log(err); }
        this.db.execute_kw(modelo,'search_read',busqueda,(e,v)=>{ if(e){ reject(e); } resolve(v);  });   
        });
    });        
    }
    
    read(model){
        return new Promise((resolve,reject)=>{ 
        this.db.connect((err)=>{if (err) { return console.log(err); }
            const con = this.db;
            con.execute_kw(model,'search',[[[],0,1]],(e,ids)=>{ if(err){ return console.log(e); }//[[value]]
                 con.execute_kw(model,'read',[[ids]],(e2, v2)=>{ if(e2){ return console.log(e2); } return v2; }); 
            });
        });
    });
    }

    byId(model,id){
        return new Promise((resolve,reject)=>{ 
        this.db.connect((err)=>{if (err) { return console.log(err); }
        this.db.execute_kw(model,'read',[[id]],(e,v)=>{ if(e){ reject(e); } resolve(v); });
        });
        });
    }

    borrar(model,id){
        return new Promise((resolve,reject)=>{ 
            this.db.connect((err)=>{if (err) { return console.log(err); }
            this.db.execute_kw(model,'unlink',[[[id]]],(e,v)=>{ if(e){ reject(e); } resolve(v);  });
        });
    });
    }


    create(model,p){
        return new Promise((resolve,reject)=>{ 
        this.db.connect((err)=>{if (err) { return console.log(err); }
        return this.db.execute_kw(model,'create',[[p]],(e,v)=>{ if(e){ reject(e); } resolve(v); console.log(v) });
        });
        });
    }

    update(model,id,obj){
        return new Promise((resolve,reject)=>{ 
        this.db.connect((err)=>{if (err) { return console.log(err); }
        this.db.execute_kw(model,'write',[[[id],obj]],(e,v)=>{ if(e){ reject(e); } resolve(v);  });
        });
    });
    }

    getMany2OneId(row, prop) {
        const propIdName = row[prop] || [];
        return propIdName[0];
    }

    createUser(user) {

        const isSupplier = user.userType === 'supplier';

        const row = {
            name: user.name,
            street: user.street | 'N/A',
            city: user.city || 'NA',
            phone: user.phone,
            email: user.email,
            supplier: isSupplier,
            customer: !isSupplier
        };

        return this.create('res.partner', row);

    }

    getProduct(defaultCode) {

        const params = [[[['default_code', '=', defaultCode]], ['property_account_income_id', 'taxes_id', 'name', 'price'], 0, 1]];


        return this.search('product.template', params).then((t) => t).catch((c) => c);


    }

    getReceivingPartnerAccountId(partnerId) {

        const params = [[[['id', '=', partnerId]], ['property_account_receivable_id'], 0, 1]];

        const partnerAccountReceivableIdP = this.search('res.partner', params)
            .then((partnerRows) =>
                this.getMany2OneId(partnerRows[0], 'property_account_receivable_id'));

        return partnerAccountReceivableIdP;
    }

    generateInvoice(user, _cantidad, _isFiscal, partnerId, precio, productId, _state, _shop_id, _payment_term_id, _fiscal_position_id) {

        const productP = this.getProduct(productId);

        const accountIdP = this.getReceivingPartnerAccountId(partnerId);

        const state = _state ? _state : 'proforma';

        const fiscal_position_id = _fiscal_position_id ?_fiscal_position_id: 2;

        const payment_term_id = _payment_term_id ? _payment_term_id : 1;

        const shop_id = _shop_id ?_shop_id: 1;

        const isFiscal = _isFiscal ? 'fiscal' : 'final';

        const cantidad = _cantidad ?_cantidad: 1;

        return Promise.all([accountIdP, productP])
            .then(([ac, p]) => {

                const product = p[0];

              return  this.create('account.invoice', {
                    'name': product['name'],
                    'partner_id': partnerId,
                    'account_id': ac,
                    'date_invoice': moment().format('YYYY-MM-DD'),
                    'product_id': product.id,
                    'sale_fiscal_type': isFiscal,
                    'fiscal_position_id': fiscal_position_id,
                    'shop_id': shop_id,
                    'user_id': user,
                    'payment_term_id': payment_term_id,
                    'state': state,
                    'date_due': moment().format('YYYY-MM-DD')
                })
                    .then((t) => {
                     
                           
                        
                       this.create('account.invoice.line', {
                            'product_id': product.id,
                            'quantity': cantidad,
                            'price_unit': precio,
                            'account_id': product['property_account_income_id'][0],// account,
                            'invoice_id': t,
                            'name': product['name'],
                            'invoice_line_tax_ids': [6, false, product.taxes_id[0]],
                        })
                            .then((t) => t)
                            .catch((c) => console.log(c));

                        return t;  
                    })
                    .catch((c) => console.log(c));

            });
    }

   

}


module.exports = odoo = new odooclass;


