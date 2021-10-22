import express from 'express'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true}))

app.get('/', (req, res) => {
    res.status(200).send({ message: 'hello, api server'})
})

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`listen on port: ${port}`)
})