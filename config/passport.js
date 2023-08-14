import fs from 'fs'
import User from '../models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';
import JWT from 'passport-jwt'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const jwtStrategy = JWT.Strategy
//  Тут створюється змінна ExtractJwt, 
// до якої присвоюється об'єкт, 
// який дозволяє витягувати JWT з HTTP-запиту. 
// Він використовується для отримання токену JWT з запиту,
// щоб Passport міг перевірити його дійсність.
const ExtractJwt = JWT.ExtractJwt

const pathToKey = path.join(__dirname,'..','id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToKey,'utf8');

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: PUB_KEY,
    algorithms:['RS256']
}

const strategy = new jwtStrategy(options, async(payload, done)=>{

    try{
        
        const user = await User.findOne({_id: payload.sub})

        if(user){
            return done(null, user)
        } else {
            return done(null, false)
        }
    } catch (error) {
        done(error, null)
    }
});

const configPassport = (passport) =>{
    passport.use(strategy)
}

export default configPassport