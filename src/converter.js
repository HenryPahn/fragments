// src/converter.js

const MarkdownIt = require('markdown-it');
const { markdownToTxt } = require('markdown-to-txt');
const { convert } = require('html-to-text');
const sharp = require('sharp');
const { jsonToPlainText } = require("json-to-plain-text");
const { parse } = require("yaml");
const csvToJson = require("convert-csv-to-json");
const yaml = require("js-yaml");

function convertToJSON(fragmentType, data) {
  // decode binary data 
  const dataString = new TextDecoder().decode(data);

  switch (fragmentType) {
    case 'application/json':
      return data;

    case 'text/csv': {
      const json = csvToJson.csvStringToJson(dataString);

      return json;
    }
  }
};

function convertToTxt(fragmentType, data) {
  // decode binary data 
  const dataString = new TextDecoder().decode(data);

  switch (fragmentType) {
    case 'text/plain':
      return data;

    case 'text/markdown': {
      const plainText = markdownToTxt(dataString);

      return plainText;
    }

    case 'text/html': {
      const options = {
        wordwrap: 130,
      };

      const plainText = convert(dataString, options);

      return plainText;
    }

    case 'text/csv': {
      const json = csvToJson.csvStringToJson(dataString);

      const plainText = jsonToPlainText(json);
      return plainText;
    }

    case 'application/json': {
      // parse the data string into JSON object
      const parsed = JSON.parse(dataString);

      // Convert to plain text
      const plainText = jsonToPlainText(parsed);
      return plainText;
    }

    case 'application/yaml': {
      const jsonObject = parse(dataString);
      const plainText = jsonToPlainText(jsonObject);
      return plainText;
    }
  }
};

function convertToHtml(fragmentType, data) {
  switch (fragmentType) {
    case 'text/html':
      return data;

    case 'text/markdown': {
      const md = new MarkdownIt();

      // Convert the Markdown buffer to a UTF-8 string.
      const mdString = data.toString('utf8');

      // Convert Markdown to HTML.
      const htmlString = md.render(mdString);

      // Return the resulting HTML as a Buffer.
      return Buffer.from(htmlString, 'utf8');
    }
  }
};

function convertToYAML(fragmentType, data) {
  // decode binary data 
  const dataString = new TextDecoder().decode(data);

  switch (fragmentType) {
    case 'application/json': {
      // parse the data string into JSON object
      const parsed = JSON.parse(dataString);

      const yamlString = yaml.dump(parsed);

      return yamlString;
    }
  }
};

async function convertToPNG(fragmentType, data) {
  switch (fragmentType) {
    case 'image/png':
    case 'image/jpeg':
    case 'image/webp':
    case 'image/avif':
    case 'image/gif':
      return await sharp(data).png().toBuffer();
  }
}

async function convertToJPEG(fragmentType, data) {
  switch (fragmentType) {
    case 'image/png':
    case 'image/jpeg':
    case 'image/webp':
    case 'image/avif':
    case 'image/gif':
      return await sharp(data).jpeg().toBuffer();
  }
}

async function convertToWEBP(fragmentType, data) {
  switch (fragmentType) {
    case 'image/png':
    case 'image/jpeg':
    case 'image/webp':
    case 'image/avif':
    case 'image/gif':
      return await sharp(data).webp().toBuffer();
  }
}

async function convertToAVIF(fragmentType, data) {
  switch (fragmentType) {
    case 'image/png':
    case 'image/jpeg':
    case 'image/webp':
    case 'image/avif':
    case 'image/gif':
      return await sharp(data).avif().toBuffer();
  }
}

async function convertToGIF(fragmentType, data) {
  switch (fragmentType) {
    case 'image/png':
    case 'image/jpeg':
    case 'image/webp':
    case 'image/avif':
    case 'image/gif':
      return await sharp(data).gif().toBuffer();
  }
}

module.exports = { convertToTxt, convertToHtml, convertToJSON, convertToYAML, convertToPNG, convertToJPEG, convertToWEBP, convertToAVIF, convertToGIF };

