import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const s = {
  app: { fontFamily: 'sans-serif', maxWidth: 900, margin: '0 auto', padding: 16 },
  tabs: { display: 'flex', gap: 8, marginBottom: 24, borderBottom: '2px solid #eee', paddingBottom: 8 },
  tab: { padding: '8px 20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, borderRadius: '6px 6px 0 0', color: '#555' },
  tabActive: { padding: '8px 20px', border: 'none', background: '#2563eb', cursor: 'pointer', fontSize: 16, borderRadius: '6px 6px 0 0', color: '#fff', fontWeight: 'bold' },
  card: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, marginBottom: 16 },
  h2: { margin: '0 0 12px 0', fontSize: 18, color: '#1e293b' },
  h3: { margin: '0 0 10px 0', fontSize: 15, color: '#334155' },
  row: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 8 },
  input: { padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 14, width: 160 },
  inputSm: { padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 14, width: 80 },
  btnPrimary: { padding: '7px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 },
  btnSuccess: { padding: '5px 12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  btnDanger: { padding: '5px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  btnWarning: { padding: '5px 12px', background: '#d97706', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  btnGray: { padding: '5px 12px', background: '#64748b', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  btnAsist: { padding: '4px 10px', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold', fontSize: 13 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: { background: '#f1f5f9', padding: '8px 10px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#475569' },
  td: { padding: '8px 10px', borderBottom: '1px solid #e2e8f0', color: '#1e293b' },
  label: { fontSize: 12, color: '#64748b', display: 'block', marginBottom: 2 },
  select: { padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 14, background: '#fff' },
  tag: { display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontSize: 12, background: '#dbeafe', color: '#1d4ed8' },
  msg: { padding: '8px 12px', borderRadius: 6, marginBottom: 12, fontSize: 14 },
};

export default function App() {
  const [tab, setTab] = useState('asistencia');
  const [grupos, setGrupos] = useState([]);
  const [grupoId, setGrupoId] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [todosAlumnos, setTodosAlumnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [fmtGrupo, setFmtGrupo] = useState({ nombre: '', hora_inicio: '', hora_fin: '' });
  const [fmtAlumno, setFmtAlumno] = useState({ nombre: '', edad: '', grupo_id: '', telefono_padre: '' });
  const [editando, setEditando] = useState(null);

  const flash = (text, type = 'ok') => { setMsg({ text, type }); setTimeout(() => setMsg(null), 3000); };

  const fetchGrupos = async () => { try { const r = await fetch(`${API_URL}/grupos`); setGrupos(await r.json()); } catch(e) { flash('Error cargando grupos','err'); } };
  const fetchAlumnos = async (id) => { try { setLoading(true); const r = await fetch(`${API_URL}/alumnos/grupo/${id}`); setAlumnos(await r.json()); setGrupoId(id); } catch(e) { flash('Error','err'); } finally { setLoading(false); } };
  const fetchTodosAlumnos = async () => { try { const r = await fetch(`${API_URL}/alumnos`); setTodosAlumnos(await r.json()); } catch(e) { flash('Error','err'); } };
  const marcarAsistencia = async (alumnoId, presente) => { try { await fetch(`${API_URL}/asistencia`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({alumno_id:alumnoId,grupo_id:grupoId,presente}) }); fetchAlumnos(grupoId); } catch(e) { flash('Error','err'); } };

  const crearGrupo = async () => {
    if (!fmtGrupo.nombre||!fmtGrupo.hora_inicio||!fmtGrupo.hora_fin) return flash('Completa todos los campos','err');
    try { await fetch(`${API_URL}/grupos`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(fmtGrupo)}); setFmtGrupo({nombre:'',hora_inicio:'',hora_fin:''}); fetchGrupos(); flash('Grupo creado'); } catch(e){flash('Error','err');}
  };
  const eliminarGrupo = async (id) => {
    if (!window.confirm('¿Eliminar este grupo?')) return;
    try { await fetch(`${API_URL}/grupos/${id}`,{method:'DELETE'}); fetchGrupos(); fetchTodosAlumnos(); flash('Grupo eliminado'); } catch(e){flash('Error','err');}
  };
  const crearAlumno = async () => {
    if (!fmtAlumno.nombre||!fmtAlumno.edad||!fmtAlumno.grupo_id) return flash('Nombre, edad y grupo son obligatorios','err');
    try { await fetch(`${API_URL}/alumnos`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...fmtAlumno,edad:parseInt(fmtAlumno.edad),grupo_id:parseInt(fmtAlumno.grupo_id)})}); setFmtAlumno({nombre:'',edad:'',grupo_id:'',telefono_padre:''}); fetchTodosAlumnos(); flash('Alumno dado de alta'); } catch(e){flash('Error','err');}
  };
  const eliminarAlumno = async (id) => {
    if (!window.confirm('¿Dar de baja a este alumno?')) return;
    try { await fetch(`${API_URL}/alumnos/${id}`,{method:'DELETE'}); fetchTodosAlumnos(); flash('Alumno dado de baja'); } catch(e){flash('Error','err');}
  };
  const guardarEdicion = async () => {
    try { await fetch(`${API_URL}/alumnos/${editando.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({nombre:editando.nombre,edad:parseInt(editando.edad),grupo_id:parseInt(editando.grupo_id),telefono_padre:editando.telefono_padre||''})}); setEditando(null); fetchTodosAlumnos(); flash('Alumno actualizado'); } catch(e){flash('Error','err');}
  };

  useEffect(()=>{fetchGrupos();},[]);
  useEffect(()=>{ if(tab==='admin'){fetchGrupos();fetchTodosAlumnos();} },[tab]);

  const grupoNombre = (id) => grupos.find(g=>g.id===id)?.nombre || `Grupo ${id}`;

  return (
    <div style={s.app}>
      <h1 style={{color:'#1e293b',marginBottom:4}}>Asistencia Algorithmics</h1>
      {msg && <div style={{...s.msg,background:msg.type==='ok'?'#dcfce7':'#fee2e2',color:msg.type==='ok'?'#166534':'#991b1b'}}>{msg.text}</div>}
      <div style={s.tabs}>
        <button style={tab==='asistencia'?s.tabActive:s.tab} onClick={()=>setTab('asistencia')}>📋 Asistencia</button>
        <button style={tab==='admin'?s.tabActive:s.tab} onClick={()=>setTab('admin')}>⚙️ Administrar</button>
      </div>

      {tab==='asistencia' && (
        <div>
          <div style={s.card}>
            <h2 style={s.h2}>Grupos</h2>
            <div style={s.row}>{grupos.map(g=>(
              <button key={g.id} style={{...s.btnPrimary,background:grupoId===g.id?'#1d4ed8':'#2563eb'}} onClick={()=>fetchAlumnos(g.id)}>{g.nombre}</button>
            ))}</div>
          </div>
          {grupoId && (
            <div style={s.card}>
              <h2 style={s.h2}>Alumnos — {grupoNombre(grupoId)}</h2>
              {loading?<p>Cargando...</p>:(
                <table style={s.table}><thead><tr><th style={s.th}>Nombre</th><th style={s.th}>Edad</th><th style={s.th}>Presente</th><th style={s.th}>Ausente</th></tr></thead>
                <tbody>{alumnos.map(a=>(
                  <tr key={a.id}>
                    <td style={s.td}>{a.nombre}</td><td style={s.td}>{a.edad}</td>
                    <td style={s.td}><button style={{...s.btnAsist,background:'#bbf7d0',color:'#166534'}} onClick={()=>marcarAsistencia(a.id,true)}>✓ SI</button></td>
                    <td style={s.td}><button style={{...s.btnAsist,background:'#fecaca',color:'#991b1b'}} onClick={()=>marcarAsistencia(a.id,false)}>✗ NO</button></td>
                  </tr>
                ))}</tbody></table>
              )}
            </div>
          )}
        </div>
      )}

      {tab==='admin' && (
        <div>
          <div style={s.card}>
            <h2 style={s.h2}>Grupos</h2>
            <h3 style={s.h3}>Nuevo grupo</h3>
            <div style={s.row}>
              <div><label style={s.label}>Nombre</label><input style={s.input} placeholder="Ej: Grupo D - Viernes 6pm" value={fmtGrupo.nombre} onChange={e=>setFmtGrupo({...fmtGrupo,nombre:e.target.value})} /></div>
              <div><label style={s.label}>Hora inicio</label><input style={s.inputSm} type="time" value={fmtGrupo.hora_inicio} onChange={e=>setFmtGrupo({...fmtGrupo,hora_inicio:e.target.value})} /></div>
              <div><label style={s.label}>Hora fin</label><input style={s.inputSm} type="time" value={fmtGrupo.hora_fin} onChange={e=>setFmtGrupo({...fmtGrupo,hora_fin:e.target.value})} /></div>
              <button style={s.btnPrimary} onClick={crearGrupo}>+ Agregar</button>
            </div>
            <table style={{...s.table,marginTop:8}}><thead><tr><th style={s.th}>Nombre</th><th style={s.th}>Horario</th><th style={s.th}>Acción</th></tr></thead>
            <tbody>{grupos.map(g=>(
              <tr key={g.id}><td style={s.td}>{g.nombre}</td><td style={s.td}>{g.hora_inicio} – {g.hora_fin}</td><td style={s.td}><button style={s.btnDanger} onClick={()=>eliminarGrupo(g.id)}>Eliminar</button></td></tr>
            ))}</tbody></table>
          </div>

          <div style={s.card}>
            <h2 style={s.h2}>Alumnos</h2>
            <h3 style={s.h3}>Dar de alta</h3>
            <div style={s.row}>
              <div><label style={s.label}>Nombre</label><input style={s.input} placeholder="Nombre completo" value={fmtAlumno.nombre} onChange={e=>setFmtAlumno({...fmtAlumno,nombre:e.target.value})} /></div>
              <div><label style={s.label}>Edad</label><input style={s.inputSm} type="number" min="4" max="18" value={fmtAlumno.edad} onChange={e=>setFmtAlumno({...fmtAlumno,edad:e.target.value})} /></div>
              <div><label style={s.label}>Grupo</label><select style={s.select} value={fmtAlumno.grupo_id} onChange={e=>setFmtAlumno({...fmtAlumno,grupo_id:e.target.value})}><option value="">Seleccionar...</option>{grupos.map(g=><option key={g.id} value={g.id}>{g.nombre}</option>)}</select></div>
              <div><label style={s.label}>Tel. padre/madre</label><input style={s.input} placeholder="4611234567" value={fmtAlumno.telefono_padre} onChange={e=>setFmtAlumno({...fmtAlumno,telefono_padre:e.target.value})} /></div>
              <button style={s.btnPrimary} onClick={crearAlumno}>+ Dar de alta</button>
            </div>
            <table style={{...s.table,marginTop:8}}><thead><tr><th style={s.th}>Nombre</th><th style={s.th}>Edad</th><th style={s.th}>Grupo</th><th style={s.th}>Teléfono</th><th style={s.th}>Acciones</th></tr></thead>
            <tbody>{todosAlumnos.map(a=>(
              <tr key={a.id}>
                {editando?.id===a.id?(
                  <>
                    <td style={s.td}><input style={{...s.input,width:140}} value={editando.nombre} onChange={e=>setEditando({...editando,nombre:e.target.value})} /></td>
                    <td style={s.td}><input style={s.inputSm} type="number" value={editando.edad} onChange={e=>setEditando({...editando,edad:e.target.value})} /></td>
                    <td style={s.td}><select style={s.select} value={editando.grupo_id} onChange={e=>setEditando({...editando,grupo_id:e.target.value})}>{grupos.map(g=><option key={g.id} value={g.id}>{g.nombre}</option>)}</select></td>
                    <td style={s.td}><input style={{...s.input,width:120}} value={editando.telefono_padre||''} onChange={e=>setEditando({...editando,telefono_padre:e.target.value})} /></td>
                    <td style={s.td}><div style={{display:'flex',gap:6}}><button style={s.btnSuccess} onClick={guardarEdicion}>Guardar</button><button style={s.btnGray} onClick={()=>setEditando(null)}>Cancelar</button></div></td>
                  </>
                ):(
                  <>
                    <td style={s.td}>{a.nombre}</td>
                    <td style={s.td}>{a.edad}</td>
                    <td style={s.td}><span style={s.tag}>{grupoNombre(a.grupo_id)}</span></td>
                    <td style={s.td}>{a.telefono_padre||'—'}</td>
                    <td style={s.td}><div style={{display:'flex',gap:6}}><button style={s.btnWarning} onClick={()=>setEditando({...a})}>Editar</button><button style={s.btnDanger} onClick={()=>eliminarAlumno(a.id)}>Dar de baja</button></div></td>
                  </>
                )}
              </tr>
            ))}</tbody></table>
          </div>
        </div>
      )}
    </div>
  );
}
