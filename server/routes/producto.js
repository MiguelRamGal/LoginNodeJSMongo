const express = require('express')
const autenticacionToken = require('../middlewares/autenticacion')
let app = express()
let productoModel = require('../models/producto')

//=======================================
//OBTENER LOS PRODUCTOS
//=======================================
app.get('/productos', (req, res) => {
    //populate: usuario categoria
    //paginado
    let desde = req.query.desde || 0
    desde = Number(desde)
    let limite = req.query.limite || 5
    limite = Number(limite)

    productoModel.find({disponible:true})
    .populate('usuario', 'nombre email')
    .populate('cateoria', 'descripcion')
    .skip(desde)
    .limit(limite)
    .exec((err,productos)=>{
        if(err){
            return res.status(400).json({
                ok:false,
                err
            })
        }else{
            res.json({
                ok: true,
                info: productos
            })
        }
    })
})

//=======================================
//OBTENER UN PRODUCTO POR ID
//=======================================
app.get('/productos/:id', autenticacionToken.verificaToken, (req, res) => {
    //populate: usuario categoria
    let id = req.params.id

    productoModel.findById(id)
    .populate('usuario', 'nombre email')
    .populate('cateoria', 'descripcion')
    .exec((err, respuesta) =>{
        if(err){
            return res.status(500).json({
                ok:false,
                err
            })
        }

        if(!respuesta){
            return res.status(400).json({
                ok:false,
                err:"No existe el id"
            })
        }

        res.json({
            ok:true,
            producto: respuesta
        })

    })
})


//=======================================
//CREAR UN PRDUCTO
//=======================================
app.post('/productos', autenticacionToken.verificaToken, (req, res) => {
    let info = req.body
    let producto = new productoModel({
        nombre: info.nombre,
        precioUni: info.precioUni,
        descripcion: info.descripcion,
        disponible: info.disponible,
        categoria: info.categoria,
        usuario: req.usuario._id
    })

    producto.save( (err, respuInsert) => {
        if(err){
            return res.status(400).json({
                ok:false,
                err
            })
        }
        
        res.json({
            ok: true,
            producto: respuInsert
        })
    })
})

//=======================================
//ACTUALIZAR UN PRDUCTO
//=======================================
app.put('/productos/:id', (req, res) => {
    //grabar el usuario
    //grabar una categoría del listado
    let id = req.params.id
    let info = req.body

    let objectUpdate = {
        nombre: info.nombre,
        precioUni: info.precioUni,
        descripcion: info.descripcion,
        categoria: info.categoria
    }

    productoModel.findByIdAndUpdate(id, objectUpdate, {new: true, runValidators: true}, (err, respuesta)=>{
        if(err){
            return res.status(500).json({
                ok:false,
                err
            })
        }
        
        if(!respuesta){
            return res.status(400).json({
                ok:false,
                err:"No existe el producto"
            })
        }

        res.json({
            ok:true,
            producto: respuesta
        })
    })
})

//=======================================
//ELIMINAR UN PRDUCTO
//=======================================
app.delete('/productos/:id', (req, res) => {
    //cambiar estatus: disponnible
    let id = req.params.id
    let info = req.body
    
    let objectUpdate = {
        disponible: info.disponible
    }

    productoModel.findById(id, (err, productoDB)=>{
        if(err){
            return res.status(500).json({
                ok:false,
                err
            })
        }
        
        if(!productoDB){
            return res.status(400).json({
                ok:false,
                err:"No existe el producto"
            })
        }

        productoDB.disponible = false

        productoDB.save((err, productoEliiminado)=>{
            if(err){
                return res.status(500).json({
                    ok:false,
                    err
                })
            }

            res.json({
                ok:true,
                producto: productoEliiminado,
                mensaje: "Producto eliminado"
            })
        })
    })

})

//=======================================
//BUSCAR PRODUCTOS
//=======================================
app.get('/productos/buscar/:termino', autenticacionToken.verificaToken, (req, res) => {

    let termino = req.params.termino

    let regex = new RegExp(termino, 'i')//Esto me permite realizar una busqueda como si fuera un LIKE %%, la letra i me sirve para que ignore las mayúsculas  y minusculas

    productoModel.find({ nombre: regex })
    .populate('categoria', 'nombre')
    .exec( (err, productos) => {
        if(err){
            return res.status(500).json({
                ok:false,
                err
            })
        }

        res.json({
            ok: true,
            productos
        })
    })
})


module.exports = app