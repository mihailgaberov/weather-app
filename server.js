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
      const weatherData = JSON.parse(body)
      if (!weatherData || weatherData.main === undefined) {
        res.render('index', { weather: null, error: 'Error, please try again' })
      } else {
        const weatherText = `It's ${Math.round(parseInt(weatherData.main.temp))} degrees in ${weatherData.name}, with ${weatherData.weather[0].description}!`
        // const img = `<img src='http://openweathermap.org/img/w/${weatherData.weather[0].icon}.png'>`
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
	sgMail.setApiKey(process.env.SENDGRID_API_KEY);
	const weatherData = JSON.parse(body)
	let text = ''
	let roundedWeather = ''
      if (!weatherData || weatherData.main === undefined) {
	text = 'Error occurred fetching the weather info, please check the Openweathermap API, it might be changed.'
      } else {
        roundedWeather = Math.round(parseInt(weatherData.main.temp))
	text = `Your Majesty, The weather today in ${emailCity} will be ${roundedWeather}, with ${weatherData.weather[0].description}`
      }
	const msg = {
          to: [MY_EMAIL, HER_EMAIL],
          from: 'mihail@weatherapp.com',
          subject: `The weather today in ${emailCity}`,
          text: text,
          html: `<p><i>Your Majesty</i>, The weather today in <b>${emailCity}</b> will be <b style='color: orangered;'>${roundedWeather}</b>, with ${weatherData.weather[0].description} <img src='http://openweathermap.org/img/w/${weatherData.weather[0].icon}.png'></p>`,
        };
	sgMail.send(msg);
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
