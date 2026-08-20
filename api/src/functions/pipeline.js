const { app } = require("@azure/functions");
const { sql, getPool } = require("../db");

app.http("pipelineList", {
  methods: ["GET"],
  route: "pipeline",
  authLevel: "anonymous",
  handler: async () => {
    const pool = await getPool();
    const result = await pool.request().query("SELECT * FROM pipeline ORDER BY creado DESC");
    return { jsonBody: result.recordset };
  },
});

app.http("pipelineCreate", {
  methods: ["POST"],
  route: "pipeline",
  authLevel: "anonymous",
  handler: async (request) => {
    const b = await request.json();
    const pool = await getPool();
    const result = await pool.request()
      .input("nombre", sql.NVarChar, b.nombre)
      .input("marca", sql.NVarChar, b.marca)
      .input("etapa", sql.NVarChar, b.etapa || "contactado")
      .input("valor", sql.Decimal(14, 2), b.valor || null)
      .input("origen", sql.NVarChar, b.origen || null)
      .input("notas", sql.NVarChar, b.notas || null)
      .query(`INSERT INTO pipeline (nombre, marca, etapa, valor, origen, notas)
              OUTPUT INSERTED.* VALUES (@nombre, @marca, @etapa, @valor, @origen, @notas)`);
    return { status: 201, jsonBody: result.recordset[0] };
  },
});

app.http("pipelineUpdate", {
  methods: ["PUT"],
  route: "pipeline/{id}",
  authLevel: "anonymous",
  handler: async (request) => {
    const id = request.params.id;
    const b = await request.json();
    const pool = await getPool();
    const result = await pool.request()
      .input("id", sql.UniqueIdentifier, id)
      .input("nombre", sql.NVarChar, b.nombre)
      .input("marca", sql.NVarChar, b.marca)
      .input("etapa", sql.NVarChar, b.etapa || "contactado")
      .input("valor", sql.Decimal(14, 2), b.valor || null)
      .input("origen", sql.NVarChar, b.origen || null)
      .input("notas", sql.NVarChar, b.notas || null)
      .query(`UPDATE pipeline SET nombre=@nombre, marca=@marca, etapa=@etapa, valor=@valor,
              origen=@origen, notas=@notas OUTPUT INSERTED.* WHERE id=@id`);
    if (!result.recordset.length) return { status: 404, jsonBody: { error: "No encontrado" } };
    return { jsonBody: result.recordset[0] };
  },
});

app.http("pipelineDelete", {
  methods: ["DELETE"],
  route: "pipeline/{id}",
  authLevel: "anonymous",
  handler: async (request) => {
    const id = request.params.id;
    const pool = await getPool();
    await pool.request().input("id", sql.UniqueIdentifier, id).query("DELETE FROM pipeline WHERE id=@id");
    return { status: 204 };
  },
});
