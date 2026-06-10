import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const s = {
  app: { fontFamily: 'sans-serif', maxWidth: 960, margin: '0 auto', padding: 16 },
  tabs: { display: 'flex', gap: 8, marginBottom: 24, borderBottom: '2px solid #eee', paddingBottom: 8 },
  tab: { padding: '8px 20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 15, color: '#555' },
  tabActive: { padding: '8px 20px', border: 'none', background: '#2563eb', cursor: 'pointer', fontSize: 15, color: '#fff', fontWeight: 'bold', borderRadius: 6 },
  card: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, marginBottom: 16 },
  h2: { margin: '0 0 12px 0', fontSize: 18, color: '#1e293b' },
  h3: { margin: '0 0 10px 0', fontSize: 15, color: '#334155' },
  row: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 8 },
  input: { padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 14, width: 160 },
  inputSm: { padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 14, width: 80 },
  btnBlue: { padding: '7px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 },
  btnGreen: { padding: '5px 12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  btnRed: { padding: '5px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  btnOrange: { padding: '5px 12px', background: '#d97706', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  btnGray: { padding: '5px 12px', background: '#64748b', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  btnSI: { padding: '4px 12px', background: '#bbf7d0', color: '#166534', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold', fontSize: 13 },
  btnNO: { padding: '4px 12px', background: '#fecaca', color: '#991b1b', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold', fontSize: 13 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: { background: '#f1f5f9', padding: '8px 10px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#475569' },
  td: { padding: '8px 10px', borderBottom: '1px solid #e2e8f0', color: '#1e293b' },
  lbl: { fontSize: 12, color: '#64748b', display: 'block', marginBottom: 2 },
  sel: { padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 14, background: '#fff' },
  tag: { display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontSize: 12, background: '#dbeafe', color: '#1d4ed8' },
  tagGreen: { display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontSize: 12, background: '#dcfce7', color: '#166534', marginRight: 4, marginBottom: 2 },
  tagRed: { display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontSize: 12, background: '#fee2e2', color: '#991b1b', marginRight: 4, marginBottom: 2 },
  ok: { padding: '8px 12px', borderRadius: 6, marginBottom: 12, fontSize: 14, background: '#dcfce7', color: '#166534' },
  err: { padding: '8px 12px', borderRadius: 6, marginBottom: 12, fontSize: 14, background: '#fee2e2', color: '#991b1b' },
  pct: (p) => ({ display: 'inline-block', width: '100%', maxWidth: 80, height: 8, borderRadius: 4, background: '#e2e8f0', position: 'relative', overflow: 'hidden' }),
};

export default function App() {
  const [tab, setTab] = useState('asistencia');
  const [grupos, setGrupos] = useState([]);
  const [grupoId, setGrupoId] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [fg, setFg] = useState({ nombre: '', hora_inicio: '', hora_fin: '' });
  const [fa, setFa] = useState({ nombre: '', edad: '', grupo_id: '', telefono_padre: '' });
  const [edit, setEdit] = useState(null);
  const [hGrupo, setHGrupo] = useState('');
  const [hDias, setHDias] = useState('30');
  const [hData, setHData] = useState([]);
  const [hExpand, setHExpand] = useState({});
  const [hLoading, setHLoading] = useState(false);
  const [adminAuth, setAdminAuth] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const flash = (text, type) => { setMsg({ text, type }); setTimeout(() => setMsg(null), 3000); };
  const api = (path, opts) => fetch(API_URL + path, opts).then(r => r.json());

  const loadGrupos = () => api('/grupos').then(setGrupos).catch(() => flash('Error cargando grupos', 'err'));
  const loadAlumnos = (id) => { setLoading(true); api('/alumnos/grupo/' + id).then(d => { setAlumnos(d); setGrupoId(id); }).catch(() => flash('Error', 'err')).finally(() => setLoading(false)); };
  const loadTodos = () => api('/alumnos').then(setTodos).catch(() => flash('Error', 'err'));
  const loadHistorial = () => {
    if (!hGrupo) return flash('Selecciona un grupo', 'err');
    setHLoading(true);
    api('/asistencia/historial/grupo/' + hGrupo + '?dias=' + hDias)
      .then(d => { setHData(d); setHExpand({}); })
      .catch(() => flash('Error cargando historial', 'err'))
      .finally(() => setHLoading(false));
  };

  const marcar = (alumnoId, presente) => api('/asistencia', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ alumno_id: alumnoId, grupo_id: grupoId, presente }) }).then(() => loadAlumnos(grupoId)).catch(() => flash('Error', 'err'));

  const crearGrupo = () => {
    if (!fg.nombre || !fg.hora_inicio || !fg.hora_fin) return flash('Completa todos los campos', 'err');
    api('/grupos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fg) })
      .then(() => { setFg({ nombre: '', hora_inicio: '', hora_fin: '' }); loadGrupos(); flash('Grupo creado'); })
      .catch(() => flash('Error', 'err'));
  };

  const borrarGrupo = (id) => {
    if (!window.confirm('Eliminar este grupo?')) return;
    api('/grupos/' + id, { method: 'DELETE' }).then(() => { loadGrupos(); loadTodos(); flash('Grupo eliminado'); }).catch(() => flash('Error', 'err'));
  };

  const crearAlumno = () => {
    if (!fa.nombre || !fa.edad || !fa.grupo_id) return flash('Nombre, edad y grupo son obligatorios', 'err');
    api('/alumnos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...fa, edad: parseInt(fa.edad), grupo_id: parseInt(fa.grupo_id) }) })
      .then(() => { setFa({ nombre: '', edad: '', grupo_id: '', telefono_padre: '' }); loadTodos(); flash('Alumno dado de alta'); })
      .catch(() => flash('Error', 'err'));
  };

  const borrarAlumno = (id) => {
    if (!window.confirm('Dar de baja a este alumno?')) return;
    api('/alumnos/' + id, { method: 'DELETE' }).then(() => { loadTodos(); flash('Alumno dado de baja'); }).catch(() => flash('Error', 'err'));
  };

  const guardar = () => {
    api('/alumnos/' + edit.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: edit.nombre, edad: parseInt(edit.edad), grupo_id: parseInt(edit.grupo_id), telefono_padre: edit.telefono_padre || '' }) })
      .then(() => { setEdit(null); loadTodos(); flash('Alumno actualizado'); })
      .catch(() => flash('Error', 'err'));
  };

  const toggleExpand = (fecha) => setHExpand(prev => ({ ...prev, [fecha]: !prev[fecha] }));
  const ADMIN_PIN = process.env.REACT_APP_ADMIN_PIN || '1234';
  const checkPin = () => { if (pinInput === ADMIN_PIN) { setAdminAuth(true); setPinError(false); setPinInput(''); } else { setPinError(true); setPinInput(''); } };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadGrupos(); }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (tab === 'admin') { loadGrupos(); loadTodos(); } }, [tab]);

  const gNombre = (id) => grupos.find(g => g.id === id)?.nombre || ('Grupo ' + id);

  return (
    <div style={s.app}>
      <h1 style={{ color: '#1e293b', margin: '0 0 16px 0' }}>Asistencia Algorithmics</h1>
      {msg && <div style={msg.type === 'ok' ? s.ok : s.err}>{msg.text}</div>}
      <div style={s.tabs}>
        <button style={tab === 'asistencia' ? s.tabActive : s.tab} onClick={() => setTab('asistencia')}>Asistencia</button>
        <button style={tab === 'admin' ? s.tabActive : s.tab} onClick={() => setTab('admin')}>Administrar</button>
        <button style={tab === 'historial' ? s.tabActive : s.tab} onClick={() => setTab('historial')}>Historial</button>
      </div>

      {tab === 'asistencia' && (
        <div>
          <div style={s.card}>
            <h2 style={s.h2}>Grupos</h2>
            <div style={s.row}>
              {grupos.map(g => (
                <button key={g.id} style={{ ...s.btnBlue, background: grupoId === g.id ? '#1d4ed8' : '#2563eb' }} onClick={() => loadAlumnos(g.id)}>{g.nombre}</button>
              ))}
            </div>
          </div>
          {grupoId && (
            <div style={s.card}>
              <h2 style={s.h2}>Alumnos - {gNombre(grupoId)}</h2>
              {loading ? <p>Cargando...</p> : (
                <table style={s.table}>
                  <thead><tr><th style={s.th}>Nombre</th><th style={s.th}>Edad</th><th style={s.th}>Presente</th><th style={s.th}>Ausente</th></tr></thead>
                  <tbody>
                    {alumnos.map(a => (
                      <tr key={a.id}>
                        <td style={s.td}>{a.nombre}</td>
                        <td style={s.td}>{a.edad}</td>
                        <td style={s.td}><button style={s.btnSI} onClick={() => marcar(a.id, true)}>SI</button></td>
                        <td style={s.td}><button style={s.btnNO} onClick={() => marcar(a.id, false)}>NO</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'admin' && !adminAuth && (
        <div style={{ maxWidth: 320, margin: '60px auto', textAlign: 'center' }}>
          <div style={s.card}>
            <h2 style={{ ...s.h2, textAlign: 'center' }}>Acceso restringido</h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>Ingresa el PIN de administrador</p>
            <input
              type='password'
              inputMode='numeric'
              placeholder='PIN'
              value={pinInput}
              onChange={e => { setPinInput(e.target.value); setPinError(false); }}
              onKeyDown={e => e.key === 'Enter' && checkPin()}
              style={{ ...s.input, width: '100%', textAlign: 'center', fontSize: 22, letterSpacing: 8, marginBottom: 8 }}
            />
            {pinError && <p style={{ color: '#dc2626', fontSize: 13, margin: '4px 0 8px' }}>PIN incorrecto</p>}
            <button style={{ ...s.btnBlue, width: '100%', padding: '10px 0' }} onClick={checkPin}>Entrar</button>
          </div>
        </div>
      )}
      {tab === 'admin' && adminAuth && (
        <div>
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}><h2 style={{ ...s.h2, margin: 0 }}>Grupos</h2>            <button style={{ ...s.btnGray, float: 'right', fontSize: 12, padding: '4px 10px' }} onClick={() => { setAdminAuth(false); setTab('asistencia'); }}>Cerrar sesion</button></div>
            <h3 style={s.h3}>Nuevo grupo</h3>
            <div style={s.row}>
              <div><label style={s.lbl}>Nombre</label><input style={s.input} placeholder='Grupo D - Viernes 6pm' value={fg.nombre} onChange={e => setFg({ ...fg, nombre: e.target.value })} /></div>
              <div><label style={s.lbl}>Inicio</label><input style={s.inputSm} type='time' value={fg.hora_inicio} onChange={e => setFg({ ...fg, hora_inicio: e.target.value })} /></div>
              <div><label style={s.lbl}>Fin</label><input style={s.inputSm} type='time' value={fg.hora_fin} onChange={e => setFg({ ...fg, hora_fin: e.target.value })} /></div>
              <button style={s.btnBlue} onClick={crearGrupo}>+ Agregar grupo</button>
            </div>
            <table style={s.table}>
              <thead><tr><th style={s.th}>Nombre</th><th style={s.th}>Horario</th><th style={s.th}>Accion</th></tr></thead>
              <tbody>
                {grupos.map(g => (
                  <tr key={g.id}>
                    <td style={s.td}>{g.nombre}</td>
                    <td style={s.td}>{g.hora_inicio} - {g.hora_fin}</td>
                    <td style={s.td}><button style={s.btnRed} onClick={() => borrarGrupo(g.id)}>Eliminar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={s.card}>
            <h2 style={s.h2}>Alumnos</h2>
            <h3 style={s.h3}>Dar de alta</h3>
            <div style={s.row}>
              <div><label style={s.lbl}>Nombre</label><input style={s.input} placeholder='Nombre completo' value={fa.nombre} onChange={e => setFa({ ...fa, nombre: e.target.value })} /></div>
              <div><label style={s.lbl}>Edad</label><input style={s.inputSm} type='number' min='4' max='18' value={fa.edad} onChange={e => setFa({ ...fa, edad: e.target.value })} /></div>
              <div><label style={s.lbl}>Grupo</label>
                <select style={s.sel} value={fa.grupo_id} onChange={e => setFa({ ...fa, grupo_id: e.target.value })}>
                  <option value=''>Seleccionar...</option>
                  {grupos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                </select>
              </div>
              <div><label style={s.lbl}>Tel. padre/madre</label><input style={s.input} placeholder='4611234567' value={fa.telefono_padre} onChange={e => setFa({ ...fa, telefono_padre: e.target.value })} /></div>
              <button style={s.btnBlue} onClick={crearAlumno}>+ Dar de alta</button>
            </div>
            <table style={s.table}>
              <thead><tr><th style={s.th}>Nombre</th><th style={s.th}>Edad</th><th style={s.th}>Grupo</th><th style={s.th}>Telefono</th><th style={s.th}>Acciones</th></tr></thead>
              <tbody>
                {todos.map(a => (
                  <tr key={a.id}>
                    {edit && edit.id === a.id ? (
                      <>
                        <td style={s.td}><input style={{ ...s.input, width: 140 }} value={edit.nombre} onChange={e => setEdit({ ...edit, nombre: e.target.value })} /></td>
                        <td style={s.td}><input style={s.inputSm} type='number' value={edit.edad} onChange={e => setEdit({ ...edit, edad: e.target.value })} /></td>
                        <td style={s.td}><select style={s.sel} value={edit.grupo_id} onChange={e => setEdit({ ...edit, grupo_id: e.target.value })}>{grupos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}</select></td>
                        <td style={s.td}><input style={{ ...s.input, width: 120 }} value={edit.telefono_padre || ''} onChange={e => setEdit({ ...edit, telefono_padre: e.target.value })} /></td>
                        <td style={s.td}><button style={s.btnGreen} onClick={guardar}>Guardar</button><button style={{ ...s.btnGray, marginLeft: 6 }} onClick={() => setEdit(null)}>Cancelar</button></td>
                      </>
                    ) : (
                      <>
                        <td style={s.td}>{a.nombre}</td>
                        <td style={s.td}>{a.edad}</td>
                        <td style={s.td}><span style={s.tag}>{gNombre(a.grupo_id)}</span></td>
                        <td style={s.td}>{a.telefono_padre || '-'}</td>
                        <td style={s.td}><button style={s.btnOrange} onClick={() => setEdit({ ...a })}>Editar</button><button style={{ ...s.btnRed, marginLeft: 6 }} onClick={() => borrarAlumno(a.id)}>Dar de baja</button></td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'historial' && (
        <div>
          <div style={s.card}>
            <h2 style={s.h2}>Historial de asistencia</h2>
            <div style={s.row}>
              <div><label style={s.lbl}>Grupo</label>
                <select style={s.sel} value={hGrupo} onChange={e => { setHGrupo(e.target.value); setHData([]); }}>
                  <option value=''>Seleccionar...</option>
                  {grupos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                </select>
              </div>
              <div><label style={s.lbl}>Ultimos (dias)</label>
                <select style={{ ...s.sel, width: 90 }} value={hDias} onChange={e => setHDias(e.target.value)}>
                  <option value='7'>7</option>
                  <option value='14'>14</option>
                  <option value='30'>30</option>
                  <option value='60'>60</option>
                  <option value='90'>90</option>
                </select>
              </div>
              <button style={s.btnBlue} onClick={loadHistorial}>Ver historial</button>
            </div>
          </div>
          {hLoading && <p style={{ color: '#64748b' }}>Cargando...</p>}
          {!hLoading && hData.length === 0 && hGrupo && <p style={{ color: '#94a3b8' }}>Sin registros en este periodo.</p>}
          {hData.map(row => {
            const total = row.presentes.length + row.ausentes.length;
            const pct = total ? Math.round((row.presentes.length / total) * 100) : 0;
            const pctColor = pct >= 80 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626';
            return (
              <div key={row.fecha} style={{ ...s.card, marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }} onClick={() => toggleExpand(row.fecha)}>
                  <span style={{ fontWeight: 'bold', color: '#1e293b', minWidth: 100 }}>{row.fecha}</span>
                  <span style={{ color: '#16a34a' }}>{row.presentes.length} presentes</span>
                  <span style={{ color: '#dc2626' }}>{row.ausentes.length} ausentes</span>
                  <span style={{ fontWeight: 'bold', color: pctColor }}>{pct}%</span>
                  <span style={{ color: '#94a3b8', fontSize: 12 }}>{hExpand[row.fecha] ? 'ocultar' : 'ver detalle'}</span>
                </div>
                {hExpand[row.fecha] && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ marginBottom: 6 }}>
                      <strong style={{ fontSize: 13, color: '#16a34a' }}>Presentes: </strong>
                      {row.presentes.map(n => <span key={n} style={s.tagGreen}>{n}</span>)}
                      {row.presentes.length === 0 && <span style={{ color: '#94a3b8', fontSize: 13 }}>ninguno</span>}
                    </div>
                    <div>
                      <strong style={{ fontSize: 13, color: '#dc2626' }}>Ausentes: </strong>
                      {row.ausentes.map(n => <span key={n} style={s.tagRed}>{n}</span>)}
                      {row.ausentes.length === 0 && <span style={{ color: '#94a3b8', fontSize: 13 }}>ninguno</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
