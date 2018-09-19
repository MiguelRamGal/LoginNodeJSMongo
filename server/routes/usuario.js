const express = require('express')//Instancio mi librería express
const bcrypt = require('bcrypt')//Hago referencia a bcrypt
const underscore = require('underscore')//Importo el underscore
const usuarioModel = require('../models/usuario')//Hago referencia a mi modelo de usuario


const app = express()//Configuro mi express


//Hago una peticion GET ayuda a modificar data
app.get('/usuario', function (req, res) {
    
    let desde = req.query.desde || 0;//Los elementos opcionales (tipo GET url?desde=10) se guadan en req.query, si hay un valor lo guardo si no pongo desde 0
    desde = Number(desde)//Lo converto en un número

    let limite = req.query.limite || 5;
    limite = Number(limite);

    //De esta forma obtengo todos la información de mi colección usuario
    usuarioModel.find({estado:true},'nombre email role estado google img')//Este es el find en lo que elijo que quiero mostrar al usuario
    //usuarioModel.find({})//Este es el Find normal
    .skip(desde)//Esto ayuda a saltar los primeros 5 registros
    .limit(limite)//Pongo un limite de 5 registros
    .exec((err, usuarios) => {
        //Si existe un error lo regreso
        if(err){
            return res.status(400).json({
                ok:false,
                err
            })
        }else{
            //Si no existe un error muestro la info, en las llaves se pone algun filtr como google:true etc, significa que google sea igual a true
            //usuarioModel.count({}, (error,conteo)=>{//De esta forma cuento el total de registros
            usuarioModel.count({estado:true}, (error,conteo)=>{//De esta forma cuento el total de registros
                res.json({
                    ok:true,
                    totalRegistros: conteo,
                    usuarios
                });
            })
        }
    })

})

//Hago una peticion POST ayuda a crear data
app.post('/usuario', function (req, res) {
    
    let info = req.body;//De esta forma obtengo la data de tipo post
    
    //Intancio mi modelo de usuario, y le paso los parametros de mi POST
    let usuario = new usuarioModel({
        nombre: info.nombre,
        email: info.email,
        password: bcrypt.hashSync(info.password, 10),//De esta forma encripto un texto
        role: info.role
    });

    //Guardo mi objeto en mi colección con save y me regresa una promesa
    usuario.save( (error, respuestaUsuario) => {
        if(error){//Comparo si hay un errpr
            //Si hay un error lo regreso
            return res.status(400).json({
                ok:false,
                err:error
            })
        }else{
            //Si no exite un error imprimo
            res.json({
                ok:true,
                usuario: respuestaUsuario
            })
        }
    })
})

//Hago una peticion PUT ayuda a modificar data
//Con este código indico /usuario/:id que si la url acontinuacioón viene con un valo por ejemplo /usuario/sdfsdfsdfsdf
//a ese valor le daré la variable de id
app.put('/usuario/:id', function (req, res) {
    
    let idUsuario = req.params.id; //De esta Forma obtengo el valor de /:id que estoy reciviendo en mi petición
    let info = underscore.pick(req.body,['nombre','email','img','role','estado']);//Obtengo la información del cuerpo
    //Con el pick indico que filtraré la da ta de req.body, las columnas que desee conservar las dejo adentro de un arreglo como arriba


    //De esta forma modifico el campo con el findByIdAndUpdate mando el usuario, el objeto a moficar y un callback
    //La parte {new:true} me sirve para que una vez que se modifique el campo este me traiga la nada modificada y no la vieja
    //runValidators:true ayuda a ejecutar las validaciones de mi Objeto de BD
    usuarioModel.findByIdAndUpdate(idUsuario, info,{new:true, runValidators:true},(error, usuarioBD)=>{
        if(error){
            return res.status(400).json({
                ok:false,
                error
            })
        }else{
            //De esta forma imprimo el objeto en forma de JSON
            res.json({
                ok:true,
                id: usuarioBD
            })    
        }
        
    })
    
})

//Hago una peticion DELETE para eliminar data
app.delete('/usuario/:idUsuario', function (req, res) {
    let id = req.params.idUsuario;

    //DE ESTA FORMA ELIMINO UN REGISTRO DEFINITIVAMENTE
    /*usuarioModel.findByIdAndRemove(id,(err, usuarioBorrado)=>{
        if(err){
            return res.status(400).json({
                ok:false,
                err
            })
        }else{

            if(!usuarioBorrado){
                return res.status(400).json({
                    ok:false,
                    err:{
                        message: 'Usuario no encontrado'
                    }
                })
            }
            res.json({
                ok:true,
                usuario:usuarioBorrado
            })
        }
    });*/

    //DE ESTA FORMA ELIMINO UN REGISTRO DE FORMA LÓGICA
    let objetoMod = {
        estado:false
    }
    usuarioModel.findByIdAndUpdate(id,objetoMod,{new:true}, (error, usuarioMod) => {
        if(error){
            return res.status(400).json({
                ok:false,
                error
            })
        }else{
            res.json({
                ok:true,
                usuarioModificado: usuarioMod
            })
        }
    })
})

module.exports = app;//Exporto mi variable app, la cual tiene las peticiones de arriba que ejecuté