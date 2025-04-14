// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

const extensions = {
  "txt": "text/plain",
  "md": "text/markdown",
  "html": "text/html",
  "csv": "text/csv",
  "json": "application/json",
  "yaml": "application/yaml",
  "yml": "application/yml",
  "png": "image/png",
  "jpg": "image/jpeg",
  "webp": "image/webp",
  "avif": "image/avif",
  "gif": "image/gif",
};

class Fragment {
  /**
   * Contructor 
   * @param {string} id
   * @param {string} ownerId
   * @param {string} created
   * @param {string} updated
   * @param {string} type
   * @param {number} size
   */
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    // OwnerId and type are required. if not exist, throw an exception
    if(!ownerId || !type) {
      throw new Error(
        `ownerId and type strings are required, got ownerId=${ownerId}, type=${type}`
      );
    }

    // the type of size must be a number and size must not be negative
    if(typeof size !== 'number' || size < 0) {
      throw new Error(
        `size type must be number, and size can't be negative, got size=${size}`
      );
    }

    // if the type is not supported, throw an exception
    if(!Fragment.isSupportedType(type)) {
      throw new Error(
        `type is not supported, got type=${type}`
      );
    }

    // get the current time 
    const currentDateTime = new Date().toISOString();

    this.ownerId = ownerId;
    this.id = id ? id : randomUUID(); 
    this.created = created ? created : currentDateTime; 
    this.updated = updated ? updated : currentDateTime; 
    this.type = type; 
    this.size = size;
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    // get all the fragments all the given-id owner
    const results =  await listFragments(ownerId, expand);
    return results ? results : [];
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    // read the fragment from DB
    let result = await readFragment(ownerId, id); 

    // if(result) {
    //   result = new Fragment(result); 
    // }

    if(!result) {
      // throw { message: , status: 404 };
      const unfound = new Error(`No Fragment with id=${id}`); 
      unfound.status = 404;
      throw unfound;
    }
  
    // retyrn a new fragment if result is not undefined. Otherwise, return undefined
    // return result ? new Fragment(result) : result;
    return result ? new Fragment(result) : result;
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static delete(ownerId, id) {
    return deleteFragment(ownerId, id); 
  }

  /**
   * Saves the current fragment (metadata) to the database
   * @returns Promise<void>
   */
  save() {
    // get the current time 
    const currentDateTime = new Date().toISOString();

    // record the time of this update
    this.updated = currentDateTime; 
    return writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database [Or, modify an existed fragment' data]
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    if (!data) {
      throw new Error(
        `Buffer data is required, got data=${data}`
      );
    }

    // get the number (integer) of butes of data
    this.size = Buffer.byteLength(data);

    // write the fragment data to the existed fragment
    await writeFragmentData(this.ownerId, this.id, data);

    // save the fragment to the database
    this.save();
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    return this.mimeType ? true : false;
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    // list of convertable types 
    const validFragmentConversions = {
      "text/plain": ["txt"],
      "text/markdown": ["md", "html", "txt"],
      "text/html": ["html", "txt"],
      "text/csv": ["csv", "txt", "json"],
      "application/json": ["json", "yaml", "yml", "txt"],
      "application/yaml": ["yaml", "txt"],
      "image/png": ["png", "jpg", "webp", "gif", "avif"],
      "image/jpeg": ["png", "jpg", "webp", "gif", "avif"],
      "image/webp": ["png", "jpg", "webp", "gif", "avif"],
      "image/avif": ["png", "jpg", "webp", "gif", "avif"],
      "image/gif": ["png", "jpg", "webp", "gif", "avif"],
    };
  
    return validFragmentConversions[this.mimeType];
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    // list of supported types 
    const supportedTypes = [`text/plain`, 'text/plain; charset=utf-8', `text/markdown`, `text/html`, `text/csv`, `application/json`, `application/yaml`, `image/png`, `image/jpeg`, `image/webp`, `image/avif`, `image/gif`, ];
    return supportedTypes.includes(value)
  }
}

module.exports.extensions = extensions;
module.exports.Fragment = Fragment;
