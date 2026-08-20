const { app } = require("@azure/functions");
const { sql, getPool } = require("../db");

app.http("clientesList", {
  methods: ["GET"],
  route: "clientes",
  authLevel: "anonymous",
  handler: async () => {
    const pool = await getPool();
    const result = await pool.request().query("SELECT * FROM clientes ORDER BY creado DESC");
    return { jsonBody: result.recordset };
  },
});

app.http("clientesCreate", {
  methods: ["POST"],
  route: "clientes",
  authLevel: "anonymous",
  handler: async (request) => {
    const b = await request.json();
    const pool = await getPool();
    const result = await pool.request()
      .input("nombre", sql.NVarChar, b.nombre)
      .input("marca", sql.NVarChar, b.marca)
      .input("contacto", sql.NVarChar, b.contacto || null)
      .input("email", sql.NVarChar, b.email || null)
      .input("telefono", sql.NVarChar, b.telefono || null)
      .input("estado", sql.NVarChar, b.estado || "activo")
      .input("notas", sql.NVarChar, b.notas || null)
      .query(`INSERT INTO clientes (nombre, marca, contacto, email, telefono, estado, notas)
              OUTPUT INSERTED.* VALUES (@nombre, @marca, @contacto, @email, @telefono, @estado, @notas)`);
    return { status: 201, jsonBody: result.recordset[0] };
  },
});

app.http("clientesUpdate", {
  methods: ["PUT"],
  route: "clientes/{id}",
  authLevel: "anonymous",
  handler: async (request) => {
    const id = request.params.id;
    const b = await request.json();
    const pool = await getPool();
    const result = await pool.request()
      .input("id", sql.UniqueIdentifier, id)
      .input("nombre", sql.NVarChar, b.nombre)
      .input("marca", sql.NVarChar, b.marca)
      .input("contacto", sql.NVarChar, b.contacto || null)
      .input("email", sql.NVarChar, b.email || null)
      .input("telefono", sql.NVarChar, b.telefono || null)
      .input("estado", sql.NVarChar, b.estado || "activo")
      .input("notas", sql.NVarChar, b.notas || null)
      .query(`UPDATE clientes SET nombre=@nombre, marca=@marca, contacto=@contacto, email=@email,
              telefono=@telefono, estado=@estado, notas=@notas OUTPUT INSERTED.* WHERE id=@id`);
    if (!result.recordset.length) return { status: 404, jsonBody: { error: "No encontrado" } };
    return { jsonBody: result.recordset[0] };
  },
});

app.http("clientesDelete", {
  methods: ["DELETE"],
  route: "clientes/{id}",
  authLevel: "anonymous",
  handler: async (request) => {
    const id = request.params.id;
    const pool = await getPool();
    await pool.request().input("id", sql.UniqueIdentifier, id).query("DELETE FROM clientes WHERE id=@id");
    return { status: 204 };
  },
});
