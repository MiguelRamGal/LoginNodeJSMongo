const express = require('express')//Instancio mi librería express
const bcrypt = require('bcrypt')//Hago referencia a bcrypt
var jwt = require('jsonwebtoken');//Importo el json web token


//CONSTANTES PARA EL LOGIN CON MESSENGER
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);
//CONSTANTES PARA EL LOGIN CON MESSENGER

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



//CONFIGURACIONES DE GOOGLE
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google:true
    }
}

//Función para iniciar con google
app.post('/google', async (req,res) => {
    
    let token = req.body.idtoken;//Obtengo el Id que me mandan y lo almaceno

    //Mando a llamar mi funcón verify la cual verifica el token que sea valido
    let googleUser = await verify(token)
                            .catch(e=>{
                                return res.status(403).json({
                                    ok:false,
                                    err:e
                                })
                            })

    //COn esto busco si existe un registro de ese email en mi base de datos
    usuarioModel.findOne({email:googleUser.email}, (err, usuarioDB) =>{
        
        //Si existe un error en la consulta lo regreso
        if(err){
            return res.status(500).json({
                ok:false,
                err
            })
        }
        
        //Valido que esciste un registro
        if(usuarioDB){

            //Si existe un registro valido que no sea de tipo google
            if(usuarioDB.google === false){

                //MAndo un mensaje de error ya que cuenta con una cuenta normal
                return res.status(400).json({
                    ok:false,
                    err:{
                        meesage:'Debe de utilizar su autenticación normal'
                    }
                })
            }else{

                //SI es un tipo de usuario de Google, creo su token y lo regreso
                let token = jwt.sign({
                    usuario:usuarioDB
                },process.env.SEED,{expiresIn: process.env.CADUCIDAD_TOKEN});

                return res.json({
                    ok:true,
                    usuario:usuarioDB,
                    token
                })
            }
        }else{
            //Si el usuario no existe en la BD, se crea su registro
            let usuario = new usuarioModel();

            //Pongo su información para crear su registro
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            //Guardo la información en mi Mongo DB
            usuario.save( (err,usuarioDB) =>{
                
                //SI hay un error lo regreso
                if(err){
                    return res.status(500).json({
                        ok:false,
                        err
                    })
                }

                //Si se creo satifactoriamente el registro creo su token con su info
                let token = jwt.sign({
                    usuario:usuarioDB
                },process.env.SEED,{expiresIn: process.env.CADUCIDAD_TOKEN});

                return res.json({
                    ok:true,
                    usuario:usuarioDB,
                    token
                })

            })
        }
    })
    
});

module.exports = app;//Exporto mi variable app, la cual tiene las peticiones de arriba que ejecuté