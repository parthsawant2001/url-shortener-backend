const express = require('express');
// const Url = require('./models/Url');
// const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const validUrl = require('valid-url');
const shortid = require('shortid');
const mongoose = require('mongoose');
const { Schema, model } = mongoose;
require('dotenv').config();
const app = express();
const port = 5000;
const dbUrl = process.env.DATABASE_URL;

app.use(cors());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(dbUrl).then(
  (dbo) => {
    console.log('DB connected');
  },
  (err) => {
    console.log('error');
  }
);

const UrlSchema = new Schema({
  url: { type: String },
  shortCode: { type: String },
});

const UrlModel = new model('Url', UrlSchema);

app.post('/shorten', async (req, res) => {
  const { url } = req.body;
  console.log('req.body url:', url);
  if (validUrl.isUri(url)) {
    console.log('valid URL');
    try {
      const urlDoc = await UrlModel.findOne({ url });
      console.log(urlDoc);
      if (urlDoc) {
        console.log('already exist', urlDoc.shortCode);
        // return res.redirect(urlDoc.url);

        return res.json(urlDoc);
      }

      const shortCode = shortid.generate();
      console.log(shortCode);
      urlDoc = await UrlModel.create({
        url: url,
        shortCode: shortCode,
      });
      // await urlDoc.save();
    } catch (e) {
      res.status(404).json(e);
    }
  }
});

app.get('/:shortCode', async (req, res) => {
  const { shortCode } = req.params;
  console.log(shortCode);
  try {
    const urlDoc = await UrlModel.findOne({ shortCode });
    if (urlDoc) {
      console.log('shortCode found', { urlDoc });
      // console.log('redirecting...', shortCode);
      return res.redirect(urlDoc.url);
    }
    res.status(404).json('url not found');
  } catch (e) {
    console.log(e);
    res.status(500).json('internal server error');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port} 🔥`);
});
// HZGOygD3qUA8JBuG
//mongodb+srv://parthpsawant20:HZGOygD3qUA8JBuG@cluster0.w5yie8m.mongodb.net/?retryWrites=true&w=majority
