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
                                                                                      <th>Nombre</th>th>
                                                                                      <th>Edad</th>th>
                                                                                      <th>Acciones</th>th>
                                                                    </tr>tr>
                                                    </thead>thead>
                                                    <tbody>
                                                        {alumnos.map(alumno => (
                                                            <tr key={alumno.id}>
                                                                                <td>{alumno.nombre}</td>td>
                                                                                <td>{alumno.edad}</td>td>
                                                                                <td>
                                                                                                      <button
                                                                                                                                  onClick={() => marcarAsistencia(alumno.id, true)}
                                                                                                                                  style={{...styles.buttonPresente}}
                                                                                                                                >
                                                                                                                              ✓ Presente
                                                                                                          </button>button>
                                                                                                      <button
                                                                                                                                  onClick={() => marcarAsistencia(alumno.id, false)}
                                                                                                                                  style={{...styles.buttonAusente}}
                                                                                                                                >
                                                                                                                              ✗ Ausente
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
}

const styles = {
      container: {
              fontFamily: 'Arial, sans-serif',
              padding: '20px',
              maxWidth: '1200px',
              margin: '0 auto',
              backgroundColor: '#f5f5f5',
              minHeight: '100vh'
      },
      section: {
              backgroundColor: 'white',
              padding: '20px',
              marginTop: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      },
      gruposList: {
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '10px',
              marginTop: '15px'
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
      buttonPresente: {
              padding: '8px 12px',
              margin: '5px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
      },
      buttonAusente: {
              padding: '8px 12px',
              margin: '5px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
      },
      error: {
              padding: '15px',
              backgroundColor: '#ffebee',
              color: '#c62828',
              borderRadius: '4px',
              marginTop: '15px',
              border: '1px solid #ef5350'
      }
};</h1>
