import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function App() {
  const [grupos, setGrupos] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [grupoId, setGrupoId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGrupos();
  }, []);

  const fetchGrupos = async () => {
    try {
      const res = await fetch(`${API_URL}/grupos`);
      const data = await res.json();
      setGrupos(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAlumnos = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/alumnos/grupo/${id}`);
      const data = await res.json();
      setAlumnos(data);
      setGrupoId(id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const marcarAsistencia = async (alumnoId, presente) => {
    try {
      const response = await fetch(`${API_URL}/asistencia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alumno_id: alumnoId,
          grupo_id: grupoId,
          presente: presente
        })
      });
      if (response.ok) {
        fetchAlumnos(grupoId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Asistencia Algorithmics</h1>
      <div>
        <h2>Grupos</h2>
        {grupos.map((grupo) => (
          <button key={grupo.id} onClick={() => fetchAlumnos(grupo.id)}>
            {grupo.nombre}
          </button>
        ))}
      </div>
      {grupoId && (
        <div>
          <h2>Alumnos</h2>
          {loading ? (
            <p>Cargando...</p>
          ) : (
            <table border="1">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Edad</th>
                  <th>Presente</th>
                  <th>Ausente</th>
                </tr>
              </thead>
              <tbody>
                {alumnos.map((alumno) => (
                  <tr key={alumno.id}>
                    <td>{alumno.nombre}</td>
                    <td>{alumno.edad}</td>
                    <td>
                      <button onClick={() => marcarAsistencia(alumno.id, true)}>
                        SI
                      </button>
                    </td>
                    <td>
                      <button onClick={() => marcarAsistencia(alumno.id, false)}>
                        NO
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
