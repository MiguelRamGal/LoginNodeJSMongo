const mongoose = require('mongoose')//Instancio mi librería de moongose
const uniqueValidator = require('mongoose-unique-validator')//importo mi librería

let Schema = mongoose.Schema;//Creo un nuevo schema

//Defino mis roles posibles
let rolesValidos = {
    values: ['ADMIN_ROLE','USER_ROLE'],
    message: '{VALUE} no es un rol valido'//Este es usado para un mensaje de error
}

//Creo mi nueva estructura de mi colexión
let usuarioSchema = new Schema({
    nombre : {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        unique:true,
        required: [true,'El correo es necesario']
    },
    password: {
        type: "String",
        required: [true, 'La contraseña es obligatoria']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default:true
    },
    google: {
        type: Boolean,
        default: false
    }
})

//Esta forma me ayuda a eliminar elementos en la respuesta, en este caso elimino el password
usuarioSchema.methods.toJSON = function(){
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;
    return userObject;
};

usuarioSchema.plugin(uniqueValidator, {message: '{PATH} debe de se único'})//De esta formo valido lo único

module.exports = mongoose.model('Usuario',usuarioSchema)//Exporto mi modelo con el nombre de Usuario