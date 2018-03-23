const request = require('request')
const sgMail = require('@sendgrid/mail');
const CronJob = require('cron').CronJob
require('dotenv').config()

const apiKey = process.env.WEATHERAPP_API_KEY
const MY_EMAIL = process.env.MY_EMAIL
const HER_EMAIL = process.env.HER_EMAIL
const timeZone = 'Europe/Zurich'
const emailCity = 'Zurich'

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
	text = `Your Majesty, The weather in ${emailCity} at the moment is ${roundedWeather}, with ${weatherData.weather[0].description}`
      }
	const msg = {
          to: [MY_EMAIL, HER_EMAIL],
          from: 'mincho.praznikov@vremeto.com',
          subject: `The weather today in ${emailCity}`,
          text: text,
          html: `<p><i>Your Majesty</i>, The weather in <b>${emailCity}</b> at the moment is <b style='color: orangered;'>${roundedWeather}</b>, with ${weatherData.weather[0].description} <img src='http://openweathermap.org/img/w/${weatherData.weather[0].icon}.png'></p>`,
        };
	sgMail.send(msg);
    }
  })
}

function start() {
const job = new CronJob({
  cronTime: '00 30 07 * * 1-5',
  onTick: function() {
    sendEmail()
  },
  start: false,
  timeZone: timeZone
})
job.start()
}
module.exports = {  
    start: start
}
