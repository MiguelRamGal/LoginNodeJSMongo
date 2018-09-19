const express = require('express')//Instancio mi librería express
const app = express()//Configuro mi express

//Este archivo me sirve para importar todas mis rutas
app.use(require('./usuario'));//De esta forma importo el archivo usuario.js para ponerlo en uso
app.use(require('./login'));//De esta forma importo el archivo login.js para ponerlo en uso

module.exports = app;