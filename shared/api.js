// Shared type definitions (JS - types are documented via JSDoc comments)

/**
 * @typedef {Object} LoginRequest
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {'admin'|'hod'|'faculty'|'student'} role
 * @property {string} [department]
 * @property {string} createdAt
 */

/**
 * @typedef {Object} AuthResponse
 * @property {boolean} success
 * @property {string} [token]
 * @property {User} [user]
 * @property {string} [message]
 */

/**
 * @typedef {Object} DemoResponse
 * @property {string} message
 */
