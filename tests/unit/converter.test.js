const { convertToHtml } = require('../../src/converter'); // adjust the path if needed

describe('Convert to HTML extension', () => {
  test('returns the same buffer for text/html type', () => {
    const htmlContent = '<p>Hello, world!</p>';
    const inputBuffer = Buffer.from(htmlContent, 'utf8');

    // For text/html, the conversion should simply return the original data.
    const outputBuffer = convertToHtml('text/html', inputBuffer);

    expect(outputBuffer.toString('utf8')).toBe(htmlContent);
  });

  test('converts markdown to html for text/markdown type', () => {
    const markdownContent = '# Hello, world!';
    const inputBuffer = Buffer.from(markdownContent, 'utf8');

    // When converting from markdown, the output should be HTML.
    const outputBuffer = convertToHtml('text/markdown', inputBuffer);
    const outputString = outputBuffer.toString('utf8');

    // "<h1>Hello, world!</h1>\n" (the newline may be present)
    expect(outputString).toMatch(/<h1>\s*Hello, world!\s*<\/h1>/);
  });
});
