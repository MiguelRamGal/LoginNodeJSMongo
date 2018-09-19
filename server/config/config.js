//===============================
//PUERTO
//===============================
process.env.PORT = process.env.PORT || 3000;

//===============================
//ENTORNO
//===============================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev'//Esta variable me ayuda para QUE heroku sepa si esta en un archivo local o en producción


//===============================
//BASE DE DATOSS
//===============================

let urlBD;
//Defino el entorno si es de producción on local, para poder definir la cadena de conexión
if(process.env.NODE_ENV === 'dev'){
    urlBD = 'mongodb://localhost:27017/cafe';//BD en localhost
}else{
    urlBD = 'mongodb://cafe-user:qwerty1@ds163382.mlab.com:63382/cafe'//URL de BD para MLAB
}

process.env.URLDB = urlBD;//Asigno a una variable de proccess mi cadena de conexión para poder utilizarla


//===============================
//VENCIMIENTO DEL TOKEN
//60 segundos
//60 minutos
//24 horas
//30 días
//===============================
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;//Creo una variable para la fecha de expiración de los TOKEN

//===============================
//SEED
//===============================
process.env.SEED = 'este-es-el-seed-de-desarrollo';