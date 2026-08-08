/**
 * Base Service Class
 * Abstract foundational service encapsulating database execution, transaction management,
 * and unified exception formatting.
 */
class BaseService {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Execute an atomic database transaction
   * @param {Function} callback Callback receiving PostgreSQL client
   */
  async withTransaction(callback) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Format success response structure
   */
  formatSuccess(data, message = null) {
    return {
      success: true,
      ...(message ? { message } : {}),
      ...data
    };
  }

  /**
   * Format standardized service error
   */
  formatError(message, statusCode = 400) {
    const err = new Error(message);
    err.statusCode = statusCode;
    throw err;
  }
}

module.exports = BaseService;
