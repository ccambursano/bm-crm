const sql = require("mssql");

let poolPromise;

function getPool() {
  if (!poolPromise) {
    const connStr = process.env.AZURE_SQL_CONNECTION_STRING;
    if (!connStr) throw new Error("Falta AZURE_SQL_CONNECTION_STRING en la configuración de la Function App.");
    poolPromise = sql.connect(connStr);
  }
  return poolPromise;
}

module.exports = { sql, getPool };
