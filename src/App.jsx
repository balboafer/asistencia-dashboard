import { useState, useEffect } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const ADMIN_PIN = process.env.REACT_APP_ADMIN_PIN || '1234';

export default function App() {
  const [tab, setTab] = useState('asistencia');
  const [grupos, setGrupos] = useState([]);
  const [grupoId, setGrupoId] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [fg, setFg] = useState({ nombre: '', hora_inicio: '', hora_fin: '' });
  const [fa, setFa] = useState({ nombre: '', edad: '', grupo_id: '', telefono_padre: '', email_padre: '', telegram_chat_id: '' });
  const [edit, setEdit] = useState(null);
  const [hGrupo, setHGrupo] = useState('');
  const [hDias, setHDias] = useState('30');
  const [hData, setHData] = useState([]);
  const [hExpand, setHExpand] = useState({});
  const [hLoading, setHLoading] = useState(false);
  const [adminAuth, setAdminAuth] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const showMsg = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3500);
  };

  const loadGrupos = async () => {
    const r = await fetch(`${API}/grupos`);
    setGrupos(await r.json());
  };

  const loadAlumnos = async (gid) => {
    setLoading(true);
    const r = await fetch(`${API}/alumnos/grupo/${gid}`);
    const data = await r.json();
    setAlumnos(data.map(a => ({ ...a, presente: null })));
    setLoading(false);
  };

  const loadTodos = async () => {
    const r = await fetch(`${API}/alumnos`);
    setTodos(await r.json());
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadGrupos(); }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (tab === 'admin') { loadGrupos(); loadTodos(); } }, [tab]);

  useEffect(() => { if (grupoId) loadAlumnos(grupoId); }, [grupoId]);

  const checkPin = () => {
    if (pinInput === ADMIN_PIN) { setAdminAuth(true); setPinError(false); setPinInput(''); }
    else { setPinError(true); setPinInput(''); }
  };

  const togglePresente = (id, val) => {
    setAlumnos(prev => prev.map(a => a.id === id ? { ...a, presente: val } : a));
  };

  const guardarAsistencia = async () => {
    const fecha = new Date().toISOString().split('T')[0];
    let ok = 0, fail = 0;
    for (const a of alumnos) {
      if (a.presente === null) continue;
      const r = await fetch(`${API}/asistencia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alumno_id: a.id, presente: a.presente, fecha }),
      });
      r.ok ? ok++ : fail++;
    }
    showMsg(`Guardado: ${ok} registros${fail ? `, ${fail} errores` : ''}`, fail === 0);
  };

  const crearGrupo = async () => {
    if (!fg.nombre || !fg.hora_inicio || !fg.hora_fin) return showMsg('Completa todos los campos del grupo', false);
    const r = await fetch(`${API}/grupos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fg),
    });
    if (r.ok) { showMsg('Grupo creado'); setFg({ nombre: '', hora_inicio: '', hora_fin: '' }); loadGrupos(); }
    else showMsg('Error al crear grupo', false);
  };

  const eliminarGrupo = async (id) => {
    if (!window.confirm('¿Eliminar grupo?')) return;
    const r = await fetch(`${API}/grupos/${id}`, { method: 'DELETE' });
    if (r.ok) { showMsg('Grupo eliminado'); loadGrupos(); }
    else showMsg('Error al eliminar', false);
  };

  const crearAlumno = async () => {
    if (!fa.nombre || !fa.grupo_id) return showMsg('Nombre y grupo son requeridos', false);
    const r = await fetch(`${API}/alumnos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: fa.nombre,
        edad: fa.edad ? parseInt(fa.edad) : null,
        grupo_id: parseInt(fa.grupo_id),
        telefono_padre: fa.telefono_padre || null,
        email_padre: fa.email_padre || null,
        telegram_chat_id: fa.telegram_chat_id || null,
      }),
    });
    if (r.ok) {
      showMsg('Alumno creado');
      setFa({ nombre: '', edad: '', grupo_id: '', telefono_padre: '', email_padre: '', telegram_chat_id: '' });
      loadTodos();
    } else showMsg('Error al crear alumno', false);
  };

  const eliminarAlumno = async (id) => {
    if (!window.confirm('¿Eliminar alumno?')) return;
    const r = await fetch(`${API}/alumnos/${id}`, { method: 'DELETE' });
    if (r.ok) { showMsg('Alumno eliminado'); loadTodos(); }
    else showMsg('Error al eliminar', false);
  };

  const saveEdit = async () => {
    if (!edit) return;
    const r = await fetch(`${API}/alumnos/${edit.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: edit.nombre,
        edad: edit.edad ? parseInt(edit.edad) : null,
        grupo_id: edit.grupo_id ? parseInt(edit.grupo_id) : null,
        telefono_padre: edit.telefono_padre || null,
        email_padre: edit.email_padre || null,
        telegram_chat_id: edit.telegram_chat_id || null,
      }),
    });
    if (r.ok) { showMsg('Alumno actualizado'); setEdit(null); loadTodos(); }
    else showMsg('Error al actualizar', false);
  };

  const loadHistorial = async () => {
    if (!hGrupo) return showMsg('Selecciona un grupo', false);
    setHLoading(true);
    const r = await fetch(`${API}/historial/grupo/${hGrupo}?dias=${hDias}`);
    const data = await r.json();
    setHData(data);
    setHLoading(false);
  };

  const inp = { padding: '0.4rem 0.6rem', border: '1px solid #ccc', borderRadius: 6, fontSize: '0.9rem', outline: 'none' };
  const btn = (extra = {}) => ({ padding: '0.4rem 0.9rem', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.9rem', ...extra });
  const row = { display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' };
  const card = { background: '#fff', borderRadius: 10, padding: '1.2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', marginBottom: '1rem' };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#f5f5f5', minHeight: '100vh', padding: '1rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 1rem', fontSize: '1.4rem', color: '#333' }}>📋 Asistencia Algorithmics</h1>

        {msg && (
          <div style={{ padding: '0.6rem 1rem', borderRadius: 8, marginBottom: '1rem', background: msg.ok ? '#d4edda' : '#f8d7da', color: msg.ok ? '#155724' : '#721c24' }}>
            {msg.text}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {['asistencia', 'historial', 'admin'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={btn({ background: tab === t ? '#0070f3' : '#e0e0e0', color: tab === t ? '#fff' : '#333', textTransform: 'capitalize' })}>
              {t === 'asistencia' ? '✅ Asistencia' : t === 'historial' ? '📊 Historial' : '⚙️ Administrar'}
            </button>
          ))}
        </div>

        {/* ASISTENCIA TAB */}
        {tab === 'asistencia' && (
          <div style={card}>
            <div style={row}>
              <select value={grupoId || ''} onChange={e => setGrupoId(e.target.value || null)} style={{ ...inp, flex: 1 }}>
                <option value=''>Selecciona grupo...</option>
                {grupos.map(g => <option key={g.id} value={g.id}>{g.nombre} ({g.hora_inicio} - {g.hora_fin})</option>)}
              </select>
            </div>

            {loading && <p style={{ color: '#666' }}>Cargando...</p>}

            {alumnos.length > 0 && (
              <>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                  <thead>
                    <tr style={{ background: '#f0f0f0' }}>
                      <th style={{ textAlign: 'left', padding: '0.5rem' }}>Alumno</th>
                      <th style={{ padding: '0.5rem' }}>¿Presente?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alumnos.map(a => (
                      <tr key={a.id} style={{ borderBottom: '1px solid #eee', background: a.presente === true ? '#f0fff4' : a.presente === false ? '#fff5f5' : '#fff' }}>
                        <td style={{ padding: '0.5rem' }}>{a.nombre}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                          <button onClick={() => togglePresente(a.id, true)} style={btn({ background: a.presente === true ? '#28a745' : '#e0e0e0', color: a.presente === true ? '#fff' : '#333', marginRight: 4 })}>Sí</button>
                          <button onClick={() => togglePresente(a.id, false)} style={btn({ background: a.presente === false ? '#dc3545' : '#e0e0e0', color: a.presente === false ? '#fff' : '#333' })}>No</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button onClick={guardarAsistencia} style={btn({ background: '#0070f3', color: '#fff', padding: '0.6rem 1.5rem' })}>
                  💾 Guardar Asistencia
                </button>
              </>
            )}

            {grupoId && !loading && alumnos.length === 0 && (
              <p style={{ color: '#666' }}>No hay alumnos en este grupo.</p>
            )}
          </div>
        )}

        {/* HISTORIAL TAB */}
        {tab === 'historial' && (
          <div style={card}>
            <div style={row}>
              <select value={hGrupo} onChange={e => setHGrupo(e.target.value)} style={{ ...inp, flex: 1 }}>
                <option value=''>Selecciona grupo...</option>
                {grupos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
              </select>
              <select value={hDias} onChange={e => setHDias(e.target.value)} style={{ ...inp, width: 110 }}>
                <option value='7'>7 días</option>
                <option value='14'>14 días</option>
                <option value='30'>30 días</option>
                <option value='60'>60 días</option>
              </select>
              <button onClick={loadHistorial} style={btn({ background: '#0070f3', color: '#fff' })}>Ver</button>
            </div>

            {hLoading && <p style={{ color: '#666' }}>Cargando historial...</p>}

            {hData.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f0f0f0' }}>
                    <th style={{ textAlign: 'left', padding: '0.4rem' }}>Alumno</th>
                    <th style={{ padding: '0.4rem', textAlign: 'center' }}>Presentes</th>
                    <th style={{ padding: '0.4rem', textAlign: 'center' }}>Faltas</th>
                    <th style={{ padding: '0.4rem', textAlign: 'center' }}>%</th>
                    <th style={{ padding: '0.4rem' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {hData.map(item => {
                    const pct = item.total > 0 ? Math.round((item.presentes / item.total) * 100) : 0;
                    const expanded = hExpand[item.alumno_id];
                    return (
                      <>
                        <tr key={item.alumno_id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '0.4rem' }}>{item.nombre}</td>
                          <td style={{ padding: '0.4rem', textAlign: 'center', color: '#28a745' }}>{item.presentes}</td>
                          <td style={{ padding: '0.4rem', textAlign: 'center', color: '#dc3545' }}>{item.faltas}</td>
                          <td style={{ padding: '0.4rem', textAlign: 'center' }}>
                            <span style={{ background: pct >= 80 ? '#d4edda' : pct >= 60 ? '#fff3cd' : '#f8d7da', padding: '2px 8px', borderRadius: 10, fontSize: '0.8rem' }}>{pct}%</span>
                          </td>
                          <td style={{ padding: '0.4rem' }}>
                            {item.registros && item.registros.length > 0 && (
                              <button onClick={() => setHExpand(prev => ({ ...prev, [item.alumno_id]: !expanded }))} style={btn({ background: '#e0e0e0', fontSize: '0.75rem', padding: '2px 8px' })}>
                                {expanded ? '▲' : '▼'}
                              </button>
                            )}
                          </td>
                        </tr>
                        {expanded && item.registros && item.registros.map(r => (
                          <tr key={r.fecha} style={{ background: '#fafafa', fontSize: '0.82rem' }}>
                            <td colSpan={5} style={{ padding: '0.2rem 0.4rem 0.2rem 1.5rem', color: '#555' }}>
                              {r.fecha} — <span style={{ color: r.presente ? '#28a745' : '#dc3545' }}>{r.presente ? 'Presente' : 'Falta'}</span>
                            </td>
                          </tr>
                        ))}
                      </>
                    );
                  })}
                </tbody>
              </table>
            )}

            {!hLoading && hGrupo && hData.length === 0 && (
              <p style={{ color: '#666' }}>Sin registros en este período.</p>
            )}
          </div>
        )}

        {/* ADMIN TAB */}
        {tab === 'admin' && (
          <div style={card}>
            {!adminAuth ? (
              <div style={{ maxWidth: 280 }}>
                <p style={{ marginBottom: '0.5rem', color: '#555' }}>PIN de administrador:</p>
                <div style={row}>
                  <input type='password' value={pinInput} onChange={e => setPinInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && checkPin()}
                    style={{ ...inp, flex: 1 }} placeholder='PIN' />
                  <button onClick={checkPin} style={btn({ background: '#0070f3', color: '#fff' })}>Entrar</button>
                </div>
                {pinError && <p style={{ color: '#dc3545', fontSize: '0.85rem' }}>PIN incorrecto</p>}
              </div>
            ) : (
              <>
                {/* Grupos */}
                <h3>Grupos</h3>
                <div style={row}>
                  <input placeholder='Nombre grupo*' value={fg.nombre} onChange={e => setFg({ ...fg, nombre: e.target.value })} style={{ ...inp, flex: 2 }} />
                  <input placeholder='Hora inicio' value={fg.hora_inicio} onChange={e => setFg({ ...fg, hora_inicio: e.target.value })} style={{ ...inp, flex: 1 }} />
                  <input placeholder='Hora fin' value={fg.hora_fin} onChange={e => setFg({ ...fg, hora_fin: e.target.value })} style={{ ...inp, flex: 1 }} />
                  <button onClick={crearGrupo} style={btn({ background: '#28a745', color: '#fff' })}>+</button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                  <thead><tr style={{ background: '#f0f0f0' }}><th style={{ textAlign: 'left', padding: '0.4rem' }}>Nombre</th><th style={{ padding: '0.4rem' }}>Horario</th><th></th></tr></thead>
                  <tbody>
                    {grupos.map(g => (
                      <tr key={g.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '0.4rem' }}>{g.nombre}</td>
                        <td style={{ padding: '0.4rem', textAlign: 'center' }}>{g.hora_inicio} - {g.hora_fin}</td>
                        <td style={{ padding: '0.4rem' }}><button onClick={() => eliminarGrupo(g.id)} style={btn({ background: '#dc3545', color: '#fff', fontSize: '0.8rem' })}>X</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Alumnos */}
                <h3>Alumnos</h3>
                <div style={{ ...row, flexWrap: 'wrap' }}>
                  <input placeholder='Nombre*' value={fa.nombre} onChange={e => setFa({ ...fa, nombre: e.target.value })} style={{ ...inp, flex: '1 1 140px' }} />
                  <input placeholder='Edad' value={fa.edad} onChange={e => setFa({ ...fa, edad: e.target.value })} style={{ ...inp, flex: '0 1 70px' }} />
                  <select value={fa.grupo_id} onChange={e => setFa({ ...fa, grupo_id: e.target.value })} style={{ ...inp, flex: '1 1 120px' }}>
                    <option value=''>Grupo*</option>
                    {grupos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                  </select>
                  <input placeholder='Tel padre' value={fa.telefono_padre} onChange={e => setFa({ ...fa, telefono_padre: e.target.value })} style={{ ...inp, flex: '1 1 120px' }} />
                  <input placeholder='Email padre' value={fa.email_padre} onChange={e => setFa({ ...fa, email_padre: e.target.value })} style={{ ...inp, flex: '1 1 160px' }} />
                  <input placeholder='Telegram chat_id' value={fa.telegram_chat_id} onChange={e => setFa({ ...fa, telegram_chat_id: e.target.value })} style={{ ...inp, flex: '1 1 140px' }} />
                  <button onClick={crearAlumno} style={btn({ background: '#28a745', color: '#fff', alignSelf: 'flex-start' })}>+ Alta</button>
                </div>

                {/* Edit modal */}
                {edit && (
                  <div style={{ background: '#f8f8f8', border: '1px solid #ddd', borderRadius: 8, padding: '1rem', marginBottom: '1rem' }}>
                    <strong>Editar alumno</strong>
                    <div style={{ ...row, flexWrap: 'wrap', marginTop: 8 }}>
                      <input placeholder='Nombre' value={edit.nombre || ''} onChange={e => setEdit({ ...edit, nombre: e.target.value })} style={{ ...inp, flex: '1 1 140px' }} />
                      <input placeholder='Edad' value={edit.edad || ''} onChange={e => setEdit({ ...edit, edad: e.target.value })} style={{ ...inp, flex: '0 1 70px' }} />
                      <select value={edit.grupo_id || ''} onChange={e => setEdit({ ...edit, grupo_id: e.target.value })} style={{ ...inp, flex: '1 1 120px' }}>
                        <option value=''>Grupo</option>
                        {grupos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                      </select>
                      <input placeholder='Tel padre' value={edit.telefono_padre || ''} onChange={e => setEdit({ ...edit, telefono_padre: e.target.value })} style={{ ...inp, flex: '1 1 120px' }} />
                      <input placeholder='Email padre' value={edit.email_padre || ''} onChange={e => setEdit({ ...edit, email_padre: e.target.value })} style={{ ...inp, flex: '1 1 160px' }} />
                      <input placeholder='Telegram chat_id' value={edit.telegram_chat_id || ''} onChange={e => setEdit({ ...edit, telegram_chat_id: e.target.value })} style={{ ...inp, flex: '1 1 140px' }} />
                    </div>
                    <div style={row}>
                      <button onClick={saveEdit} style={btn({ background: '#0070f3', color: '#fff' })}>Guardar</button>
                      <button onClick={() => setEdit(null)} style={btn({ background: '#e0e0e0' })}>Cancelar</button>
                    </div>
                  </div>
                )}

                {/* Alumnos table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: '#f0f0f0' }}>
                      <th style={{ textAlign: 'left', padding: '0.4rem' }}>Nombre</th>
                      <th style={{ padding: '0.4rem' }}>Grupo</th>
                      <th style={{ padding: '0.4rem' }}>Tel</th>
                      <th style={{ padding: '0.4rem' }}>Email</th>
                      <th style={{ padding: '0.4rem' }}>TG</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {todos.map(a => {
                      const g = grupos.find(x => x.id === a.grupo_id);
                      return (
                        <tr key={a.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '0.4rem' }}>{a.nombre}</td>
                          <td style={{ padding: '0.4rem', textAlign: 'center' }}>{g ? g.nombre : a.grupo_id}</td>
                          <td style={{ padding: '0.4rem', textAlign: 'center' }}>{a.telefono_padre ? '✓' : '-'}</td>
                          <td style={{ padding: '0.4rem', textAlign: 'center' }}>{a.email_padre ? '✓' : '-'}</td>
                          <td style={{ padding: '0.4rem', textAlign: 'center' }}>{a.telegram_chat_id ? '✓' : '-'}</td>
                          <td style={{ padding: '0.4rem' }}>
                            <button onClick={() => setEdit({ ...a })} style={btn({ background: '#0070f3', color: '#fff', fontSize: '0.75rem', marginRight: 4 })}>✎</button>
                            <button onClick={() => eliminarAlumno(a.id)} style={btn({ background: '#dc3545', color: '#fff', fontSize: '0.75rem' })}>✕</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </>
            )
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
