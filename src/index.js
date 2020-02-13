const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');

const {startDatabase} = require('./database/mongo');
const {insertData, getData} = require('./database/action');
const {deleteData, updateData} = require('./database/action');


const app = express();

const ads = [
    { title: 'Hello, this is api' }
];

app.use(helmet());
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('combined'))


app.get('/', async (req, res) => {
    res.send(await getData());
});

app.use('/favicon.ico', express.static('public/favicon.ico'));

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://tienlhm.auth0.com/.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  audience: 'https://tienlhm.auth0.com/api/v2/',
  issuer: `https://tienlhm.auth0.com/`,
  algorithms: ['RS256']
});

app.use(checkJwt);

// endpoint to insert
app.post('/', async (req, res) => {
    const data = req.body;
    console.log(data);
    await insertData(data);
    res.send({ message: 'Inserted!' });
});
  
// endpoint to delete
app.delete('/:id', async (req, res) => {
    await deleteData(req.params.id);
    res.send({ message: 'Data removed. _id: ' +  req.params.id});
});
  
// endpoint to update
app.put('/:id', async (req, res) => {
    const updatedAd = req.body;
    await updateData(req.params.id, updatedAd);
    res.send({ message: 'Data updated.' });
});
  
// start the in-memory MongoDB instance
startDatabase().then(async () => {
    await insertData({title: 'Hello, api avaiable!'});
  
    // start the server
    app.listen(3001, async () => {
      console.log('listening on port 3001');
    });
});