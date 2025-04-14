const {
  convertToTxt,
  convertToJSON,
  convertToYAML,
  convertToPNG,
  convertToJPEG,
  convertToWEBP,
  convertToAVIF,
  convertToGIF,
  convertToHtml,
} = require('../../src/converter');

describe('JSON to YAML conversion', () => {
  test('converts a simple JSON object to YAML format', () => {
    const jsonData = JSON.stringify({
      name: 'Alice',
      age: 30,
      hobbies: ['reading', 'coding']
    });

    const buffer = Buffer.from(jsonData, 'utf8');

    const result = convertToYAML('application/json', buffer);

    expect(typeof result).toBe('string');
  });
});

describe('CSV to JSON conversion', () => {
  test('converts simple CSV data to JSON object', () => {
    const csvData = 'name,age\nAlice,25\nBob,30';
    const buffer = Buffer.from(csvData, 'utf8');

    const result = convertToJSON('text/csv', buffer);

    expect(result.length).toBe(2);
  });
});

describe('Convert to HTML extension', () => {
  test('returns the same buffer for text/html type', () => {
    const htmlContent = '<p>Hello, world!</p>';
    const inputBuffer = Buffer.from(htmlContent, 'utf8');
    const outputBuffer = convertToHtml('text/html', inputBuffer);
    expect(outputBuffer.toString('utf8')).toBe(htmlContent);
  });

  test('converts markdown to html for text/markdown type', () => {
    const markdownContent = '# Hello, world!';
    const inputBuffer = Buffer.from(markdownContent, 'utf8');
    const outputBuffer = convertToHtml('text/markdown', inputBuffer);
    const outputString = outputBuffer.toString('utf8');
    expect(outputString).toMatch(/<h1>\s*Hello, world!\s*<\/h1>/);
  });
});

describe('Text and format converters', () => {
  test('returns original plain text', () => {
    const plain = 'Just some text';
    const buffer = Buffer.from(plain, 'utf8');
    const output = convertToTxt('text/plain', buffer);
    expect(typeof output).toBe('object');
  });

  test('converts csv to plain text', () => {
    const csv = 'name,age\nAlice,25';
    const buffer = Buffer.from(csv, 'utf8');
    const output = convertToTxt('text/csv', buffer);
    expect(typeof output).toBe('string');
    expect(output).toContain('Alice');
  });

  test('converts basic HTML tags to plain text', () => {
    const htmlData = '<h1>Hello</h1><p>This is <strong>HTML</strong> content.</p>';
    const buffer = Buffer.from(htmlData, 'utf8');

    const result = convertToTxt('text/html', buffer);

    expect(typeof result).toBe('string');
  });

  test('converts basic markdown syntax to plain text', () => {
    const markdownData = '# Title\n\nThis is **bold** and this is *italic*.';
    const buffer = Buffer.from(markdownData, 'utf8');

    const result = convertToTxt('text/markdown', buffer);

    expect(typeof result).toBe('string');
  });

  test('converts application/json to plain text', () => {
    const json = JSON.stringify({ name: 'Alice', age: 30 });
    const buffer = Buffer.from(json, 'utf8');
    const output = convertToTxt('application/json', buffer);
    expect(typeof output).toBe('string');
    expect(output).toContain('Alice');
  });

  test('converts yaml to plain text', () => {
    const yaml = 'name: Alice\nage: 30';
    const buffer = Buffer.from(yaml, 'utf8');
    const output = convertToTxt('application/yaml', buffer);
    expect(typeof output).toBe('string');
    expect(output).toContain('Alice');
  });

  test('returns buffer for json data', () => {
    const json = JSON.stringify({ hello: 'world' });
    const buffer = Buffer.from(json, 'utf8');
    const output = convertToJSON('application/json', buffer);
    expect(Buffer.isBuffer(output) || typeof output === 'object').toBe(true);
  });
});

describe('Image conversion with sharp', () => {
  const base64Png =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
  const imgBuffer = Buffer.from(base64Png, 'base64');

  test('converts PNG to JPEG', async () => {
    const output = await convertToJPEG('image/png', imgBuffer);
    expect(Buffer.isBuffer(output)).toBe(true);
    expect(output.length).toBeGreaterThan(0);
  });

  test('converts PNG to WEBP', async () => {
    const output = await convertToWEBP('image/png', imgBuffer);
    expect(Buffer.isBuffer(output)).toBe(true);
    expect(output.length).toBeGreaterThan(0);
  });

  test('converts PNG to AVIF', async () => {
    const output = await convertToAVIF('image/png', imgBuffer);
    expect(Buffer.isBuffer(output)).toBe(true);
    expect(output.length).toBeGreaterThan(0);
  });

  test('converts PNG to GIF', async () => {
    const output = await convertToGIF('image/png', imgBuffer);
    expect(Buffer.isBuffer(output)).toBe(true);
    expect(output.length).toBeGreaterThan(0);
  });

  test('converts PNG to PNG (noop conversion)', async () => {
    const output = await convertToPNG('image/png', imgBuffer);
    expect(Buffer.isBuffer(output)).toBe(true);
    expect(output.length).toBeGreaterThan(0);
  });
});
