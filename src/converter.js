// src/converter.js

const MarkdownIt = require('markdown-it');
// const { JSDOM } = require('jsdom');
// const removeMd = require('remove-markdown');
// const yaml = require('js-yaml');
// const { parse } = require('csv-parse/sync');

// function convertToTxt(fragmentType, data) {
//   const inputString = data.toString('utf8');

//   let txtString;

//   switch (fragmentType) {
//     case 'text/plain':
//       return data;

//     case 'text/markdown': {
//       // Remove Markdown formatting
//       txtString = removeMd(inputString);

//       // Return the resulting text as a Buffer
//       return Buffer.from(txtString, 'utf8');
//     }

//     case 'text/html': {
//       // Parse the HTML string using JSDOM
//       const dom = new JSDOM(inputString);

//       // Extract the text content from the body element
//       txtString = dom.window.document.body.textContent || '';

//       // Return the resulting text as a Buffer
//       return Buffer.from(txtString, 'utf8');
//     }

//     case 'text/csv': {
//       // Convert CSV to text
//       txtString = inputString
//         .split('\n')                   // split into lines
//         .map(line => line.split(',').join('\t')) // replace commas with tabs in each line
//         .join('\n');                   // join lines back together

//       // Return the resulting text as a Buffer
//       return Buffer.from(txtString, 'utf8');
//     }

//     case 'application/json': {
//       // Parse the JSON string.
//       let jsonData = JSON.parse(inputString);

//       // Pretty-print the JSON object as a plain text string.
//       txtString = JSON.stringify(jsonData);

//       // Return the resulting text as a Buffer
//       return Buffer.from(txtString, 'utf8');
//     }

//     case 'application/yaml': {
//       let parsedObject = yaml.load(inputString);

//       // Convert the object to a pretty-printed JSON string as plain text.
//       txtString = JSON.stringify(parsedObject);

//       // Return the resulting text as a Buffer
//       return Buffer.from(txtString, 'utf8');
//     }
//   }
// };

// function convertToMarkdown(fragmentType, data) {
//   switch (fragmentType) {
//     case 'text/markdown':
//       return data;
//   }
// };

// function convertToCSV(fragmentType, data) {
//   switch (fragmentType) {
//     case 'text/csv':
//       return data;
//   }
// };

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

// async function convertToJSON(fragmentType, data) {
//   switch (fragmentType) {
//     case 'application/json':
//       return data;

//     case 'text/csv': {
//       return data;
//     }
//   }
// };

module.exports = { convertToHtml };

// module.exports = { convertToTxt, convertToMarkdown, convertToHtml, convertToCSV, convertToJSON };
