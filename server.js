const express = require("express")
const app = express()
const mongoose = require("mongoose")
const cors = require("cors")
const bodyParser = require("body-parser")
const authRouter = require("./route/authRoute")
const userRouter = require("./route/userRoute")
const path = require("path")
const PORT = 4800

// app.use(express.static(path.join(__dirname, 'public')))
app.use('/public', express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

const dotenv = require("dotenv")

dotenv.config({ path: "./config.env" })


const DB = process.env.DATABASE
mongooseOptions = {
    autoIndex: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
    keepAliveInitialDelay: 300000,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    minPoolSize: 3,
};

mongoose.set('strictQuery', true)

mongoose.connect(DB, mongooseOptions).then(() => {
    console.log("Database Connected !")
})
mongoose.connection.on("error", (error) => {
    console.log(error, "chetan")
})

app.use('/auth', authRouter)
app.use('/user', userRouter)

app.all("*", (req, res) => {
    res.status(404).json({
        message: `Can't find ${req.originalUrl} on this server!`,
    })
})

app.listen(PORT, () => {
    console.log(`Server listening at ${PORT} PORT!`)
})