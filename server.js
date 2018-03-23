const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
const emailSender = require('./EmailSender.js')

const apiKey = process.env.WEATHERAPP_API_KEY
const port = process.env.PORT || 8080

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))

app.get('/', function (req, res) {
  res.render('index')
})

app.post('/', function (req, res) {
  const city = req.body.city;
  const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
  request(url, function (err, response, body) {
    if (err) {
      res.render('index', { weather: null, error: 'Error, please try again' })
    } else {
      const weatherData = JSON.parse(body)
      if (!weatherData || weatherData.main === undefined) {
        res.render('index', { weather: null, error: 'Error, please try again' })
      } else {
        const weatherText = `It's ${Math.round(parseInt(weatherData.main.temp))} degrees in ${weatherData.name}, with ${weatherData.weather[0].description}!`
        res.render('index', { weather: weatherText, iconName: weatherData.weather[0].icon, error: null })
      }
    }
  })
})

app.listen(port, function () {
  console.log('Server running on port: ', port)
})

emailSender.start()
