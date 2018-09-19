const express = require('express')//Instancio mi librería express
const bcrypt = require('bcrypt')//Hago referencia a bcrypt
var jwt = require('jsonwebtoken');//Importo el json web token

const usuarioModel = require('../models/usuario')//Hago referencia a mi modelo de usuario
const app = express()//Configuro mi express

app.post('/login', (req,res) => {
    
    
    let info = req.body;
    //FINDONE,sirve para buscar un registro y solo regresar uno
    usuarioModel.findOne({
        email:info.email
    }, (err, usuarioDB) => {
        //Checo si hay un error al momento de obtener la información
        if(err){
            return res.status(500).json({
                ok:false,
                err
            })
        }

        //Comparo que el resultado de la consulta sea diferente a vacio
        if(!usuarioDB){
            return res.status(400).json({
                ok:false,
                err:{
                    message: 'Usuario incorrecto'
                }
            })
        }

        //La librería bcrypt cuanenta con una función para comparar una contraseña encriptada con una sin encriptar
        if(!bcrypt.compareSync(info.password, usuarioDB.password)){//Si no son iguales
            return res.status(400).json({
                ok:false,
                err:{
                    message: 'Contraseña incorrecta'
                }
            })
        }

        //De esta forma genero un token, en la cual la payload o data es mi objeto usaurioDB, el secret o SEED me ayuda a que coincidan los token, y hago que expire en un mes con la variable CADUCIDAD_TOKEN
        let token = jwt.sign({
            usuario:usuarioDB
        },process.env.SEED,{expiresIn: process.env.CADUCIDAD_TOKEN});

        //Si todo se ejecutó correctamente regreso un estatus okay y la infor del usuario
        res.json({
            ok:true,
            usuario:usuarioDB,
            token: token
        })
        
    })

})



module.exports = app;//Exporto mi variable app, la cual tiene las peticiones de arriba que ejecuté