const express = require('express')
const fs = require('fs')
const path = require('path')
const { verificaTokenImg } = require('../middlewares/autenticacion')


let app = express();

//FUNCION PARA MOSTRAR LAS IMAGENES
app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) =>{
    let tipo = req.params.tipo;
    let img = req.params.img;

    let pathArchivo = path.resolve(__dirname, `../../uploads/${ tipo }/${ img }`); // OBTENGO LA URL DE LA IMAGEN DE A ELIMINAR

    if(fs.existsSync( pathArchivo )){
        return res.sendFile(pathArchivo)
    }else{
        let noImagePath = path.resolve(__dirname, '../assets/no-image.jpg')
        return res.sendFile(noImagePath)
    }
    
})

module.exports = app;