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

    if(typeof size !== 'number' || size < 0) {
      throw new Error(
        `size type must be number, and size can't be negative, got size=${size}`
      );
    }

    if(!Fragment.isSupportedType(type)) {
      throw new Error(
        `type is not supported, got type=${type}`
      );
    }

    this.ownerId = ownerId;
    this.id = id ? id : randomUUID(); 
    this.created = created ? created : new Date().toISOString(); 
    this.updated = updated ? updated : new Date().toISOString(); 
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
    const result = await readFragment(ownerId, id); 
    const newFragment = new Fragment(result);
    return newFragment;
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
    this.updated = new Date().toISOString(); 
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
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    if (!data) {
      throw new Error(
        `Buffer data is required, got data=${data}`
      );
    }

    this.size += 1;
    await writeFragmentData(this.ownerId, this.id, data);
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
    const validFragmentConversions = {
      "text/plain": ["text/plain"],
      "text/markdown": ["text/markdown", "text/html", "text/plain"],
      "text/html": ["text/html", "text/plain"],
      "text/csv": ["text/csv", "text/plain", "application/json"],
      "application/json": ["application/json", "application/x-yaml", "text/plain"],
      "application/yaml": ["application/x-yaml", "text/plain"],
      "image/png": ["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"],
      "image/jpeg": ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
      "image/webp": ["image/webp", "image/png", "image/jpeg", "image/gif", "image/avif"],
      "image/avif": ["image/avif", "image/png", "image/jpeg", "image/webp", "image/gif"],
      "image/gif": ["image/gif", "image/png", "image/jpeg", "image/webp", "image/avif"],
    };

    return validFragmentConversions[this.mimeType];
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    // We will add more supported type later, such as  `text/markdown`, `text/html`, `application/json`, `image/png`, `image/jpeg`, `image/webp`, `image/gif`
    const supportedTypes = [`text/plain`, 'text/plain; charset=utf-8'];
    return supportedTypes.includes(value)
  }
}

module.exports.Fragment = Fragment;
