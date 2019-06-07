require('dotenv').config();
const url = 'https://westcentralus.api.cognitive.microsoft.com/vision/v2.0/ocr';
const key = process.env.OCR_KEY;
const rp = require('request-promise');
const fs = require('fs');
const file = 'image1.json';
const BoxTuple = require('./box.js');

/**
 * Send request to Microsoft OCR API
 *
 *  @param {Object} payload - contains
 *  url to the image
 *  @return {Promise} response object
 */
function processRequest (payload) {
  const options = {
    method: 'POST',
    url: url,
    body: {
      url: payload.url
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

function mockProcessRequest () {
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf-8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

/**
 * Parse response from processRequest to readable
 * json format
 *
 * @param res - result from processRequest microsoft API
 * @return readable json format
 */
function parseResponse (res) {
  const boxes = [];
  const lines = [];

  let lineNum;

  // set responses as Box object
  for (let region of res.regions) {
    const parentCoordinates = region.boundingBox.split(',');
    for (let line of region.lines) {
      const text = [];
      for (let word of line.words) {
        text.push(word['text']);
      }
      const coordinates = line.boundingBox.split(',');
      boxes.push(new BoxTuple(parentCoordinates, coordinates, text.join(' ')));
    }
  }

  // put boxes in ascending order
  boxes.sort(BoxTuple.yAxisSort);

  // put boxes in lines
  lineNum = -1;
  let top = -1, bottom = -1;
  for (let box of boxes) {
    // represents the top y-axis
    const yTop = parseInt(box.coordinates[1]);
    // represents the bottom y-axis
    const yBottom = yTop + parseInt(box.coordinates[3]);
    // since all elements are sorted on y-axis, if the
    // second element top edge is within the top half of the first element,
    // then it is deemed as on the same row, else increment to the next row
    if (top <= yTop && yTop <= (top + bottom) / 2) {
      lines[lineNum].push(box);
    } else {
      lineNum++;
      lines.push([]);
      lines[lineNum].push(box);
      top = yTop;
      bottom = yBottom;
    }
  }
  const results = [];
  for (let lt of lines) {
    lt.sort(BoxTuple.xAxisSort);
    let tempLine = [];
    // do it for the first occurrence, then repeat for the rest
    let trimmed;
    // replace out all the commas with periods
    trimmed = lt[0].text.replace(',', '.');
    tempLine.push(trimmed);
    for (let i = 1; i < lt.length; i++) {
      if (!BoxTuple.hasSameParent(lt[i - 1], lt[i]) && !BoxTuple.isXAxisNear(lt[i - 1], lt[i])) {
        tempLine.push(' ');
      }
      let trimmed;
      trimmed = lt[i].text.replace(',', '.');
      tempLine.push(trimmed);
    }
    const line = (tempLine.join(''));
    results.push(line);
    // move this to other places
    // const price = line.match(/\d*\.\d+/g);
    // if (price && price.length === 1) {
    //   resultArr.push({line, price: price[0]});
    // }
  }
  console.log(results);
}


// walmart
const image1 = 'https://i.imgur.com/3eTMyyT.jpg';
// county market
const image2 = 'https://i.imgur.com/VH4PDCq.jpg';
// freshMarket
const image3 = 'https://i.imgur.com/ZkSLNYl.jpg';
const hrstart = process.hrtime();
// mockProcessRequest()
processRequest({url: image2})
  .then(res => {
    // console.log(res);
    // res = JSON.parse(res);
    // fs.writeFileSync('image1.json', JSON.stringify(res));
    parseResponse(res);
    const hrend = process.hrtime(hrstart);
    console.info(`Execution time: ${hrend[1]/1000000}ms`);
  })
  .catch(err => {
    console.log(err);
  });
