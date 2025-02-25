// src/converter.js

const marked = require('marked');
const { JSDOM } = require('jsdom');
const removeMd = require('remove-markdown');
const yaml = require('js-yaml');

function convertToTxt(fragmentType, data) {
  let inputString = data.toString('utf8');

  switch (fragmentType) {
    case 'text/plain':
      return data;

    case 'text/markdown': {
      // Remove Markdown formatting
      const txtString = removeMd(inputString);
      // Return the resulting text as a Buffer
      return Buffer.from(txtString, 'utf8');
    }

    case 'text/html': {
      // Parse the HTML string using JSDOM
      const dom = new JSDOM(inputString);

      // Extract the text content from the body element
      const textContent = dom.window.document.body.textContent || '';

      // Return the text as a Buffer
      return Buffer.from(textContent, 'utf8');
    }

    case 'text/csv': {
      // Convert CSV to text
      const txtString = inputString
        .split('\n')                   // split into lines
        .map(line => line.split(',').join('\t')) // replace commas with tabs in each line
        .join('\n');                   // join lines back together

      // Return the result as a Buffer
      return Buffer.from(txtString, 'utf8');
    }

    case 'application/json': {
      // Parse the JSON string.
      let jsonData = JSON.parse(inputString);

      // Pretty-print the JSON object as a plain text string.
      const txtString = JSON.stringify(jsonData);

      // Return the plain text as a Buffer.
      return Buffer.from(txtString, 'utf8');
    }

    case 'application/yaml': {
      let parsedObject = yaml.load(inputString);

      // Convert the object to a pretty-printed JSON string as plain text.
      const txtString = JSON.stringify(parsedObject);

      // Return the resulting text as a Buffer.
      return Buffer.from(txtString, 'utf8');
    }
  }
};

function convertToMarkdown(fragmentType, data) {
  switch (fragmentType) {
    case 'text/markdown':
      return data;
  }
};

// Helper function to strip HTML tags from a string
function stripHtml(htmlString) {
  const dom = new JSDOM(htmlString);
  return dom.window.document.body.textContent || '';
}

module.exports = { convertToTxt, convertToMarkdown };
