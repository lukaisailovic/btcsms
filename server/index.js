const app = require('express')();
var bodyParser = require('body-parser');
var helmet = require('helmet')
console.log('Starting server');


app.use(helmet())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('hello world')
})


app.listen(3000, function () {
  console.log('App ['+process.env.APP_NAME+'] listent on port 3000')
})
