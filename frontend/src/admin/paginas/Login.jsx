import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Eye, EyeOff, Lock, User } from 'lucide-react'
import { api, sesion } from '../api'
import { Campo } from '../componentes/ui'
import logoBlanco from '../../assets/images/logo-blanco.webp'
import '../estilos/login.css'

const MOTIVOS = {
  caducada: 'Tu sesión caducó. Vuelve a iniciar sesión para continuar.',
  inactividad: 'Cerramos tu sesión por inactividad, para proteger el panel.',
}

function Login() {
  const navegar = useNavigate()
  const { state } = useLocation()
  const [usuario, setUsuario] = useState('')
  const [clave, setClave] = useState('')
  const [verClave, setVerClave] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  /* Con sesion abierta no tiene sentido ver el login */
  if (sesion.leer() && !state?.motivo) return <Navigate to="/admin/resumen" replace />

  const entrar = async (evento) => {
    evento.preventDefault()
    if (!usuario.trim() || !clave) {
      setError('Escribe tu usuario y tu clave.')
      return
    }
    setEnviando(true)
    setError('')
    try {
      const respuesta = await api.login(usuario.trim(), clave)
      sesion.guardar(respuesta.token, respuesta.usuario)
      const destino = state?.desde && state.desde !== '/admin' ? state.desde : '/admin/resumen'
      navegar(destino, { replace: true })
    } catch (e) {
      setError(e.message)
      setEnviando(false)
    }
  }

  return (
    <div className="adm adm-login">
      <section className="adm-login__marca" aria-hidden="true">
        <img src={logoBlanco} alt="" className="adm-login__logo" />
        <div className="adm-login__frase">
          <h2>Tu catálogo, siempre al día.</h2>
          <p>Agrega productos, cambia fotos y organiza categorías. Los cambios se ven en la tienda al instante.</p>
        </div>
        <div className="adm-login__tarjetas">
          <span className="adm-login__tarjeta adm-login__tarjeta--1" />
          <span className="adm-login__tarjeta adm-login__tarjeta--2" />
          <span className="adm-login__tarjeta adm-login__tarjeta--3" />
        </div>
      </section>

      <section className="adm-login__formulario">
        <a href="/" className="adm-volver adm-login__volver">
          <ArrowLeft /> Volver a la tienda
        </a>

        <form onSubmit={entrar} className="adm-login__caja" noValidate>
          <span className="adm-login__candado"><Lock aria-hidden="true" /></span>
          <h1>Panel administrativo</h1>
          <p className="adm-login__subtitulo">Ingresa con tus credenciales para gestionar el catálogo.</p>

          {(error || MOTIVOS[state?.motivo]) && (
            <div className={`adm-alerta ${error ? 'adm-alerta--error' : 'adm-alerta--info'}`} role="alert">
              <AlertCircle aria-hidden="true" />
              <span>{error || MOTIVOS[state.motivo]}</span>
            </div>
          )}

          <Campo etiqueta="Usuario">
            {(props) => (
              <div className="adm-input-grupo">
                <User aria-hidden="true" />
                <input {...props} className="adm-input" autoComplete="username" value={usuario} onChange={(e) => setUsuario(e.target.value)} placeholder="admin" autoFocus />
              </div>
            )}
          </Campo>

          <Campo etiqueta="Clave">
            {(props) => (
              <div className="adm-input-grupo">
                <Lock aria-hidden="true" />
                <input
                  {...props}
                  className="adm-input adm-login__clave"
                  type={verClave ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  placeholder="••••••••"
                />
                <button type="button" className="adm-login__ver" onClick={() => setVerClave((v) => !v)} aria-label={verClave ? 'Ocultar clave' : 'Mostrar clave'}>
                  {verClave ? <EyeOff /> : <Eye />}
                </button>
              </div>
            )}
          </Campo>

          <button type="submit" className="adm-btn adm-btn--primario adm-btn--bloque adm-login__entrar" disabled={enviando}>
            {enviando && <span className="adm-spinner" aria-hidden="true" />}
            {enviando ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="adm-login__pie">© {new Date().getFullYear()} Comercializadora Gonzalez S.A.S.</p>
      </section>
    </div>
  )
}

export default Login
