import { useTitulo } from '../hooks'
import Hero from '../sections/inicio/Hero'
import BarraConfianza from '../sections/inicio/BarraConfianza'
import CategoriasDestacadas from '../sections/inicio/CategoriasDestacadas'
import ProductosDestacados from '../sections/inicio/ProductosDestacados'
import BannersPromo from '../sections/inicio/BannersPromo'
import ComoComprar from '../sections/inicio/ComoComprar'
import MarcasAliadas from '../sections/inicio/MarcasAliadas'
import Visitanos from '../sections/inicio/Visitanos'

function Inicio() {
  useTitulo()

  return (
    <>
      <Hero />
      <BarraConfianza />
      <CategoriasDestacadas />
      <ProductosDestacados />
      <BannersPromo />
      <ComoComprar />
      <MarcasAliadas />
      <Visitanos />
    </>
  )
}

export default Inicio
