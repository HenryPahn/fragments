const { writeFragment, readFragment, writeFragmentData, deleteFragment, listFragments, readFragmentData } = require('../../src/model/data/aws');
const ddbDocClient = require('../../src/model/data/aws/ddbDocClient');
const s3Client = require('../../src/model/data/aws/s3Client');
const { PutCommand, GetObjectCommand } = require('@aws-sdk/lib-dynamodb');

jest.mock('../../src/model/data/aws/ddbDocClient', () => ({
  send: jest.fn(),
}));

jest.mock('../../src/model/data/aws/s3Client', () => ({
  send: jest.fn(),
}));

describe('writeFragment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('calls ddbDocClient.send() with PutCommand and correct params', async () => {
    const mockFragment = { id: 'abc123', ownerId: 'user1', type: 'text/plain' };

    // Mock successful DynamoDB response
    ddbDocClient.send.mockResolvedValueOnce({});

    await writeFragment(mockFragment);

    expect(ddbDocClient.send).toHaveBeenCalledTimes(1);
    expect(ddbDocClient.send.mock.calls[0][0]).toBeInstanceOf(PutCommand);
    expect(ddbDocClient.send.mock.calls[0][0].input).toEqual({
      TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
      Item: mockFragment,
    });
  });

  test('throws an error if ddbDocClient.send() fails', async () => {
    const mockFragment = { id: 'xyz789', ownerId: 'user2', type: 'application/json' };

    // Use mockRejectedValue instead of throwing directly
    ddbDocClient.send.mockRejectedValue(new Error('DynamoDB write failed'));

    await expect(writeFragment(mockFragment)).rejects.toThrow('DynamoDB write failed');
  });
});

describe('readFragment', () => {
  const ownerId = 'user123';
  const fragmentId = 'frag456';

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('returns the fragment when found', async () => {
    const mockItem = { id: fragmentId, ownerId, type: 'text/plain' };

    ddbDocClient.send.mockResolvedValue({ Item: mockItem });

    const result = await readFragment(ownerId, fragmentId);
    expect(result).toEqual(mockItem);
  });

  test('returns undefined when no fragment is found', async () => {
    ddbDocClient.send.mockResolvedValue({}); // no Item key

    const result = await readFragment(ownerId, fragmentId);
    expect(result).toBeUndefined();
  });

  test('throws an error when DynamoDB fails', async () => {
    ddbDocClient.send.mockRejectedValue(new Error('DynamoDB failure'));

    await expect(readFragment(ownerId, fragmentId)).rejects.toThrow('DynamoDB failure');
  });
});

describe('writeFragmentData', () => {
  const ownerId = 'user1';
  const fragmentId = 'frag123';
  const mockData = Buffer.from('Test data');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('successfully uploads data to S3', async () => {
    s3Client.send.mockResolvedValueOnce({}); // simulate success

    await expect(writeFragmentData(ownerId, fragmentId, mockData)).resolves.not.toThrow();

    expect(s3Client.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: `${ownerId}/${fragmentId}`,
          Body: mockData,
        },
      })
    );
  });

  test('throws error if S3 upload fails', async () => {
    s3Client.send.mockImplementationOnce(() => {
      throw new Error('S3 error');
    });

    await expect(writeFragmentData(ownerId, fragmentId, mockData))
      .rejects.toThrow('unable to upload fragment data');
  });
});

describe('listFragments', () => {
  const ownerId = 'user123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns array of fragment IDs when expand is false', async () => {
    const mockResponse = {
      Items: [
        { id: 'frag1' },
        { id: 'frag2' },
        { id: 'frag3' },
      ],
    };

    ddbDocClient.send.mockResolvedValueOnce(mockResponse);

    const result = await listFragments(ownerId, false);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual(['frag1', 'frag2', 'frag3']);
  });

  test('returns array of fragment objects when expand is true', async () => {
    const mockResponse = {
      Items: [
        { id: 'frag1', type: 'text/plain' },
        { id: 'frag2', type: 'text/html' },
      ],
    };

    ddbDocClient.send.mockResolvedValueOnce(mockResponse);

    const result = await listFragments(ownerId, true);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual(mockResponse.Items);
  });

  test('returns empty array when no items are found', async () => {
    const mockResponse = { Items: [] };
    ddbDocClient.send.mockResolvedValueOnce(mockResponse);

    const result = await listFragments(ownerId);
    expect(result).toEqual([]);
  });

  test('throws error when DynamoDB query fails', async () => {
    ddbDocClient.send.mockRejectedValueOnce(new Error('DynamoDB error'));

    await expect(listFragments(ownerId)).rejects.toThrow('DynamoDB error');
  });
});

describe('readFragmentData', () => {
  const ownerId = 'user123';
  const fragmentId = 'fragment123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('successfully reads fragment data from S3', async () => {
    const mockBuffer = Buffer.from('mock fragment content');

    // Create a mock stream that emits data
    const mockStream = require('stream').Readable.from([mockBuffer]);

    s3Client.send.mockResolvedValueOnce({ Body: mockStream });

    const result = await readFragmentData(ownerId, fragmentId);

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.toString()).toBe('mock fragment content');
    expect(s3Client.send).toHaveBeenCalledWith(expect.anything(GetObjectCommand));
  });

  test('throws error when S3 getObject fails', async () => {
    s3Client.send.mockRejectedValueOnce(new Error('S3 read error'));

    await expect(readFragmentData(ownerId, fragmentId)).rejects.toThrow('unable to read fragment data');
  });
});

describe('deleteFragment', () => {
  const ownerId = 'test-user';
  const fragmentId = 'frag-001';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('successfully deletes metadata from DynamoDB and object from S3', async () => {
    // Mock both DynamoDB and S3 deletions to resolve
    ddbDocClient.send.mockResolvedValueOnce({});
    s3Client.send.mockResolvedValueOnce({});

    await expect(deleteFragment(ownerId, fragmentId)).resolves.toBeUndefined();

    expect(ddbDocClient.send).toHaveBeenCalledTimes(1);
    expect(s3Client.send).toHaveBeenCalledTimes(1);

    const ddbCall = ddbDocClient.send.mock.calls[0][0].input;
    const s3Call = s3Client.send.mock.calls[0][0].input;

    expect(ddbCall.TableName).toBe(process.env.AWS_DYNAMODB_TABLE_NAME);
    expect(ddbCall.Key).toEqual({ ownerId, id: fragmentId });

    expect(s3Call.Bucket).toBe(process.env.AWS_S3_BUCKET_NAME);
    expect(s3Call.Key).toBe(`${ownerId}/${fragmentId}`);
  });

  test('throws error when S3 deletion fails', async () => {
    ddbDocClient.send.mockResolvedValueOnce({});
    s3Client.send.mockRejectedValueOnce(new Error('S3 failure'));

    await expect(deleteFragment(ownerId, fragmentId)).rejects.toThrow('unable to read fragment data');

    expect(ddbDocClient.send).toHaveBeenCalledTimes(1);
    expect(s3Client.send).toHaveBeenCalledTimes(1);
  });
});
