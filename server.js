const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
require('dotenv').config()

const apiKey = process.env.WEATHERAPP_API_KEY

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))
app.set('view engine', 'ejs')

app.get('/', function (req, res) {
    res.render('index')
})

app.post('/', function (req, res) {
    const city = req.body.city;
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`
    request(url, function (err, response, body) {
        if (err) {
            res.render('index', { weather: null, error: 'Error, please try again' })
        } else {
            const weather = JSON.parse(body)
            console.log(weather)
            if (weather.main == undefined) {
                res.render('index', { weather: null, error: 'Error, please try again' })
            } else {
                const weatherText = `It's ${weather.main.temp} degrees in ${weather.name}!`
                res.render('index', { weather: weatherText, error: null })
            }
        }
    });
})

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})