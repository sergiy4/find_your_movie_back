import passport from "passport";



function isAuth(req, res, next) {
    passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err || !user) {
            return res.status(401).json({ message: 'invalid token' });
        }

        req.user = user; // Додати користувача до об'єкта запиту
        next();
    })(req, res, next); // Виклик middleware
}

export default isAuth
