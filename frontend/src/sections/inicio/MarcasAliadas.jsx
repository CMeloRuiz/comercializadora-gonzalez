import './MarcasAliadas.css'

/* Las mismas marcas que mostraba el sitio anterior. Los logos viven en public/marcas */
const MARCAS = [
  { nombre: '3M', archivo: '3m.svg' },
  { nombre: 'DeWalt', archivo: 'dewalt.svg' },
  { nombre: 'Makita', archivo: 'makita.svg' },
  { nombre: 'Stanley', archivo: 'stanley.webp' },
  { nombre: 'Truper', archivo: 'truper.svg' },
]

function MarcasAliadas() {
  /* Se repite la lista para que el desplazamiento infinito no muestre cortes */
  const pista = [...MARCAS, ...MARCAS, ...MARCAS]

  return (
    <section className="marcas" aria-labelledby="marcas-titulo">
      <div className="contenedor">
        <h2 id="marcas-titulo" className="marcas__titulo">Trabajamos con marcas que conoces</h2>
      </div>
      <div className="marcas__carril">
        <ul className="marcas__pista">
          {[...pista, ...pista].map((marca, i) => (
            <li key={i} className="marcas__logo" aria-hidden={i >= MARCAS.length}>
              <img src={`/marcas/${marca.archivo}`} alt={marca.nombre} loading="lazy" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default MarcasAliadas
