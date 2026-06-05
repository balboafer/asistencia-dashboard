import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function AsistenciaDashboard() {
            const [grupos, setGrupos] = useState([]);
            const [alumnos, setAlumnos] = useState([]);
            const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
            const [loading, setLoading] = useState(false);
            const [error, setError] = useState(null);

  useEffect(() => {
                cargarGrupos();
  }, []);

  const cargarGrupos = async () => {
                try {
                                setLoading(true);
                                setError(null);
                                const res = await fetch(`${API_URL}/grupos`);
                                const data = await res.json();
                                setGrupos(data || []);
                } catch (err) {
                                setError('Error al cargar grupos');
                } finally {
                                setLoading(false);
                }
  };

  const cargarAlumnos = async (id) => {
                try {
                                setLoading(true);
                                const res = await fetch(`${API_URL}/alumnos/grupo/${id}`);
                                const data = await res.json();
                                setAlumnos(data || []);
                                setGrupoSeleccionado(id);
                } catch (err) {
                                setError('Error al cargar alumnos');
                } finally {
                                setLoading(false);
                }
  };

  const marcarAsistencia = async (alumnoId, presente) => {
                try {
                                await fetch(`${API_URL}/asistencia`, {
                                                  method: 'POST',
                                                  headers: { 'Content-Type': 'application/json' },
                                                  body: JSON.stringify({
                                                                      alumno_id: alumnoId,
                                                                      grupo_id: grupoSeleccionado,
                                                                      presente: presente
                                                  })
                                });
                                cargarAlumnos(grupoSeleccionado);
                } catch (err) {
                                setError('Error al marcar asistencia');
                }
  };

  return (
                <div style={{ padding: '20px', fontFamily: 'Arial' }}>
                                <h1>Sistema de Asistencia</h1>h1>
                          {error && <div style={{ color: 'red' }}>{error}</div>div>}
                      <div style={{ marginTop: '20px' }}>
                              <h2>Grupos</h2>h2>
                                {loading && <p>Cargando...</p>p>}
                                {!loading && grupos.map((grupo) => (
                                    <button
                                                          key={grupo.id}
                                                          onClick={() => cargarAlumnos(grupo.id)}
                                                          style={{
                                                                                  marginRight: '10px',
                                                                                  padding: '10px',
                                                                                  backgroundColor: grupoSeleccionado === grupo.id ? '#4CAF50' : '#2196F3',
                                                                                  color: 'white',
                                                                                  border: 'none',
                                                                                  borderRadius: '4px',
                                                                                  cursor: 'pointer'
                                                                    }}
                                                        >
                                              {grupo.nombre}
                                    </button>button>
                                  ))}
                      </div>div>
                          {grupoSeleccionado && (
                                  <div style={{ marginTop: '30px' }}>
                                            <h2>Alumnos</h2>h2>
                                            {loading && <p>Cargando alumnos...</p>p>}
                                            {!loading && alumnos.length > 0 && (
                                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                                      <thead>
                                                                                      <tr>
                                                                                                        <th style={{ padding: '10px', textAlign: 'left', backgroundColor: '#f0f0f0' }}>Nombre</th>th>
                                                                                                        <th style={{ padding: '10px', textAlign: 'left', backgroundColor: '#f0f0f0' }}>Edad</th>th>
                                                                                                        <th style={{ padding: '10px', textAlign: 'left', backgroundColor: '#f0f0f0' }}>Acciones</th>th>
                                                                                                </tr>tr>
                                                                      </thead>thead>
                                                                      <tbody>
                                                                                {alumnos.map((alumno) => (
                                                                                    <tr key={alumno.id} style={{ borderBottom: '1px solid #ddd' }}>
                                                                                                        <td style={{ padding: '10px' }}>{alumno.nombre}</td>td>
                                                                                                        <td style={{ padding: '10px' }}>{alumno.edad}</td>td>
                                                                                                        <td style={{ padding: '10px' }}>
                                                                                                                              <button
                                                                                                                                                                onClick={() => marcarAsistencia(alumno.id, true)}
                                                                                                                                                                style={{
                                                                                                                                                                                                    marginRight: '5px',
                                                                                                                                                                                                    padding: '5px 10px',
                                                                                                                                                                                                    backgroundColor: '#4CAF50',
                                                                                                                                                                                                    color: 'white',
                                                                                                                                                                                                    border: 'none',
                                                                                                                                                                                                    borderRadius: '4px',
                                                                                                                                                                                                    cursor: 'pointer'
                                                                                                                                                                                                                                      }}
                                                                                                                                                              >
                                                                                                                                                      Presente
                                                                                                                                        </button>button>
                                                                                                                              <button
                                                                                                                                                                onClick={() => marcarAsistencia(alumno.id, false)}
                                                                                                                                                                style={{
                                                                                                                                                                                                    padding: '5px 10px',
                                                                                                                                                                                                    backgroundColor: '#f44336',
                                                                                                                                                                                                    color: 'white',
                                                                                                                                                                                                    border: 'none',
                                                                                                                                                                                                    borderRadius: '4px',
                                                                                                                                                                                                    cursor: 'pointer'
                                                                                                                                                                                                                                      }}
                                                                                                                                                              >
                                                                                                                                                      Ausente
                                                                                                                                        </button>button>
                                                                                                                  </td>td>
                                                                                              </tr>tr>
                                                                                  ))}
                                                                      </tbody>tbody>
                                                        </table>table>
                                            )}
                                            {!loading && alumnos.length === 0 && <p>No hay alumnos</p>p>}
                                  </div>div>
                      )}
                </div>div>
              );
}</h1>
