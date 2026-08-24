import React, { useState, useEffect, useCallback } from "react";
import {
  Building2, Users, TrendingUp, FileText, Plus, Edit2, Trash2, X,
  Search, LayoutDashboard, Wrench, Server, ChevronRight, AlertCircle, Link2, LogOut,
  Phone, Mail, MapPin, Users2, ClipboardList
} from "lucide-react";
import { api, getCurrentUser } from "./api";

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
`;

const BRAND = {
  informatica: { label: "Informática", color: "#1F3E8E", soft: "#EAEEFA", icon: Server },
  instalaciones: { label: "Instalaciones", color: "#B5651D", soft: "#FBF0E6", icon: Wrench },
  ambos: { label: "Ambos", color: "#515CA0", soft: "#EFEFF8", icon: Building2 },
};

const STAGES = [
  { id: "contactado", label: "Contactado" },
  { id: "propuesta", label: "Propuesta enviada" },
  { id: "negociacion", label: "Negociación" },
  { id: "ganado", label: "Ganado" },
  { id: "perdido", label: "Perdido" },
];

const TIPOS_ACTIVIDAD = {
  llamada: { label: "Teléfono", color: "#1F3E8E", icon: Phone },
  email: { label: "Email", color: "#515CA0", icon: Mail },
  visita: { label: "Visita", color: "#B5651D", icon: MapPin },
  cotizacion: { label: "Cotización enviada", color: "#1F7A4D", icon: FileText },
  reunion: { label: "Reunión", color: "#8A4FBE", icon: Users2 },
  otro: { label: "Otro", color: "#8A8F98", icon: ClipboardList },
};

const QUOTE_STATUS = {
  borrador: { label: "Borrador", color: "#8A8F98" },
  enviada: { label: "Enviada", color: "#B5651D" },
  aprobada: { label: "Aprobada", color: "#1F7A4D" },
  rechazada: { label: "Rechazada", color: "#B23B3B" },
};

const fmtMoney = (n, moneda = "ARS") => {
  const prefix = moneda === "USD" ? "US$" : "$";
  return prefix + Number(n || 0).toLocaleString("es-AR", { maximumFractionDigits: 0 });
};

// ---------- Data hook backed by the Azure Functions API ----------
function useApiList(resource) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    try {
      const data = await api.list(resource);
      setItems(data);
      setError(null);
    } catch (e) {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoaded(true);
    }
  }, [resource]);

  useEffect(() => { reload(); }, [reload]);

  const create = async (data) => {
    try {
      const created = await api.create(resource, data);
      setItems((prev) => [created, ...prev]);
      setError(null);
    } catch (e) { setError("No se pudo guardar. Probá de nuevo."); }
  };
  const update = async (id, data) => {
    try {
      const updated = await api.update(resource, id, data);
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
      setError(null);
    } catch (e) { setError("No se pudo guardar. Probá de nuevo."); }
  };
  const remove = async (id) => {
    try {
      await api.remove(resource, id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setError(null);
    } catch (e) { setError("No se pudo eliminar. Probá de nuevo."); }
  };

  return { items, loaded, error, create, update, remove };
}

function BrandPill({ brand, small }) {
  const b = BRAND[brand] || BRAND.ambos;
  const Icon = b.icon;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: b.soft, color: b.color,
      padding: small ? "2px 8px" : "4px 10px",
      borderRadius: 999, fontSize: small ? 11 : 12, fontWeight: 600,
      border: `1px solid ${b.color}22`,
    }}>
      <Icon size={small ? 11 : 13} strokeWidth={2.5} />
      {b.label}
    </span>
  );
}

function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "56px 20px", color: "#8A8F98", textAlign: "center",
    }}>
      <Icon size={30} strokeWidth={1.5} style={{ marginBottom: 10, opacity: 0.6 }} />
      <div style={{ fontWeight: 700, color: "#3A3F4C", fontSize: 14.5 }}>{title}</div>
      <div style={{ fontSize: 13, marginTop: 4, maxWidth: 320 }}>{subtitle}</div>
    </div>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(6,10,26,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16,
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 14, width: "100%",
        maxWidth: wide ? 560 : 440, maxHeight: "88vh", overflowY: "auto",
        boxShadow: "0 24px 60px rgba(0,19,101,0.25)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 22px", borderBottom: "1px solid #EEF0F5",
          position: "sticky", top: 0, background: "#fff", borderRadius: "14px 14px 0 0",
        }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#001365" }}>{title}</h3>
          <button onClick={onClose} style={{ border: "none", background: "#F3F4F8", borderRadius: 8, padding: 6, cursor: "pointer", display: "flex" }}>
            <X size={16} color="#6B7280" />
          </button>
        </div>
        <div style={{ padding: 22 }}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#515CA0", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.3 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "9px 11px", borderRadius: 8, border: "1px solid #DDE1EA",
  fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", color: "#1A1D29", background: "#FBFCFE",
};

function BtnPrimary({ children, ...props }) {
  return (
    <button {...props} style={{
      background: "#1F3E8E", color: "#fff", border: "none", borderRadius: 9, padding: "10px 16px",
      fontWeight: 700, fontSize: 13.5, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
      ...(props.style || {}),
    }}>{children}</button>
  );
}

function BtnGhost({ children, ...props }) {
  return (
    <button {...props} style={{
      background: "transparent", color: "#515CA0", border: "1px solid #DDE1EA", borderRadius: 9,
      padding: "9px 14px", fontWeight: 600, fontSize: 13.5, cursor: "pointer", ...(props.style || {}),
    }}>{children}</button>
  );
}

// ---------- CLIENTES ----------
function ClientesView({ list }) {
  const { items, loaded, error, create, update, remove } = list;
  const [modal, setModal] = useState(null);
  const [filterBrand, setFilterBrand] = useState("todos");
  const [search, setSearch] = useState("");
  const empty = { nombre: "", marca: "informatica", contacto: "", email: "", telefono: "", estado: "activo", notas: "" };
  const [form, setForm] = useState(empty);

  const openNew = () => { setForm(empty); setModal("new"); };
  const openEdit = (c) => { setForm(c); setModal("edit"); };
  const save = () => {
    if (!form.nombre.trim()) return;
    if (modal === "new") create(form); else update(form.id, form);
    setModal(null);
  };

  const filtered = items.filter((c) => {
    if (filterBrand !== "todos" && c.marca !== filterBrand) return false;
    if (search && !(`${c.nombre} ${c.contacto}`.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Search size={14} color="#9AA0AE" style={{ position: "absolute", left: 10, top: 10 }} />
            <input placeholder="Buscar cliente..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, width: 200, paddingLeft: 30 }} />
          </div>
          <select value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)} style={{ ...inputStyle, width: 160 }}>
            <option value="todos">Todas las marcas</option>
            <option value="informatica">Informática</option>
            <option value="instalaciones">Instalaciones</option>
            <option value="ambos">Ambos</option>
          </select>
        </div>
        <BtnPrimary onClick={openNew}><Plus size={15} /> Nuevo cliente</BtnPrimary>
      </div>

      {!loaded ? (
        <div style={{ padding: 40, textAlign: "center", color: "#9AA0AE", fontSize: 13 }}>Cargando clientes…</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Building2} title="Sin clientes todavía" subtitle="Agregá tu primer cliente o proyecto activo para empezar a hacer seguimiento." />
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {filtered.map((c) => (
            <div key={c.id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff",
              borderRadius: 12, padding: "14px 16px", border: "1px solid #EEF0F5",
              borderLeft: `4px solid ${(BRAND[c.marca] || BRAND.ambos).color}`,
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 800, color: "#1A1D29", fontSize: 14.5 }}>{c.nombre}</span>
                  <BrandPill brand={c.marca} small />
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                    background: c.estado === "activo" ? "#E9F7EF" : "#F3F4F8",
                    color: c.estado === "activo" ? "#1F7A4D" : "#8A8F98",
                  }}>{c.estado === "activo" ? "Activo" : "Pausado"}</span>
                </div>
                <div style={{ fontSize: 12.5, color: "#6B7280" }}>
                  {c.contacto && <span>{c.contacto} · </span>}
                  {c.email && <span>{c.email} · </span>}
                  {c.telefono}
                </div>
                {c.notas && <div style={{ fontSize: 12, color: "#9AA0AE", marginTop: 4, maxWidth: 520 }}>{c.notas}</div>}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => openEdit(c)} style={iconBtnStyle}><Edit2 size={14} color="#515CA0" /></button>
                <button onClick={() => remove(c.id)} style={iconBtnStyle}><Trash2 size={14} color="#B23B3B" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {error && <div style={errorBoxStyle}><AlertCircle size={13} /> {error}</div>}

      {modal && (
        <Modal title={modal === "new" ? "Nuevo cliente" : "Editar cliente"} onClose={() => setModal(null)}>
          <Field label="Nombre / Empresa"><input style={inputStyle} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></Field>
          <Field label="Marca">
            <select style={inputStyle} value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })}>
              <option value="informatica">BM Informática</option>
              <option value="instalaciones">BM Instalaciones</option>
              <option value="ambos">Ambos</option>
            </select>
          </Field>
          <Field label="Contacto"><input style={inputStyle} value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })} /></Field>
          <Field label="Email"><input style={inputStyle} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Teléfono"><input style={inputStyle} value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></Field>
          <Field label="Estado">
            <select style={inputStyle} value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
              <option value="activo">Activo</option>
              <option value="pausado">Pausado</option>
            </select>
          </Field>
          <Field label="Notas / Proyecto"><textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} /></Field>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
            <BtnGhost onClick={() => setModal(null)}>Cancelar</BtnGhost>
            <BtnPrimary onClick={save}>Guardar</BtnPrimary>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ---------- PIPELINE ----------
function PipelineView({ list }) {
  const { items, loaded, error, create, update, remove } = list;
  const [modal, setModal] = useState(null);
  const empty = { nombre: "", marca: "informatica", etapa: "contactado", valor: "", origen: "", notas: "" };
  const [form, setForm] = useState(empty);

  const openNew = (etapa) => { setForm({ ...empty, etapa }); setModal("new"); };
  const openEdit = (p) => { setForm(p); setModal("edit"); };
  const save = () => {
    if (!form.nombre.trim()) return;
    if (modal === "new") create(form); else update(form.id, form);
    setModal(null);
  };
  const moveStage = (item, dir) => {
    const stageIdx = STAGES.findIndex((s) => s.id === item.etapa);
    const nextIdx = Math.max(0, Math.min(STAGES.length - 1, stageIdx + dir));
    update(item.id, { ...item, etapa: STAGES[nextIdx].id });
  };

  const totalPipeline = items.filter(i => !["ganado", "perdido"].includes(i.etapa)).reduce((s, i) => s + Number(i.valor || 0), 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontSize: 13, color: "#6B7280" }}>Pipeline abierto: <b style={{ color: "#001365" }}>{fmtMoney(totalPipeline)}</b></div>
        <BtnPrimary onClick={() => openNew("contactado")}><Plus size={15} /> Nuevo prospecto</BtnPrimary>
      </div>

      {!loaded ? (
        <div style={{ padding: 40, textAlign: "center", color: "#9AA0AE", fontSize: 13 }}>Cargando pipeline…</div>
      ) : items.length === 0 ? (
        <EmptyState icon={TrendingUp} title="Todavía no hay prospectos" subtitle="Cargá campañas como la de escuelas AMBA para seguir el estado de cada oportunidad." />
      ) : (
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
          {STAGES.map((stage) => {
            const stageItems = items.filter((i) => i.etapa === stage.id);
            return (
              <div key={stage.id} style={{ minWidth: 216, flex: "0 0 216px" }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: "#515CA0", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                  <span>{stage.label}</span>
                  <span style={{ color: "#B7BCC8" }}>{stageItems.length}</span>
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  {stageItems.map((p) => (
                    <div key={p.id} style={{ background: "#fff", border: "1px solid #EEF0F5", borderRadius: 10, padding: 10, borderTop: `3px solid ${(BRAND[p.marca] || BRAND.ambos).color}` }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#1A1D29", marginBottom: 4 }}>{p.nombre}</div>
                      <BrandPill brand={p.marca} small />
                      {p.valor ? <div style={{ fontSize: 12.5, fontWeight: 700, color: "#001365", marginTop: 6 }}>{fmtMoney(p.valor)}</div> : null}
                      {p.notas && <div style={{ fontSize: 11.5, color: "#9AA0AE", marginTop: 4 }}>{p.notas}</div>}
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button disabled={stage.id === "contactado"} onClick={() => moveStage(p, -1)} style={{ ...miniBtnStyle, opacity: stage.id === "contactado" ? 0.3 : 1 }}>◀</button>
                          <button disabled={stage.id === "perdido"} onClick={() => moveStage(p, 1)} style={{ ...miniBtnStyle, opacity: stage.id === "perdido" ? 0.3 : 1 }}>▶</button>
                        </div>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button onClick={() => openEdit(p)} style={iconBtnStyle}><Edit2 size={12} color="#515CA0" /></button>
                          <button onClick={() => remove(p.id)} style={iconBtnStyle}><Trash2 size={12} color="#B23B3B" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {error && <div style={errorBoxStyle}><AlertCircle size={13} /> {error}</div>}

      {modal && (
        <Modal title={modal === "new" ? "Nuevo prospecto" : "Editar prospecto"} onClose={() => setModal(null)}>
          <Field label="Nombre / Empresa"><input style={inputStyle} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></Field>
          <Field label="Marca">
            <select style={inputStyle} value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })}>
              <option value="informatica">BM Informática</option>
              <option value="instalaciones">BM Instalaciones</option>
              <option value="ambos">Ambos</option>
            </select>
          </Field>
          <Field label="Etapa">
            <select style={inputStyle} value={form.etapa} onChange={(e) => setForm({ ...form, etapa: e.target.value })}>
              {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </Field>
          <Field label="Valor estimado (ARS)"><input type="number" style={inputStyle} value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} /></Field>
          <Field label="Origen (ej: campaña escuelas AMBA)"><input style={inputStyle} value={form.origen} onChange={(e) => setForm({ ...form, origen: e.target.value })} /></Field>
          <Field label="Notas"><textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} /></Field>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
            <BtnGhost onClick={() => setModal(null)}>Cancelar</BtnGhost>
            <BtnPrimary onClick={save}>Guardar</BtnPrimary>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ---------- COTIZACIONES ----------
function CotizacionesView({ list, clientes }) {
  const { items, loaded, error, create, update, remove } = list;
  const [modal, setModal] = useState(null);
  const empty = { cliente: "", marca: "informatica", descripcion: "", monto: "", moneda: "ARS", estado: "borrador", fecha: new Date().toISOString().slice(0, 10), link: "" };
  const [form, setForm] = useState(empty);

  const openNew = () => { setForm(empty); setModal("new"); };
  const openEdit = (q) => { setForm({ ...empty, ...q }); setModal("edit"); };
  const save = () => {
    if (!form.cliente.trim()) return;
    if (modal === "new") create(form); else update(form.id, form);
    setModal(null);
  };

  const sumBy = (estado, moneda) => items
    .filter(i => i.estado === estado && (i.moneda || "ARS") === moneda)
    .reduce((s, i) => s + Number(i.monto || 0), 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 18, fontSize: 13, color: "#6B7280", flexWrap: "wrap" }}>
          <span>Aprobado: <b style={{ color: "#1F7A4D" }}>{fmtMoney(sumBy("aprobada", "ARS"), "ARS")}</b>{sumBy("aprobada", "USD") > 0 && <> · <b style={{ color: "#1F7A4D" }}>{fmtMoney(sumBy("aprobada", "USD"), "USD")}</b></>}</span>
          <span>Pendiente: <b style={{ color: "#B5651D" }}>{fmtMoney(sumBy("enviada", "ARS"), "ARS")}</b>{sumBy("enviada", "USD") > 0 && <> · <b style={{ color: "#B5651D" }}>{fmtMoney(sumBy("enviada", "USD"), "USD")}</b></>}</span>
        </div>
        <BtnPrimary onClick={openNew}><Plus size={15} /> Nueva cotización</BtnPrimary>
      </div>

      <div style={{ marginBottom: 16 }}>
        <a
          href="https://arbminformatica.sharepoint.com/sites/Comercial/Documentos%20compartidos/Presupuestos"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            color: "#1F3E8E", fontWeight: 600, fontSize: 13, textDecoration: "none",
          }}
        >
          <Link2 size={14} /> Abrir carpeta de Presupuestos en SharePoint
        </a>
      </div>

      {!loaded ? (
        <div style={{ padding: 40, textAlign: "center", color: "#9AA0AE", fontSize: 13 }}>Cargando cotizaciones…</div>
      ) : items.length === 0 ? (
        <EmptyState icon={FileText} title="Sin cotizaciones cargadas" subtitle="Registrá las cotizaciones enviadas a Dialog, Faro Verde y demás clientes para no perder el estado de cada una." />
      ) : (
        <div style={{ background: "#fff", border: "1px solid #EEF0F5", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F7F8FC", textAlign: "left" }}>
                {["Cliente", "Descripción", "Marca", "Monto", "Estado", "Fecha", "Presupuesto", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", fontSize: 11.5, color: "#8A8F98", fontWeight: 700, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((q) => {
                const st = QUOTE_STATUS[q.estado] || QUOTE_STATUS.borrador;
                return (
                  <tr key={q.id} style={{ borderTop: "1px solid #F0F1F5" }}>
                    <td style={{ padding: "10px 14px", fontWeight: 700, color: "#1A1D29" }}>{q.cliente}</td>
                    <td style={{ padding: "10px 14px", color: "#6B7280", maxWidth: 220 }}>{q.descripcion}</td>
                    <td style={{ padding: "10px 14px" }}><BrandPill brand={q.marca} small /></td>
                    <td style={{ padding: "10px 14px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{fmtMoney(q.monto, q.moneda)}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 999, background: st.color + "1A", color: st.color }}>{st.label}</span>
                    </td>
                    <td style={{ padding: "10px 14px", color: "#9AA0AE" }}>{q.fecha ? String(q.fecha).slice(0, 10) : ""}</td>
                    <td style={{ padding: "10px 14px" }}>
                      {q.link ? (
                        <a href={q.link} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#1F3E8E", fontWeight: 600, fontSize: 12.5, textDecoration: "none" }}>
                          <Link2 size={12} /> Ver
                        </a>
                      ) : <span style={{ color: "#C7CBD4", fontSize: 12 }}>—</span>}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => openEdit(q)} style={iconBtnStyle}><Edit2 size={13} color="#515CA0" /></button>
                        <button onClick={() => remove(q.id)} style={iconBtnStyle}><Trash2 size={13} color="#B23B3B" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {error && <div style={errorBoxStyle}><AlertCircle size={13} /> {error}</div>}

      {modal && (
        <Modal title={modal === "new" ? "Nueva cotización" : "Editar cotización"} onClose={() => setModal(null)}>
          <Field label="Cliente">
            <input style={inputStyle} list="clientes-datalist" value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })} />
            <datalist id="clientes-datalist">
              {(clientes || []).map((c) => <option key={c.id} value={c.nombre} />)}
            </datalist>
          </Field>
          <Field label="Marca">
            <select style={inputStyle} value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })}>
              <option value="informatica">BM Informática</option>
              <option value="instalaciones">BM Instalaciones</option>
              <option value="ambos">Ambos</option>
            </select>
          </Field>
          <Field label="Descripción"><input style={inputStyle} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></Field>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <Field label="Monto"><input type="number" style={inputStyle} value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} /></Field>
            </div>
            <div style={{ width: 110 }}>
              <Field label="Moneda">
                <select style={inputStyle} value={form.moneda} onChange={(e) => setForm({ ...form, moneda: e.target.value })}>
                  <option value="ARS">ARS $</option>
                  <option value="USD">USD US$</option>
                </select>
              </Field>
            </div>
          </div>
          <Field label="Estado">
            <select style={inputStyle} value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
              {Object.entries(QUOTE_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </Field>
          <Field label="Fecha"><input type="date" style={inputStyle} value={form.fecha ? String(form.fecha).slice(0, 10) : ""} onChange={(e) => setForm({ ...form, fecha: e.target.value })} /></Field>
          <Field label="Link al presupuesto (Drive, Word, PDF, etc.)">
            <input type="url" placeholder="https://..." style={inputStyle} value={form.link || ""} onChange={(e) => setForm({ ...form, link: e.target.value })} />
          </Field>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
            <BtnGhost onClick={() => setModal(null)}>Cancelar</BtnGhost>
            <BtnPrimary onClick={save}>Guardar</BtnPrimary>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ---------- SEGUIMIENTO ----------
function SeguimientoView({ list, pipeline, clientes }) {
  const { items, loaded, error, create, update, remove } = list;
  const [modal, setModal] = useState(null);
  const [filterTipo, setFilterTipo] = useState("todos");
  const empty = { prospecto: "", tipo: "llamada", fecha: new Date().toISOString().slice(0, 10), notas: "", proxima_accion: "", proxima_fecha: "" };
  const [form, setForm] = useState(empty);

  const hoy = new Date().toISOString().slice(0, 10);
  const pendientes = items
    .filter((a) => a.proxima_accion && a.proxima_fecha)
    .sort((a, b) => String(a.proxima_fecha).localeCompare(String(b.proxima_fecha)));

  const nombresSugeridos = [
    ...(pipeline || []).map((p) => p.nombre),
    ...(clientes || []).map((c) => c.nombre),
  ].filter((n, i, arr) => n && arr.indexOf(n) === i);

  const openNew = () => { setForm(empty); setModal("new"); };
  const openEdit = (a) => { setForm({ ...empty, ...a, fecha: a.fecha ? String(a.fecha).slice(0, 10) : "", proxima_fecha: a.proxima_fecha ? String(a.proxima_fecha).slice(0, 10) : "" }); setModal("edit"); };
  const save = () => {
    if (!form.prospecto.trim()) return;
    if (modal === "new") create(form); else update(form.id, form);
    setModal(null);
  };

  const filtered = items.filter((a) => filterTipo === "todos" || a.tipo === filterTipo);

  return (
    <div>
      {pendientes.length > 0 && (
        <div style={{
          background: "#FFF8EC", border: "1px solid #F0DDB8", borderRadius: 12,
          padding: "14px 16px", marginBottom: 18,
        }}>
          <div style={{ fontWeight: 800, color: "#8A5A00", fontSize: 13, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.3 }}>
            Próximas acciones pendientes
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {pendientes.map((a) => {
              const vencida = a.proxima_fecha < hoy;
              return (
                <div key={a.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  background: "#fff", borderRadius: 8, padding: "8px 12px",
                  border: `1px solid ${vencida ? "#F3C6C6" : "#EEF0F5"}`,
                }}>
                  <div style={{ fontSize: 13 }}>
                    <b style={{ color: "#1A1D29" }}>{a.prospecto}</b>
                    <span style={{ color: "#6B7280" }}> — {a.proxima_accion}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: vencida ? "#B23B3B" : "#8A5A00" }}>
                    {String(a.proxima_fecha).slice(0, 10)}{vencida ? " (vencida)" : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)} style={{ ...inputStyle, width: 200 }}>
          <option value="todos">Todos los tipos</option>
          {Object.entries(TIPOS_ACTIVIDAD).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <BtnPrimary onClick={openNew}><Plus size={15} /> Nuevo seguimiento</BtnPrimary>
      </div>

      {!loaded ? (
        <div style={{ padding: 40, textAlign: "center", color: "#9AA0AE", fontSize: 13 }}>Cargando seguimiento…</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Sin seguimientos registrados" subtitle="Registrá cada llamada, visita o email a un prospecto para llevar el historial completo del seguimiento." />
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {filtered.map((a) => {
            const t = TIPOS_ACTIVIDAD[a.tipo] || TIPOS_ACTIVIDAD.otro;
            const Icon = t.icon;
            return (
              <div key={a.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: "#fff",
                borderRadius: 12, padding: "14px 16px", border: "1px solid #EEF0F5", borderLeft: `4px solid ${t.color}`,
              }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ background: t.color + "16", borderRadius: 8, padding: 8, height: "fit-content" }}>
                    <Icon size={16} color={t.color} strokeWidth={2.3} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontWeight: 800, color: "#1A1D29", fontSize: 14.5 }}>{a.prospecto}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: t.color }}>{t.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#9AA0AE", marginBottom: a.notas ? 4 : 0 }}>
                      {a.fecha ? String(a.fecha).slice(0, 10) : "Sin fecha"}
                    </div>
                    {a.notas && <div style={{ fontSize: 13, color: "#4B5160", maxWidth: 520 }}>{a.notas}</div>}
                    {a.proxima_accion && (
                      <div style={{ fontSize: 12, color: "#8A5A00", marginTop: 6, fontWeight: 600 }}>
                        Próxima acción: {a.proxima_accion} — {a.proxima_fecha ? String(a.proxima_fecha).slice(0, 10) : ""}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => openEdit(a)} style={iconBtnStyle}><Edit2 size={14} color="#515CA0" /></button>
                  <button onClick={() => remove(a.id)} style={iconBtnStyle}><Trash2 size={14} color="#B23B3B" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {error && <div style={errorBoxStyle}><AlertCircle size={13} /> {error}</div>}

      {modal && (
        <Modal title={modal === "new" ? "Nuevo seguimiento" : "Editar seguimiento"} onClose={() => setModal(null)}>
          <Field label="Prospecto / Empresa">
            <input style={inputStyle} list="prospectos-datalist" value={form.prospecto} onChange={(e) => setForm({ ...form, prospecto: e.target.value })} />
            <datalist id="prospectos-datalist">
              {nombresSugeridos.map((n) => <option key={n} value={n} />)}
            </datalist>
          </Field>
          <Field label="Tipo de contacto">
            <select style={inputStyle} value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
              {Object.entries(TIPOS_ACTIVIDAD).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </Field>
          <Field label="Fecha">
            <input type="date" style={inputStyle} value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
          </Field>
          <Field label="Notas">
            <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <Field label="Próxima acción (ej: Llamar, Pedir reunión)">
                <input style={inputStyle} value={form.proxima_accion} onChange={(e) => setForm({ ...form, proxima_accion: e.target.value })} />
              </Field>
            </div>
            <div style={{ width: 150 }}>
              <Field label="Fecha">
                <input type="date" style={inputStyle} value={form.proxima_fecha} onChange={(e) => setForm({ ...form, proxima_fecha: e.target.value })} />
              </Field>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
            <BtnGhost onClick={() => setModal(null)}>Cancelar</BtnGhost>
            <BtnPrimary onClick={save}>Guardar</BtnPrimary>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ---------- DASHBOARD ----------
function DashboardView({ clientes, pipeline, cotizaciones }) {
  const activos = clientes.items.filter((c) => c.estado === "activo").length;
  const pipelineAbierto = pipeline.items.filter(i => !["ganado", "perdido"].includes(i.etapa)).reduce((s, i) => s + Number(i.valor || 0), 0);
  const cotPendientes = cotizaciones.items.filter((q) => q.estado === "enviada").length;
  const ganados = pipeline.items.filter(i => i.etapa === "ganado").length;

  const stats = [
    { label: "Clientes activos", value: activos, icon: Building2, color: "#1F3E8E" },
    { label: "Pipeline abierto", value: fmtMoney(pipelineAbierto), icon: TrendingUp, color: "#B5651D" },
    { label: "Cotizaciones pendientes", value: cotPendientes, icon: FileText, color: "#515CA0" },
    { label: "Prospectos ganados", value: ganados, icon: Users, color: "#1F7A4D" },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #EEF0F5", borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ background: s.color + "16", borderRadius: 8, padding: 6, display: "flex" }}><s.icon size={15} color={s.color} strokeWidth={2.3} /></div>
              <span style={{ fontSize: 11.5, color: "#8A8F98", fontWeight: 700, textTransform: "uppercase" }}>{s.label}</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#001365", fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "#fff", border: "1px solid #EEF0F5", borderRadius: 12, padding: 18 }}>
          <div style={{ fontWeight: 800, color: "#001365", fontSize: 14, marginBottom: 12 }}>Últimos clientes</div>
          {clientes.items.slice(0, 5).map((c) => (
            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #F5F6F9", fontSize: 13 }}>
              <span style={{ fontWeight: 600, color: "#1A1D29" }}>{c.nombre}</span>
              <BrandPill brand={c.marca} small />
            </div>
          ))}
          {clientes.items.length === 0 && <div style={{ fontSize: 12.5, color: "#9AA0AE" }}>Sin clientes cargados aún.</div>}
        </div>
        <div style={{ background: "#fff", border: "1px solid #EEF0F5", borderRadius: 12, padding: 18 }}>
          <div style={{ fontWeight: 800, color: "#001365", fontSize: 14, marginBottom: 12 }}>Prospectos en curso</div>
          {pipeline.items.filter(i => !["ganado", "perdido"].includes(i.etapa)).slice(0, 5).map((p) => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #F5F6F9", fontSize: 13 }}>
              <span style={{ fontWeight: 600, color: "#1A1D29" }}>{p.nombre}</span>
              <span style={{ color: "#8A8F98", fontSize: 12 }}>{STAGES.find(s => s.id === p.etapa)?.label}</span>
            </div>
          ))}
          {pipeline.items.length === 0 && <div style={{ fontSize: 12.5, color: "#9AA0AE" }}>Sin prospectos cargados aún.</div>}
        </div>
      </div>
    </div>
  );
}

const iconBtnStyle = { border: "none", background: "#F5F6FA", borderRadius: 7, padding: 6, cursor: "pointer", display: "flex", alignItems: "center" };
const miniBtnStyle = { border: "1px solid #EEF0F5", background: "#fff", borderRadius: 6, padding: "2px 6px", fontSize: 10, cursor: "pointer", color: "#515CA0" };
const errorBoxStyle = { marginTop: 12, display: "flex", alignItems: "center", gap: 6, background: "#FDEDED", color: "#B23B3B", fontSize: 12.5, padding: "8px 12px", borderRadius: 8 };

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "clientes", label: "Clientes", icon: Building2 },
  { id: "pipeline", label: "Pipeline", icon: TrendingUp },
  { id: "seguimiento", label: "Seguimiento", icon: ClipboardList },
  { id: "cotizaciones", label: "Cotizaciones", icon: FileText },
];

export default function BMCrm() {
  const [tab, setTab] = useState("dashboard");
  const [user, setUser] = useState(null);
  const clientes = useApiList("clientes");
  const pipeline = useApiList("pipeline");
  const cotizaciones = useApiList("cotizaciones");
  const actividades = useApiList("actividades");

  useEffect(() => { getCurrentUser().then(setUser); }, []);

  return (
    <div style={{ fontFamily: "'Manrope', system-ui, sans-serif", background: "#F5F7FB", minHeight: "100vh", display: "flex" }}>
      <style>{FONT_IMPORT}</style>

      <div style={{ width: 200, flexShrink: 0, background: "#001365", color: "#fff", display: "flex", flexDirection: "column", padding: "20px 12px" }}>
        <div style={{ padding: "0 8px 22px", borderBottom: "1px solid rgba(255,255,255,0.12)", marginBottom: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: 0.2 }}>BM CRM</div>
          <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>Cambursano e Hijos IT</div>
        </div>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: "flex", alignItems: "center", gap: 9, padding: "10px 10px", borderRadius: 9, border: "none",
            background: tab === t.id ? "rgba(255,255,255,0.14)" : "transparent", color: "#fff", cursor: "pointer",
            fontSize: 13.5, fontWeight: 600, marginBottom: 3, textAlign: "left",
          }}>
            <t.icon size={15} strokeWidth={2.2} />
            {t.label}
            {tab === t.id && <ChevronRight size={13} style={{ marginLeft: "auto", opacity: 0.7 }} />}
          </button>
        ))}
        <div style={{ marginTop: "auto" }}>
          {user && (
            <div style={{ padding: "10px 8px", borderTop: "1px solid rgba(255,255,255,0.12)", marginTop: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{user.userDetails}</div>
              <a href="/.auth/logout" style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", display: "inline-flex", alignItems: "center", gap: 4, marginTop: 4, textDecoration: "none" }}>
                <LogOut size={11} /> Cerrar sesión
              </a>
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, padding: "26px 30px", overflowX: "auto" }}>
        <div style={{ fontSize: 19, fontWeight: 800, color: "#001365", marginBottom: 4 }}>{TABS.find((t) => t.id === tab)?.label}</div>
        <div style={{ fontSize: 12.5, color: "#8A8F98", marginBottom: 22 }}>BM Informática · BM Instalaciones</div>

        {tab === "dashboard" && <DashboardView clientes={clientes} pipeline={pipeline} cotizaciones={cotizaciones} />}
        {tab === "clientes" && <ClientesView list={clientes} />}
        {tab === "pipeline" && <PipelineView list={pipeline} />}
        {tab === "seguimiento" && <SeguimientoView list={actividades} pipeline={pipeline.items} clientes={clientes.items} />}
        {tab === "cotizaciones" && <CotizacionesView list={cotizaciones} clientes={clientes.items} />}
      </div>
    </div>
  );
}
