const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
const sgMail = require('@sendgrid/mail');
const CronJob = require('cron').CronJob
require('dotenv').config()

const apiKey = process.env.WEATHERAPP_API_KEY
const port = process.env.PORT || 8080
const MY_EMAIL = process.env.MY_EMAIL
const HER_EMAIL = process.env.HER_EMAIL
const timeZone = 'Europe/Zurich'
const emailCity = 'Zurich'

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
      const weather = JSON.parse(body)
      if (!weather || weather.main === undefined) {
        res.render('index', { weather: null, error: 'Error, please try again' })
      } else {
        const weatherText = `It's ${Math.round(parseInt(weather.main.temp))} degrees in ${weather.name}!`
        res.render('index', { weather: weatherText, error: null })
      }
    }
  })
})

app.listen(port, function () {
  console.log('Server running on port: ', port)
})


function sendEmail() {
  const url = `http://api.openweathermap.org/data/2.5/weather?q=${emailCity}&units=metric&appid=${apiKey}`
  request(url, function (err, response, body) {
    if (err) {
      throw new Error('Error, please try again')
    } else {
      const weather = JSON.parse(body)
      if (!weather || weather.main === undefined) {
        throw new Error('Error, please try again')
      } else {
        const roundedWeather = Math.round(parseInt(weather.main.temp))
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
          to: [MY_EMAIL, HER_EMAIL],
          from: 'my@weatherapp.com',
          subject: `The weather today in ${emailCity}`,
          text: `Your Majesty, The weather today in ${emailCity} will be ${roundedWeather}`,
          html: `<p><i>Your Majesty</i>, The weather today in <b>${emailCity}</b> will be <b style='color: orangered;'>${roundedWeather}</b></p>`,
        };
        sgMail.send(msg);
      }
    }
  })
}

const job = new CronJob('00 30 07 * * 1-5', function () {
    sendEmail()
  }, function () {
    console.log('stopped...')
  },
  true,
  timeZone
)
