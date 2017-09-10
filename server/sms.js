
const phone = require('phone');
const countries = require('i18n-iso-countries');

const axios = require('axios');
const client = require('twilio')(
  process.env.TWILIO_SID,
  process.env.TWILIO_TOKEN
);


module.exports = {
   getPrice,
   sendSMS,
   checkNumber
}

 function sendSMS(number,body){

      client.messages.create({
          body: body,
          to: number,  // Text this number
          from: process.env.TWILIO_NUMBER // From a valid Twilio number
      })
      .then((message) => console.log(message.sid)).catch((err) => console.log(err));



}

function getPrice(userNumber) {
  return new Promise(function(resolve, reject) {
    let number = phone(userNumber);
    if (number == null) {
      reject('Invalid number')
    }
    let country = countries.getName(number[1],'en');
    let code = countries.getAlpha2Code(country,'en');

    client.pricing.messaging.countries(code).fetch().then(country => {
      average = 0;
      count = 0;
      country.outboundSmsPrices.forEach(price => {
            price.prices.forEach(p => {
                if (p.number_type == 'mobile') {
                  average += parseFloat(p.current_price);
                  count++;

                }
            });
      });

      resolve(average/count);
    })
    .catch(error => {
      reject(error)

    });
  });

} // end of getPrice

function checkNumber(numberToCheck) {
  let number = phone(numberToCheck);
  return number.length !== 0;
}
