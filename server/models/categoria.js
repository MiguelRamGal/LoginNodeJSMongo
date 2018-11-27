const mongoose = require('mongoose')//Instancio mi librería de moongose
const uniqueValidator = require('mongoose-unique-validator')//importo mi librería

let Schema = mongoose.Schema;//Creo un nuevo schema

//Creo mi nueva estructura de mi colexión
let categoriaSchema = new Schema({
    descripcion : {
        type: String,
        required: [true, 'La descripción es necesaria'],
        unique:true,
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    }
})

module.exports = mongoose.model('Categoria',categoriaSchema)//Exporto mi modelo con el nombre de Usuario