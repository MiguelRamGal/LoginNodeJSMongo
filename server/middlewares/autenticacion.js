const jwt = require('jsonwebtoken');


//========================
//Verificar token
//========================
let verificaToken = ( req, res, next ) => {

    let token = req.get('token')//De esta forma obtengo los HEADERS
    //DE esta forma valido un token, el promer parametro le paso el token a verificar, luego el SEED, y por último recio un callback
    jwt.verify(token,process.env.SEED, (err, decoded) => {
        if(err){
            return res.status(400).json({
                ok:false,
                err
            })
        }

        req.usuario = decoded.usuario;//De esta forma al request general le asigno el usuario de a info recibida por el jwt.verify Y regreso este objeto a donde se mando a llamar la función
        //En la parte de REQUEST general agrego una nueva variable en la cual pondre el objeto del TOKEN que acabo de validar

        next();//COn el NEXT indico que la ejecución del programa continue, si no lo pongo, este se quedara pausado en esta función
    });

}


//========================
//Verificar ADMIN_ROLE
//========================
let verificaAdministrador = ( req, res, next ) => {
    let usuario = req.usuario;//AAlmaceno el rrequest general, la variable usuario

    //Verifico que el rol de el usuario que está utilizando la aplicación sea de tipo administración
    if(usuario.role === "ADMIN_ROLE"){
        next();
    }else{
        //Si no es así mando un error
        return res.json({
            ok:false,
            error: 'El usuario no es administrador'
        })
    }
    
}


module.exports = {
    verificaToken,
    verificaAdministrador
};