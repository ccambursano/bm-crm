const sql = require("mssql");

let poolPromise;

function getPool() {
  if (!poolPromise) {
    const connStr = process.env.AZURE_SQL_CONNECTION_STRING;
    if (!connStr) throw new Error("Falta AZURE_SQL_CONNECTION_STRING en la configuración de la Function App.");
    poolPromise = sql.connect(connStr).catch((err) => {
      poolPromise = null; // limpiar para que el próximo intento reconecte en vez de reusar la promesa fallida
      throw err;
    });
  }
  return poolPromise;
}

module.exports = { sql, getPool };
