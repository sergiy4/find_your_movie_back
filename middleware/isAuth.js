import passport from "passport";

function isAuth(req,res,next){
    const authorizeMiddleware = passport.authenticate('jwt', {session:false}, (err, user, info)=>{
        if (err || !user) {
            // Помилка або невірний токен, ви можете повернути помилку або виконати інші дії
            return res.status(401).json({ message: 'invalid token' });
        }

         // if the authentication is successful, add the user to the request object
        req.user = user;

        next()
    })

    authorizeMiddleware(req, res, next);
}

export default isAuth