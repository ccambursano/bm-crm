const { app } = require("@azure/functions");
const { sql, getPool } = require("../db");

app.http("cotizacionesList", {
  methods: ["GET"],
  route: "cotizaciones",
  authLevel: "anonymous",
  handler: async () => {
    const pool = await getPool();
    const result = await pool.request().query("SELECT * FROM cotizaciones ORDER BY creado DESC");
    return { jsonBody: result.recordset };
  },
});

app.http("cotizacionesCreate", {
  methods: ["POST"],
  route: "cotizaciones",
  authLevel: "anonymous",
  handler: async (request) => {
    const b = await request.json();
    const pool = await getPool();
    const result = await pool.request()
      .input("cliente", sql.NVarChar, b.cliente)
      .input("marca", sql.NVarChar, b.marca)
      .input("descripcion", sql.NVarChar, b.descripcion || null)
      .input("monto", sql.Decimal(14, 2), b.monto || null)
      .input("estado", sql.NVarChar, b.estado || "borrador")
      .input("fecha", sql.Date, b.fecha || null)
      .input("link", sql.NVarChar, b.link || null)
      .input("moneda", sql.NVarChar, b.moneda || "ARS")
      .query(`INSERT INTO cotizaciones (cliente, marca, descripcion, monto, estado, fecha, link, moneda)
              OUTPUT INSERTED.* VALUES (@cliente, @marca, @descripcion, @monto, @estado, @fecha, @link, @moneda)`);
    return { status: 201, jsonBody: result.recordset[0] };
  },
});

app.http("cotizacionesUpdate", {
  methods: ["PUT"],
  route: "cotizaciones/{id}",
  authLevel: "anonymous",
  handler: async (request) => {
    const id = request.params.id;
    const b = await request.json();
    const pool = await getPool();
    const result = await pool.request()
      .input("id", sql.UniqueIdentifier, id)
      .input("cliente", sql.NVarChar, b.cliente)
      .input("marca", sql.NVarChar, b.marca)
      .input("descripcion", sql.NVarChar, b.descripcion || null)
      .input("monto", sql.Decimal(14, 2), b.monto || null)
      .input("estado", sql.NVarChar, b.estado || "borrador")
      .input("fecha", sql.Date, b.fecha || null)
      .input("link", sql.NVarChar, b.link || null)
      .input("moneda", sql.NVarChar, b.moneda || "ARS")
      .query(`UPDATE cotizaciones SET cliente=@cliente, marca=@marca, descripcion=@descripcion,
              monto=@monto, estado=@estado, fecha=@fecha, link=@link, moneda=@moneda OUTPUT INSERTED.* WHERE id=@id`);
    if (!result.recordset.length) return { status: 404, jsonBody: { error: "No encontrado" } };
    return { jsonBody: result.recordset[0] };
  },
});

app.http("cotizacionesDelete", {
  methods: ["DELETE"],
  route: "cotizaciones/{id}",
  authLevel: "anonymous",
  handler: async (request) => {
    const id = request.params.id;
    const pool = await getPool();
    await pool.request().input("id", sql.UniqueIdentifier, id).query("DELETE FROM cotizaciones WHERE id=@id");
    return { status: 204 };
  },
});
