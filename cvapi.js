const url = 'https://westcentralus.api.cognitive.microsoft.com/vision/v2.0/ocr';
const key = process.env.key;
const rp = require('request-promise');
const fs = require('fs');
const file = 'image.json';
const BoxTuple = require('./boxTuple.js');

class CVAPI {
  constructor(imageUrl) {
    this.imageUrl = imageUrl;
  }

  processRequest() {
    const options = {
      method: 'POST',
      url: url,
      body: {
        url: this.imageUrl
      },
      qs: {
        language: 'en',
        detectOrientation: true
      },
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': key,
      },
      json: true
    };
    return rp(options);
  }

  mockProcessRequest() {
    return new Promise((resolve, reject) => {
      fs.readFile(file, 'utf-8', (err, data) => {
        if(err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  parseResponse(res) {
    const boxTuples = [];
    const lineTuples = [];

    let lineNum = 0;

    for(let region of res.regions) {
      const parent_coordinates = region.boundingBox.split(',');
      for(let line of region.lines) {
        const text = [];
        for(let word of line.words) {
          text.push(word['text']);
        }
        boxTuples.push(new BoxTuple(parent_coordinates, line.boundingBox.split(','), text.join(' ')));
      }
    }

    boxTuples.sort(BoxTuple.y_axis_sort);
    lineNum = -1;
    let left = -1, right = -1;

    for(let bt of boxTuples) {
      const begin = parseInt(bt.coordinates[1]);
      const end = begin + parseInt(bt.coordinates[3]);
      if(left <= begin && begin <= right) {
        lineTuples[lineNum].push(bt);
      } else {
        lineNum++;
        lineTuples.push([]);
        lineTuples[lineNum].push(bt);
        left = begin;
        right = end;
      }
    }

    lineNum = 0;
    const resultArr = [];
    for(let lt of lineTuples) {
      lt.sort(BoxTuple.x_axis_sort);
      let tempLine = [];
      let trimmed = lt[0].text.replace(/\s/g, '');
      trimmed = trimmed.replace(',', '.');
      tempLine.push(trimmed);
      for(let i = 1; i < lt.length; i++) {
        if(!BoxTuple.has_same_parent(lt[i-1], lt[i]) && !BoxTuple.is_x_axis_near(lt[i-1], lt[i])) {
          tempLine.push(' ');
        }
        let trimmed = lt[i].text.replace(/\s/g, '');
        trimmed = trimmed.replace(',', '.');
        tempLine.push(trimmed);
      }
      const line = (tempLine.join(''));
      const price = line.match(/\d*\.\d+/g);
      if(price &&  price.length === 1 ) {
        resultArr.push({line, price: price[0]});
      }
    }
    console.log(resultArr);
  }
}
const image1 = 'https://i.imgur.com/iMonCi9.png';
const image2 = 'https://i.imgur.com/VH4PDCq.jpg';

const api = new CVAPI(image2);
api.processRequest()
  .then(res => {
    console.log(res);
    // res = JSON.parse(res);
    // fs.writeFileSync('image.json', JSON.stringify(res));
    api.parseResponse(res);
  })
  .catch(err => {
    console.log(err);
  });
