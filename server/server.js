const express = require('express')//Instancio mi librería express
const mongoose = require('mongoose');//Instancio mi librería de mongoose


const app = express()//Configuro mi express
require('./config/config')//Importo mi archivo de configuraciones, en el cual tengo mis puertos etc

//BODYPARSER
const bodyParser = require('body-parser')//Instáncio mi librería body parse,la cual me permete manejar la información de tipo POST
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
//BODYPARSER


app.use(require('./routes/usuario'));//De esta forma importo el archivo usuario.js y para ponerlo en uso


//Conexión a MongoDB
mongoose.connect(process.env.URLDB,(err, res) => {
    if(err) throw err;

    console.log('Base de datos ONLINE');
});


//Defino mi puerto
app.listen(process.env.PORT, () => {
    console.log("Escuchando el puerto: ",process.env.PORT)
})