import bcrypt from 'bcrypt'
import jsonwebtoken from 'jsonwebtoken'
import fsp from 'fs/promises'

import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const pathToKey = path.join(__dirname,'..','id_rsa_priv.pem');
const PRIV_KEY = await fsp.readFile(pathToKey,'utf8');

export async function genPasswordHash(password){

    const hash = await bcrypt.hash(password,10)
    return hash
}

export async function validPassword(password, hash){

    const match = await bcrypt.compare(password,hash)
    return match
}

export function issueJWT(user){

    const _id = user._id;
    
    // storage time
    const  expiresIn = '1d'

    const payload = {
        sub:_id,
        iat:Date.now()
    }

    const signedToken = jsonwebtoken.sign(payload,PRIV_KEY,{expiresIn:expiresIn, algorithm:'RS256'} )
    return{
        token: "Bearer " + signedToken,
        expires:expiresIn
    }
}