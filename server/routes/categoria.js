const express = require('express')
const autenticacionToken = require('../middlewares/autenticacion')//Importo el archivo de autenticación
const app = express();
let categoriaModel = require('../models/categoria')


//===================================
//MOSTRAR TODAS LAS CATEGORIAS
//===================================
app.get('/categoria', autenticacionToken.verificaToken, (req, res)=>{
    
    categoriaModel.find({})
        .sort('descripcion') //SORT me permite ordenar la información en base a un campo
        .populate('usuario','nombre email')//Revisa que id existe y me permite obtener la información, basicamente este es como si hiciera un INNER JOIN, 
                            //y al poner usuario, digo que me traiga la información, que hace FOREIGN KEY con el campo de Usaurio, por lo cual trae toda su información, 
                            //el primer parametro es el nombre del campo que hace FOREIGN KEY  a la tabla, el segundo parametro son los campos que quiero obtener,
                            //si deseo todos los campos, este aprametro no lo obtengo
                            //NOTA: EL ID SIEMPRE LO OBTIENE AUNQUE NO LO SOLICITE EN LOS PARAMETROS
        .exec((err, categorias) => {
        //Si existe un error lo regreso
        if(err){
            return res.status(500).json({
                ok:false,
                err
            })
        }else{
            res.json({ 
                ok: true,
                categorias
            })
        }
    })
})

//===================================
//MOSTRAR UNA CATEGORIA POR ID
//===================================
app.get('/categoria/:id', autenticacionToken.verificaToken, (req, res)=>{
    
    let id = req.params.id;

    categoriaModel.findById(id, (err,respuCategoria) => {
        if(err){
            return res.status(500).json({
                ok:false,
                err
            })
        }

        if(!respuCategoria){
            return res.status(400).json({
                ok:false,
                err: {
                    message: "El id no existe"
                }
            })
        }

        res.json({
            ok: true,
            categoria: respuCategoria
        })
    


    })
    
})

//===================================
//CREAR CATEGORIA
//===================================
app.post('/categoria',autenticacionToken.verificaToken,(req, res)=>{
    //REGRESA LA CUEVA CATEGORIA
    let info = req.body;

    let categoria = new categoriaModel({
        descripcion: info.descripcion,
        usuario: req.usuario._id
    })

    categoria.save( (err, categoriaRespu) => {
        if(err){
            return res.status(500).json({
                ok:false,
                err
            })
        }
        
        if(!categoriaRespu){
            return res.status(400).json({
                ok:false,
                err
            })
        }

        res.json({
            ok:true,
            categoria: categoriaRespu
        })

    } )
})

//===================================
//MODIFICA UNA CATEGORIA
//===================================
app.put('/categoria/:id',(req, res)=>{
    //REGRESA LA CUEVA CATEGORIA

    let id = req.params.id;
    let info = req.body;

    let newInfo = {
        descripcion: info.descripcion
    }

    categoriaModel.findByIdAndUpdate(id, newInfo, {new: true, runValidators: true}, (err, respuCategoria) => {
        
        if(err){
            return res.status(500).json({
                ok:false,
                err
            })
        }
        
        if(!respuCategoria){
            return res.status(400).json({
                ok:false,
                err
            })
        }

        res.json({
            ok:true,
            categoria: respuCategoria
        })

    })
})


//===================================
//ELIMINA UNA CATEGORIA
//===================================
app.delete('/categoria/:id', [autenticacionToken.verificaToken, autenticacionToken.verificaAdministrador],(req, res)=>{
    let id = req.params.id;

    categoriaModel.findByIdAndDelete(id, (err, respuCategoria) => {
        if(err){
            return res.status(500).json({
                ok:false,
                err
            })
        }
        
        if(!respuCategoria){
            return res.status(400).json({
                ok:false,
                err:{
                    message: "El id no existe"
                }
            })
        }

        res.json({
            ok:true,
            message: "Categoría borrada"
        })
    })
})


module.exports = app;