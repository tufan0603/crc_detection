import pkg from 'pg'
const { Pool } = pkg

let _pool = null

export function getPool() {
  if (!_pool) {
    _pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  }
  return _pool
}
