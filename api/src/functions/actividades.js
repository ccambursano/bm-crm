const { app } = require("@azure/functions");
const { sql, getPool } = require("../db");

app.http("actividadesList", {
  methods: ["GET"],
  route: "actividades",
  authLevel: "anonymous",
  handler: async () => {
    const pool = await getPool();
    const result = await pool.request().query("SELECT * FROM actividades ORDER BY fecha DESC, creado DESC");
    return { jsonBody: result.recordset };
  },
});

app.http("actividadesCreate", {
  methods: ["POST"],
  route: "actividades",
  authLevel: "anonymous",
  handler: async (request) => {
    const b = await request.json();
    const pool = await getPool();
    const result = await pool.request()
      .input("prospecto", sql.NVarChar, b.prospecto)
      .input("tipo", sql.NVarChar, b.tipo || "llamada")
      .input("fecha", sql.Date, b.fecha || null)
      .input("notas", sql.NVarChar, b.notas || null)
      .query(`INSERT INTO actividades (prospecto, tipo, fecha, notas)
              OUTPUT INSERTED.* VALUES (@prospecto, @tipo, @fecha, @notas)`);
    return { status: 201, jsonBody: result.recordset[0] };
  },
});

app.http("actividadesUpdate", {
  methods: ["PUT"],
  route: "actividades/{id}",
  authLevel: "anonymous",
  handler: async (request) => {
    const id = request.params.id;
    const b = await request.json();
    const pool = await getPool();
    const result = await pool.request()
      .input("id", sql.UniqueIdentifier, id)
      .input("prospecto", sql.NVarChar, b.prospecto)
      .input("tipo", sql.NVarChar, b.tipo || "llamada")
      .input("fecha", sql.Date, b.fecha || null)
      .input("notas", sql.NVarChar, b.notas || null)
      .query(`UPDATE actividades SET prospecto=@prospecto, tipo=@tipo, fecha=@fecha, notas=@notas
              OUTPUT INSERTED.* WHERE id=@id`);
    if (!result.recordset.length) return { status: 404, jsonBody: { error: "No encontrado" } };
    return { jsonBody: result.recordset[0] };
  },
});

app.http("actividadesDelete", {
  methods: ["DELETE"],
  route: "actividades/{id}",
  authLevel: "anonymous",
  handler: async (request) => {
    const id = request.params.id;
    const pool = await getPool();
    await pool.request().input("id", sql.UniqueIdentifier, id).query("DELETE FROM actividades WHERE id=@id");
    return { status: 204 };
  },
});
