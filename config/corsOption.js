const allowedOrigins = [
    'http://localhost:5173/',
    'http://localhost:5173',
    'http://localhost:3000/collection'

]

const corsOptions = {
    origin:(origin, cb) =>{
        if( allowedOrigins.includes(origin) || !origin){
            cb(null, true)
        } else {
            cb(new Error("Not allowed by CORS"))
        }
    

    }
}

export default corsOptions