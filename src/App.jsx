import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function AsistenciaDashboard() {
  const [grupos, setGrupos] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [asistenciaHoy, setAsistenciaHoy] = useState([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const [vista, setVista] = useState('marcador'); // 'marcador', 'historial', 'ausentes'
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formGrupo, setFormGrupo] = useState({ nombre: '', hora_inicio: '', hora_fin: '' });
  const [formAlumno, setFormAlumno] = useState({ nombre: '', edad: '', telefono_padre: '' });
  const [historial, setHistorial] = useState([]);

  // Cargar grupos al montar
  useEffect(() => {
    cargarGrupos();
  }, []);

  const cargarGrupos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/grupos`);
      const data = await res.json();
      setGrupos(data);
    } catch (err) {
      console.error('Error cargando grupos:', err);
      alert('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const cargarAlumnosGrupo = async (grupoId) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/alumnos/grupo/${grupoId}`);
      const data = await res.json();
      setAlumnos(data);
      setGrupoSeleccionado(grupoId);
      
      // Cargar asistencia de hoy
      const hoy = new Date().toISOString().split('T')[0];
      const resAsistencia = await fetch(
        `${API_URL}/asistencia/grupo/${grupoId}/fecha/${hoy}`
      );
      const dataAsistencia = await resAsistencia.json();
      setAsistenciaHoy(dataAsistencia);
    } catch (err) {
      console.error('Error cargando alumnos:', err);
    } finally {
      setLoading(false);
    }
  };

  const crearGrupo = async (e) => {
    e.preventDefault();
    if (!formGrupo.nombre || !formGrupo.hora_inicio || !formGrupo.hora_fin) {
      alert('Llena todos los campos');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/grupos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formGrupo)
      });
      if (res.ok) {
        setFormGrupo({ nombre: '', hora_inicio: '', hora_fin: '' });
        cargarGrupos();
        alert('Grupo creado ✅');
      }
    } catch (err) {
      console.error('Error creando grupo:', err);
    }
  };

  const crearAlumno = async (e) => {
    e.preventDefault();
    if (!formAlumno.nombre || !formAlumno.edad || !grupoSeleccionado) {
      alert('Llena todos los campos');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/alumnos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formAlumno,
          edad: parseInt(formAlumno.edad),
          grupo_id: grupoSeleccionado
        })
      });
      if (res.ok) {
        setFormAlumno({ nombre: '', edad: '', telefono_padre: '' });
        cargarAlumnosGrupo(grupoSeleccionado);
        alert('Alumno creado ✅');
      }
    } catch (err) {
      console.error('Error creando alumno:', err);
    }
  };

  const marcarAsistencia = async (alumnoId, presente) => {
    try {
      const res = await fetch(`${API_URL}/asistencia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alumno_id: alumnoId,
          grupo_id: grupoSeleccionado,
          presente: presente
        })
      });
      if (res.ok) {
        cargarAlumnosGrupo(grupoSeleccionado);
      }
    } catch (err) {
      console.error('Error marcando asistencia:', err);
    }
  };

  const cargarHistorial = async (alumnoId) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/historial/${alumnoId}`);
      const data = await res.json();
      setHistorial(data.registros);
      setAlumnoSeleccionado(alumnoId);
      setVista('historial');
    } catch (err) {
      console.error('Error cargando historial:', err);
    } finally {
      setLoading(false);
    }
  };

  const obtenerAusentes = async () => {
    try {
      const hoy = new Date().toISOString().split('T')[0];
      const res = await fetch(`${API_URL}/ausentes/grupo/${grupoSeleccionado}/fecha/${hoy}`);
      const data = await res.json();
      alert(
        `Total: ${data.total_alumnos} | Ausentes: ${data.ausentes_count}\n\n` +
        data.ausentes.map(a => a.nombre).join('\n')
      );
    } catch (err) {
      console.error('Error obteniendo ausentes:', err);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>📚 Asistencia Algorithmics</h1>
        <p style={styles.subtitle}>Control de asistencia en tiempo real</p>
      </header>

      {/* SIDEBAR - GRUPOS */}
      <aside style={styles.sidebar}>
        <h3>Grupos</h3>
        {grupos.length === 0 ? (
          <p style={styles.emptyText}>Sin grupos aún</p>
        ) : (
          <div style={styles.gruposList}>
            {grupos.map(g => (
              <button
                key={g.id}
                onClick={() => cargarAlumnosGrupo(g.id)}
                style={{
                  ...styles.grupoBtn,
                  backgroundColor: grupoSeleccionado === g.id ? '#4CAF50' : '#ddd'
                }}
              >
                <strong>{g.nombre}</strong>
                <small>{g.hora_inicio} - {g.hora_fin}</small>
              </button>
            ))}
          </div>
        )}

        <hr />

        <h4>Crear nuevo grupo</h4>
        <form onSubmit={crearGrupo} style={styles.form}>
          <input
            type="text"
            placeholder="Nombre grupo"
            value={formGrupo.nombre}
            onChange={e => setFormGrupo({...formGrupo, nombre: e.target.value})}
          />
          <input
            type="time"
            value={formGrupo.hora_inicio}
            onChange={e => setFormGrupo({...formGrupo, hora_inicio: e.target.value})}
          />
          <input
            type="time"
            value={formGrupo.hora_fin}
            onChange={e => setFormGrupo({...formGrupo, hora_fin: e.target.value})}
          />
          <button type="submit">Crear</button>
        </form>
      </aside>

      {/* MAIN CONTENT */}
      <main style={styles.main}>
        {!grupoSeleccionado ? (
          <div style={styles.welcome}>
            <h2>👈 Selecciona un grupo para empezar</h2>
          </div>
        ) : (
          <>
            {/* TABS */}
            <div style={styles.tabs}>
              <button
                onClick={() => setVista('marcador')}
                style={{...styles.tab, backgroundColor: vista === 'marcador' ? '#4CAF50' : '#eee'}}
              >
                ✅ Marcador
              </button>
              <button
                onClick={() => setVista('ausentes')}
                style={{...styles.tab, backgroundColor: vista === 'ausentes' ? '#f44336' : '#eee'}}
              >
                ❌ Ausentes
              </button>
            </div>

            {/* VISTA: MARCADOR */}
            {vista === 'marcador' && (
              <div style={styles.section}>
                <h2>Marcar Asistencia - Hoy</h2>
                
                <div style={styles.crearAlumnoForm}>
                  <h4>Agregar alumno a este grupo</h4>
                  <form onSubmit={crearAlumno} style={styles.form}>
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={formAlumno.nombre}
                      onChange={e => setFormAlumno({...formAlumno, nombre: e.target.value})}
                    />
                    <input
                      type="number"
                      placeholder="Edad"
                      value={formAlumno.edad}
                      onChange={e => setFormAlumno({...formAlumno, edad: e.target.value})}
                    />
                    <input
                      type="tel"
                      placeholder="Teléfono padre (opcional)"
                      value={formAlumno.telefono_padre}
                      onChange={e => setFormAlumno({...formAlumno, telefono_padre: e.target.value})}
                    />
                    <button type="submit">Agregar alumno</button>
                  </form>
                </div>

                <h3 style={{marginTop: '30px'}}>Alumnos del grupo ({alumnos.length})</h3>
                
                {alumnos.length === 0 ? (
                  <p style={styles.emptyText}>Sin alumnos aún</p>
                ) : (
                  <div style={styles.alumnosList}>
                    {alumnos.map(alumno => {
                      const asistencia = asistenciaHoy.find(a => a.alumno_id === alumno.id);
                      const presente = asistencia?.presente;
                      
                      return (
                        <div key={alumno.id} style={styles.alumnoCard}>
                          <div style={styles.alumnoInfo}>
                            <strong>{alumno.nombre}</strong>
                            <small>{alumno.edad} años | {alumno.telefono_padre}</small>
                          </div>
                          <div style={styles.alumnoActions}>
                            <button
                              onClick={() => marcarAsistencia(alumno.id, true)}
                              style={{
                                ...styles.btnAsistencia,
                                backgroundColor: presente === true ? '#4CAF50' : '#ddd',
                                color: presente === true ? 'white' : 'black'
                              }}
                            >
                              ✅ Presente
                            </button>
                            <button
                              onClick={() => marcarAsistencia(alumno.id, false)}
                              style={{
                                ...styles.btnAsistencia,
                                backgroundColor: presente === false ? '#f44336' : '#ddd',
                                color: presente === false ? 'white' : 'black'
                              }}
                            >
                              ❌ Ausente
                            </button>
                            <button
                              onClick={() => cargarHistorial(alumno.id)}
                              style={styles.btnHistorial}
                            >
                              📊 Ver historial
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* VISTA: AUSENTES */}
            {vista === 'ausentes' && (
              <div style={styles.section}>
                <h2>Reporte de Ausentes</h2>
                <button onClick={obtenerAusentes} style={styles.btnAusentes}>
                  🔍 Generar reporte (hoy)
                </button>
              </div>
            )}

            {/* VISTA: HISTORIAL */}
            {vista === 'historial' && (
              <div style={styles.section}>
                <button onClick={() => setVista('marcador')} style={styles.btnBack}>
                  ← Volver
                </button>
                <h2>Historial de asistencia (últimos 30 días)</h2>
                {historial.length === 0 ? (
                  <p style={styles.emptyText}>Sin registros</p>
                ) : (
                  <table style={styles.tabla}>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Hora marcada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historial.map((h, i) => (
                        <tr key={i}>
                          <td>{h.fecha}</td>
                          <td>{h.presente ? '✅ Presente' : '❌ Ausente'}</td>
                          <td>{h.timestamp_marcada ? new Date(h.timestamp_marcada).toLocaleTimeString() : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}

        {loading && <p style={styles.loading}>Cargando...</p>}
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f5f5f5'
  },
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '20px',
    zIndex: 100,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  subtitle: {
    margin: '5px 0 0 0',
    fontSize: '14px',
    opacity: 0.9
  },
  sidebar: {
    position: 'fixed',
    left: 0,
    top: '100px',
    width: '280px',
    height: 'calc(100vh - 100px)',
    backgroundColor: '#ecf0f1',
    padding: '20px',
    overflowY: 'auto',
    borderRight: '1px solid #bdc3c7'
  },
  gruposList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px'
  },
  grupoBtn: {
    padding: '10px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '14px',
    transition: 'background-color 0.3s',
    display: 'flex',
    flexDirection: 'column',
    gap: '3px'
  },
  emptyText: {
    color: '#999',
    fontSize: '14px',
    marginBottom: '20px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  main: {
    marginLeft: '280px',
    marginTop: '100px',
    padding: '30px',
    flex: 1,
    overflowY: 'auto'
  },
  welcome: {
    textAlign: 'center',
    padding: '50px',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    borderBottom: '2px solid #ddd',
    paddingBottom: '10px'
  },
  tab: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px 5px 0 0',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  section: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  crearAlumnoForm: {
    backgroundColor: '#f9f9f9',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '20px',
    border: '1px solid #ddd'
  },
  alumnosList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  alumnoCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '5px',
    border: '1px solid #ddd',
    flexWrap: 'wrap',
    gap: '10px'
  },
  alumnoInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px'
  },
  alumnoActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  btnAsistencia: {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s'
  },
  btnHistorial: {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#2196F3',
    color: 'white',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold'
  },
  btnAusentes: {
    padding: '12px 20px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '20px'
  },
  btnBack: {
    padding: '8px 16px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginBottom: '20px'
  },
  tabla: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '15px'
  },
  loading: {
    textAlign: 'center',
    padding: '20px',
    color: '#666'
  }
};
