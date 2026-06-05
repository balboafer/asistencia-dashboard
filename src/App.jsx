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
                        if (!res.ok) throw new Error('Error al cargar grupos');
                        const data = await res.json();
                        setGrupos(data || []);
            } catch (err) {
                        console.error('Error:', err);
                        setError('Error al conectar con el servidor');
            } finally {
                        setLoading(false);
            }
  };

  const cargarAlumnos = async (grupoId) => {
            try {
                        setLoading(true);
                        const res = await fetch(`${API_URL}/alumnos/grupo/${grupoId}`);
                        if (!res.ok) throw new Error('Error al cargar alumnos');
                        const data = await res.json();
                        setAlumnos(data || []);
                        setGrupoSeleccionado(grupoId);
            } catch (err) {
                        console.error('Error:', err);
                        setError('Error al cargar alumnos');
            } finally {
                        setLoading(false);
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
                        if (!res.ok) throw new Error('Error al marcar asistencia');
                        cargarAlumnos(grupoSeleccionado);
            } catch (err) {
                        console.error('Error:', err);
                        setError('Error al marcar asistencia');
            }
  };

  const styles = {
            container: {
                        padding: '20px',
                        fontFamily: 'Arial, sans-serif',
                        maxWidth: '1200px',
                        margin: '0 auto',
                        backgroundColor: '#f5f5f5',
                        minHeight: '100vh'
            },
            error: {
                        backgroundColor: '#ffebee',
                        color: '#c62828',
                        padding: '10px 15px',
                        borderRadius: '4px',
                        marginBottom: '20px'
            },
            section: {
                        backgroundColor: 'white',
                        padding: '20px',
                        marginBottom: '20px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            },
            gruposList: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                        gap: '10px'
            },
            grupoButton: {
                        padding: '10px 15px',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        transition: 'background-color 0.3s'
            },
            table: {
                        width: '100%',
                        borderCollapse: 'collapse',
                        marginTop: '15px'
            },
            th: {
                        backgroundColor: '#2196F3',
                        color: 'white',
                        padding: '12px',
                        textAlign: 'left',
                        fontWeight: 'bold'
            },
            td: {
                        padding: '10px 12px',
                        borderBottom: '1px solid #ddd'
            },
            actionButton: {
                        padding: '6px 12px',
                        marginRight: '5px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
            },
            presenteBtn: {
                        backgroundColor: '#4CAF50',
                        color: 'white'
            },
            ausenteBtn: {
                        backgroundColor: '#f44336',
                        color: 'white'
            }
  };

  return (
            <div style={styles.container}>
                        <h1>📋 Sistema de Asistencia Algorithmics</h1>h1>
            
                  {error && (
                          <div style={styles.error}>
                                {error}
                          </div>div>
                  )}
            
                  <div style={styles.section}>
                          <h2>Grupos Disponibles</h2>h2>
                        {loading ? (
                            <p>Cargando...</p>p>
                          ) : grupos.length === 0 ? (
                            <p>No hay grupos disponibles</p>p>
                          ) : (
                            <div style={styles.gruposList}>
                                  {grupos.map(grupo => (
                                                <button
                                                                      key={grupo.id}
                                                                      onClick={() => cargarAlumnos(grupo.id)}
                                                                      style={{
                                                                                              ...styles.grupoButton,
                                                                                              backgroundColor: grupoSeleccionado === grupo.id ? '#4CAF50' : '#2196F3'
                                                                            }}
                                                                    >
                                                      {grupo.nombre}
                                                </button>button>
                                              ))}
                            </div>div>
                          )}
                  </div>div>
            
                  {grupoSeleccionado && (
                          <div style={styles.section}>
                                    <h2>Alumnos</h2>h2>
                                {loading ? (
                                            <p>Cargando alumnos...</p>p>
                                          ) : alumnos.length === 0 ? (
                                            <p>No hay alumnos en este grupo</p>p>
                                          ) : (
                                            <table style={styles.table}>
                                                          <thead>
                                                                          <tr>
                                                                                            <th style={styles.th}>Nombre</th>th>
                                                                                            <th style={styles.th}>Edad</th>th>
                                                                                            <th style={styles.th}>Acciones</th>th>
                                                                          </tr>tr>
                                                          </thead>thead>
                                                          <tbody>
                                                                {alumnos.map(alumno => (
                                                                    <tr key={alumno.id}>
                                                                                        <td style={styles.td}>{alumno.nombre}</td>td>
                                                                                        <td style={styles.td}>{alumno.edad}</td>td>
                                                                                        <td style={styles.td}>
                                                                                                              <button
                                                                                                                                            onClick={() => marcarAsistencia(alumno.id, true)}
                                                                                                                                            style={{
                                                                                                                                                                            ...styles.actionButton,
                                                                                                                                                                            ...styles.presenteBtn
                                                                                                                                                                                                          }}
                                                                                                                                          >
                                                                                                                                      Presente
                                                                                                                    </button>button>
                                                                                                              <button
                                                                                                                                            onClick={() => marcarAsistencia(alumno.id, false)}
                                                                                                                                            style={{
                                                                                                                                                                            ...styles.actionButton,
                                                                                                                                                                            ...styles.ausenteBtn
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
                          </div>div>
                  )}
            </div>div>
          );
}</h1>
