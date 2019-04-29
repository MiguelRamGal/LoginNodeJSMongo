const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs')
const path = require('path')

// default options
app.use(fileUpload());

app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo
    let id = req.params.id
  
    if (Object.keys(req.files).length == 0) {
        return res.status(400).json({ ok: false, err: {message: 'No s eha seleccionado ningun archivo'} });
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let archivo = req.files.archivo; //Almaceno el archivo en una variable con ("archivo es el nombre que tiene la imagen")
    let nombreArchivo = archivo.name.split('.'); //OBTENGO EL NOMBRE DEL ARCHIVO Y LO SEPARO POR UN .
    
    let extension = nombreArchivo[nombreArchivo.length-1]; // OBTENGO LA EXTENSION DE MI ARCHIVO
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg']; //VALIDACION PARA RESTRINGIR EXTENSIONES DE LOS ARCHIVOS

    //VALIDAR QUE LA EXTENSION SE ENCUENTRE EN EXTENSIONES VALIDAS
    if(extensionesValidas.indexOf(extension) < 0){
        return res.status(400).json({ok: false,
                                    err: {
                                        message: 'Las extensiones validas permitidas son: ' + extensionesValidas.join(', '),
                                        ext: extension
                                    }})
    }

    //VALIDO EL TIPO QUE MANDO
    let tiposValidos = ['productos','usuarios'];
    if(tiposValidos.indexOf(tipo) < 0){
        return res.status(400).json({ok: false,
            err: {
                message: 'Los tipos permistidos son: ' + tiposValidos.join(', ')
            }})
    }


    //DEFINO EL NOMBRE AL ARCHIVO
    let nombreArchivoNew = `${id}-${ new Date().getMilliseconds() }.${extension}`;

    // Use the mv() method to place the file somewhere on your server
    archivo.mv(`uploads/${tipo}/${nombreArchivoNew}`, (err) =>{
        if (err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(tipo == 'usuarios'){
            imagenUsuario(id, res, nombreArchivoNew)//MANDO A LLAMAR MI FUNCION PARA SABER SI EXISTE EL USUARIO
        }else if(tipo == 'productos'){
            imagenProducto(id, res, nombreArchivoNew)
        }


        
    });
});


//FUNCION PARA GUARDAR LA IMAGEN DEL USUARIO
function imagenUsuario(id, res, nombreArchivo){
    
    Usuario.findById(id, (err, UsuarioBD) =>{
        if(err){
            borrarArchivo(nombreArchivo, 'usuarios')//MANDO A LLAMAR MI FUNCION PARA ELIMINAR MI ARCHIVO
            return res.status(500).json({   ok: false, err})
        }

        //SI NO EXISTE EL USUARIO
        if( !UsuarioBD ){

            borrarArchivo(nombreArchivo, 'usuarios')//MANDO A LLAMAR MI FUNCION PARA ELIMINAR MI ARCHIVO
            return res.status(500).json({   
                                        ok: false, 
                                        err:{
                                            message: 'El usuario no existe'
                                        }
                                    })
        }

        borrarArchivo(UsuarioBD.img, 'usuarios')//MANDO A LLAMAR MI FUNCION PARA ELIMINAR MI ARCHIVO

        UsuarioBD.img = nombreArchivo; //ASIGNO A LA IMAGEN EL NOMBRE DEL ARCHIVO
        //GUARDO EL OBJETO EN LA BASE DE DATOS
        UsuarioBD.save( (err, usuarioGuardado) =>{
            res.json({
                ok:true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            })
        })
    })

}

//FUNCION PARA GUARDAR LA IMAGEN DEL PRODUCTOS
function imagenProducto(id, res, nombreArchivo){

    Producto.findById(id, (err, productoBD) =>{
        if(err){
            borrarArchivo(nombreArchivo, 'productos')
            return res.status(500).json({   ok: false, err})
        } 

        //SI NO EXISTE EL PRODCUTOS
        if( !productoBD ){
            borrarArchivo(nombreArchivo, 'productos')
            return res.status(500).json({   ok: false, err:{message: "El producto no existe"}})
        }


        borrarArchivo(productoBD.img, 'productos')//MANDO A LLAMAR MI FUNCION PARA ELIMINAR MI ARCHIVO
        productoBD.img = nombreArchivo; //ASIGNO A LA IMAGEN EL NOMBRE DEL ARCHIVO
        //GUARDO EL OBJETO EN LA BASE DE DATOS
        productoBD.save( (err, productoGuardado) =>{
            res.json({
                ok:true,
                producto: productoGuardado,
                img: nombreArchivo
            })
        })
    })
}


//PROCESO PARA ELIMINAR LOS ARCHIVOS
function borrarArchivo(nombreArchivo, tipo){
    let pathArchivo = path.resolve(__dirname, `../../uploads/${ tipo }/${ nombreArchivo }`); // OBTENGO LA URL DE LA IMAGEN DE A ELIMINAR

    //CON LA LIBRERÍA FILE SYSTEM VERIFICO QUE EL ARCHIVO EXISTA EN LA URL QUE CONSTRUÍ
    if( fs.existsSync(pathArchivo) ){
        //SI EL ARCHIVO EXISTE LO ELIMINO
        fs.unlinkSync(pathArchivo)
    }

}

module.exports = app;