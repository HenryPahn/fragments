// Fix this path to point to your project's `memory-db.js` source file
const { readFragment, writeFragment, readFragmentData, writeFragmentData, deleteFragment, listFragments } = require('../../src/model/data/memory');

describe('memory', () => {
  // Test function to write and read fragments' metadata at the same time
  test('readFragment() returns what we writeFragment() into the db', async () => {
    // Create a fragment
    const fragment = {
      ownerId: "owner123", 
      id: "123456", 
      data: 123,
    }

    // Write the fragment to the database 
    writeFragment(fragment); 

    // Read the fragment from the database
    const resultFromRead = await readFragment(fragment.ownerId, fragment.id); 

    // the result from write and read function should be the same
    expect(resultFromRead).toEqual(fragment);
  })

  // Test function to write and read fragments' buffer at the same time
  test('readFragmentData() returns what we writeFragmentData() into the db', async () => {
    // create a buffer data 
    const data = Buffer.from([1, 2, 3])

    // Write the buffer to the database 
    writeFragmentData('ab12', 'haha', data); 

    // Read the buffer from the database
    const resultFromRead = await readFragmentData('ab12', 'haha'); 

    // the result from write and read function should be the same
    expect(resultFromRead).toEqual(data);
  })

  // Test function to return the list of IDs in the db
  test('listFragments() returns an array of IDs in none-expanded mode', async () => {
    // Create fragments
    const fragment1 = {
      ownerId: "owner123", 
      id: "123456", 
      data: 123,
    }

    const fragment2 = {
      ownerId: "owner123", 
      id: "123", 
      data: 456,
    }

    const fragment3 = {
      ownerId: "owner123", 
      id: "456", 
      data: 13,
    }

    // Write the fragment to the database 
    writeFragment(fragment1); 
    writeFragment(fragment2); 
    writeFragment(fragment3); 

    const results = await listFragments('owner123'); 
    
    expect(Array.isArray(results)).toBe(true);
    expect(results).toEqual(["123", "456", "123456"]);
  })

  // Test function to return the list of object in the db
  test('listFragments() returns an array of objects in expanded mode', async () => {
    // Create fragments
    const fragment1 = {
      ownerId: "owner123", 
      id: "123456", 
      data: 123,
    }

    const fragment2 = {
      ownerId: "owner123", 
      id: "123", 
      data: 456,
    }

    const fragment3 = {
      ownerId: "owner123", 
      id: "456", 
      data: 13,
    }

    // Write the fragment to the database 
    writeFragment(fragment1); 
    writeFragment(fragment2); 
    writeFragment(fragment3); 

    const results = await listFragments('owner123', true); 

    expect(Array.isArray(results)).toBe(true);
    expect(results).toEqual([{
      ownerId: "owner123", 
      id: "123", 
      data: 456,
    }, {
      ownerId: "owner123", 
      id: "456", 
      data: 13,
    }, {
      ownerId: "owner123", 
      id: "123456", 
      data: 123,
    }]);
  })

  // Test function to delete a fragment's buffer and metadata from the db 
  test('deleteFragment() delete a fragment buffer from in-memory db', async () => {
    // create a fragment data
    const fragment = {
      ownerId: "del123", 
      id: "hello123", 
      data: 123,
    }

    // Write the metadata to the database 
    writeFragment(fragment); 

    // Read the metadata from the database
    const resultFromReadFragment = await readFragment('del123', 'hello123'); 

    // the result from write and read function should be the same
    expect(resultFromReadFragment).toEqual(fragment);

    // create a buffer data 
    const data = Buffer.from([1, 2, 3]);
    
    // Write the buffer to the database 
    writeFragmentData('del123', 'hello123', data); 

    // Read the buffer from the database
    const resultFromReadFragmentData = await readFragmentData('del123', 'hello123'); 

    // the result from write and read function should be the same
    expect(resultFromReadFragmentData).toEqual(data);

    // remove the data from db
    await deleteFragment('del123', 'hello123');

    // The result of removed data should be undefined
    expect(await readFragment('del123', 'hello123')).toBe(undefined);
    expect(await readFragmentData('del123', 'hello123')).toBe(undefined);
  })  
});
