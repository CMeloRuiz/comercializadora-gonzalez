/**
 * ===== Catalogo inicial =====
 *
 * Los 60 productos del sitio anterior (products.js), agrupados en fichas con
 * variantes: antes cada potencia o temperatura de color era una tarjeta
 * distinta y el catalogo se sentia repetido.
 *
 * Las descripciones se reescribieron para vender mejor, pero solo con datos
 * que ya estaban en el nombre original o que son propios del tipo de
 * producto. Nada de lumenes, garantias o medidas que no se puedan confirmar:
 * el dueno puede completarlas desde el panel.
 *
 * Las imagenes viven en frontend/public/productos (ya optimizadas en WebP).
 * El precio va vacio a proposito: aun no se publica.
 */

export const categorias = [
	{
		slug: 'bombillos-led',
		nombre: 'Bombillos LED',
		descripcion: 'Cambia tus bombillos tradicionales por LED y reduce el consumo de energía sin perder iluminación.',
	},
	{
		slug: 'paneles-led',
		nombre: 'Paneles LED',
		descripcion: 'Luz uniforme y moderna para techos de hogares, oficinas y locales comerciales.',
	},
	{
		slug: 'tubos-y-lamparas',
		nombre: 'Tubos y lámparas',
		descripcion: 'Soluciones de iluminación para bodegas, parqueaderos, pasillos y fachadas.',
	},
	{
		slug: 'reflectores-y-emergencia',
		nombre: 'Reflectores y emergencia',
		descripcion: 'Iluminación potente para exteriores y luces que no te dejan a oscuras cuando se va la energía.',
	},
	{
		slug: 'herramientas-manuales',
		nombre: 'Herramientas manuales',
		descripcion: 'Alicates, destornilladores, llaves y juegos completos para electricistas, técnicos y trabajos del hogar.',
	},
	{
		slug: 'medicion',
		nombre: 'Medición',
		descripcion: 'Flexómetros y probadores para medir y verificar antes de instalar.',
	},
]

export const productos = [
	/* ------------------------------ Bombillos LED ------------------------------ */
	{
		nombre: 'Bombillo LED Toledo E27',
		categoria: 'bombillos-led',
		marca: 'Toledo',
		imagen: '/productos/bombillo-led-toledo1.webp',
		resumen: 'El reemplazo directo de tu bombillo de siempre: misma rosca E27, mucho menos consumo.',
		descripcion:
			'El bombillo LED Toledo E27 es la forma más sencilla de modernizar la iluminación de tu casa o negocio. Se instala en cualquier plafón o lámpara con rosca estándar E27, sin cambiar cables ni accesorios: quitas el bombillo viejo, pones el nuevo y listo.\n\n' +
			'Disponible en 9W y 12W, y en luz cálida o luz día, para que elijas el ambiente que necesitas en cada espacio. Al ser tecnología LED, enciende al instante, casi no se calienta y consume una fracción de la energía de un bombillo incandescente.',
		caracteristicas: [
			'Rosca estándar E27: compatible con la mayoría de lámparas y plafones',
			'Encendido instantáneo, sin parpadeo inicial',
			'Bajo consumo de energía frente a bombillos tradicionales',
			'Emite poco calor, más seguro y cómodo en espacios cerrados',
		],
		aplicaciones: ['Hogares', 'Oficinas', 'Locales comerciales', 'Pasillos y escaleras'],
		especificaciones: [
			{ etiqueta: 'Tecnología', valor: 'LED' },
			{ etiqueta: 'Base', valor: 'E27 (rosca estándar)' },
			{ etiqueta: 'Potencias', valor: '9W y 12W' },
			{ etiqueta: 'Temperatura de color', valor: '3000K (cálida) y 6500K (luz día)' },
		],
		variantes: ['9W · 3000K luz cálida', '9W · 6500K luz día', '12W · 3000K luz cálida', '12W · 6500K luz día'],
		destacado: true,
	},
	{
		nombre: 'Bombillo LED Toledo E27 alta potencia',
		categoria: 'bombillos-led',
		marca: 'Toledo',
		imagen: '/productos/bombillo-led-toledo2.webp',
		resumen: 'Más luz en la misma rosca E27: 20W y 40W para espacios amplios que necesitan iluminación de verdad.',
		descripcion:
			'Cuando un bombillo normal se queda corto, la versión de alta potencia del Toledo E27 llena de luz el espacio. Es la opción para garajes, talleres, bodegas, locales y cualquier área grande donde se necesita ver bien.\n\n' +
			'Se instala en la misma rosca E27 de siempre y entrega luz día blanca y nítida, ideal para trabajar con precisión y mantener los espacios seguros.',
		caracteristicas: [
			'Alta potencia en formato de rosca E27',
			'Luz día (6500K) blanca y nítida',
			'Instalación inmediata, sin adaptadores',
			'Tecnología LED de bajo consumo y larga vida útil',
		],
		aplicaciones: ['Talleres y garajes', 'Bodegas', 'Locales comerciales', 'Zonas de parqueo cubiertas'],
		especificaciones: [
			{ etiqueta: 'Tecnología', valor: 'LED' },
			{ etiqueta: 'Base', valor: 'E27 (rosca estándar)' },
			{ etiqueta: 'Potencias', valor: '20W y 40W' },
			{ etiqueta: 'Temperatura de color', valor: '6500K (luz día)' },
		],
		variantes: ['20W · 6500K luz día', '40W · 6500K luz día'],
	},
	{
		nombre: 'Bombillo LED GU10',
		categoria: 'bombillos-led',
		imagen: '/productos/bombillo-led-gu10.webp',
		resumen: 'Luz dirigida para spots y ojos de buey: resalta espacios y ahorra energía.',
		descripcion:
			'El bombillo LED GU10 es el aliado perfecto para iluminación decorativa y puntual: spots, rieles, ojos de buey y lámparas empotradas. Su base GU10 de dos pines con giro se instala en segundos y queda firme.\n\n' +
			'Elige luz cálida para crear ambientes acogedores en salas y habitaciones, o luz día para vitrinas, cocinas y espacios donde necesitas destacar colores y detalles.',
		caracteristicas: [
			'Base GU10 de ajuste por giro, firme y segura',
			'Haz de luz dirigido, ideal para acentuar espacios',
			'Reemplaza dicroicas halógenas con mucho menor consumo',
			'Disponible en luz cálida y luz día',
		],
		aplicaciones: ['Spots y rieles', 'Ojos de buey', 'Vitrinas y exhibidores', 'Cocinas y salas'],
		especificaciones: [
			{ etiqueta: 'Tecnología', valor: 'LED' },
			{ etiqueta: 'Base', valor: 'GU10' },
			{ etiqueta: 'Potencias', valor: '5W y 6W' },
			{ etiqueta: 'Temperatura de color', valor: '3000K (cálida) y 6500K (luz día)' },
		],
		variantes: ['5W · 3000K luz cálida', '5W · 6500K luz día', '6W · 3000K luz cálida', '6W · 6500K luz día'],
	},
	{
		nombre: 'Bombillo LED GU10 dimerizable 7W',
		categoria: 'bombillos-led',
		imagen: '/productos/bombillo-led-gu10.webp',
		resumen: 'Controla la intensidad de la luz a tu gusto con un dimmer compatible.',
		descripcion:
			'Crea el ambiente exacto que quieres en cada momento. Este bombillo LED GU10 de 7W es dimerizable: con un regulador (dimmer) compatible puedes subir o bajar la intensidad de la luz, desde una iluminación suave para descansar hasta toda la potencia cuando la necesitas.\n\n' +
			'Su luz cálida de 3000K es ideal para comedores, salas, habitaciones, restaurantes y hoteles, donde el ambiente lo es todo.',
		caracteristicas: [
			'Dimerizable: regula la intensidad con un dimmer compatible',
			'Luz cálida (3000K) para ambientes acogedores',
			'Base GU10 para spots y lámparas empotradas',
			'Tecnología LED de bajo consumo',
		],
		aplicaciones: ['Comedores y salas', 'Habitaciones', 'Restaurantes y hoteles', 'Iluminación decorativa'],
		especificaciones: [
			{ etiqueta: 'Tecnología', valor: 'LED dimerizable' },
			{ etiqueta: 'Base', valor: 'GU10' },
			{ etiqueta: 'Potencia', valor: '7W' },
			{ etiqueta: 'Temperatura de color', valor: '3000K (luz cálida)' },
		],
		variantes: [],
	},

	/* ------------------------------- Paneles LED ------------------------------- */
	{
		nombre: 'Panel LED redondo de incrustar',
		categoria: 'paneles-led',
		imagen: '/productos/led-incrustar.webp',
		resumen: 'Acabado limpio y moderno en tu techo, con la potencia y el tono de luz exactos para cada espacio.',
		descripcion:
			'El panel LED de incrustar se instala dentro del techo (drywall o superboard) y deja un acabado plano, elegante y sin bombillos a la vista. Es la solución favorita para remodelaciones de cocinas, baños, oficinas y locales.\n\n' +
			'Lo tenemos en una amplia gama de potencias, de 3W hasta 24W, y en tres tonos de luz: cálida, neutra y luz día. Así puedes usar el mismo estilo en toda la obra y ajustar la potencia según el tamaño de cada ambiente.',
		caracteristicas: [
			'Instalación empotrada con acabado plano y moderno',
			'Luz uniforme, sin puntos brillantes que molesten a la vista',
			'Seis potencias disponibles, de 3W a 24W',
			'Tres temperaturas de color: cálida, neutra y luz día',
		],
		aplicaciones: ['Cocinas y baños', 'Oficinas', 'Locales comerciales', 'Pasillos y halls'],
		especificaciones: [
			{ etiqueta: 'Tecnología', valor: 'LED' },
			{ etiqueta: 'Instalación', valor: 'De incrustar (empotrado en techo)' },
			{ etiqueta: 'Potencias', valor: '3W, 6W, 9W, 12W, 18W y 24W' },
			{ etiqueta: 'Temperatura de color', valor: '3000K, 4000K y 6500K' },
		],
		variantes: [
			'3W · 3000K', '3W · 6500K', '6W · 3000K', '6W · 6500K',
			'9W · 3000K', '9W · 4000K', '9W · 6500K', '12W · 3000K', '12W · 4000K', '12W · 6500K',
			'18W · 3000K', '18W · 4000K', '18W · 6500K', '24W · 3000K', '24W · 4000K', '24W · 6500K',
		],
		destacado: true,
	},
	{
		nombre: 'Panel LED redondo de sobreponer',
		categoria: 'paneles-led',
		imagen: '/productos/led-sobreponer.webp',
		resumen: 'Toda la estética de un panel LED sin romper el techo: se atornilla directo sobre la superficie.',
		descripcion:
			'¿Tu techo es de concreto o no quieres hacer perforaciones grandes? El panel LED de sobreponer se fija directamente sobre la superficie y ofrece la misma luz uniforme y el look moderno de un panel empotrado.\n\n' +
			'Es perfecto para renovar la iluminación de apartamentos, oficinas y locales de forma rápida y limpia. Disponible de 6W a 24W y en luz cálida, neutra o luz día.',
		caracteristicas: [
			'Se instala sobre el techo, sin necesidad de cielo falso',
			'Ideal para techos de concreto y remodelaciones rápidas',
			'Luz uniforme y diseño delgado',
			'Varias potencias y tres tonos de luz',
		],
		aplicaciones: ['Apartamentos', 'Oficinas', 'Consultorios', 'Locales comerciales'],
		especificaciones: [
			{ etiqueta: 'Tecnología', valor: 'LED' },
			{ etiqueta: 'Instalación', valor: 'De sobreponer (superficie)' },
			{ etiqueta: 'Potencias', valor: '6W, 12W, 18W y 24W' },
			{ etiqueta: 'Temperatura de color', valor: '3000K, 4000K y 6500K' },
		],
		variantes: [
			'6W · 6500K', '12W · 3000K', '12W · 4000K', '12W · 6500K',
			'18W · 3000K', '18W · 4000K', '18W · 6500K', '24W · 3000K', '24W · 4000K', '24W · 6500K',
		],
	},
	{
		nombre: 'Panel LED cuadrado 60x60 40W de incrustar',
		categoria: 'paneles-led',
		imagen: '/productos/led-cuadrado.webp',
		resumen: 'El estándar para oficinas modernas: encaja en la retícula de 60x60 del cielo raso.',
		descripcion:
			'Diseñado para encajar en la retícula estándar de 60x60 cm de los cielos rasos modulares, este panel LED de 40W es la manera más eficiente de iluminar oficinas, colegios, clínicas y áreas comerciales.\n\n' +
			'Reemplaza las antiguas lámparas de tubos fluorescentes con un panel delgado que entrega luz pareja en todo el espacio, reduce el consumo y mejora la apariencia del lugar. Disponible en luz neutra y luz día.',
		caracteristicas: [
			'Medida 60x60 cm para cielo raso modular',
			'Potencia de 40W con luz uniforme en todo el panel',
			'Reemplazo moderno de lámparas fluorescentes',
			'Disponible en luz neutra y luz día',
		],
		aplicaciones: ['Oficinas', 'Colegios y universidades', 'Clínicas y consultorios', 'Centros comerciales'],
		especificaciones: [
			{ etiqueta: 'Tecnología', valor: 'LED' },
			{ etiqueta: 'Medidas', valor: '60 x 60 cm' },
			{ etiqueta: 'Potencia', valor: '40W' },
			{ etiqueta: 'Instalación', valor: 'De incrustar (cielo raso modular)' },
			{ etiqueta: 'Temperatura de color', valor: '4000K y 6500K' },
		],
		variantes: ['40W · 4000K luz neutra', '40W · 6500K luz día'],
		destacado: true,
	},
	{
		nombre: 'Panel LED rectangular 120x30 40W de incrustar',
		categoria: 'paneles-led',
		imagen: '/productos/led-rectangular.webp',
		resumen: 'Formato alargado para pasillos, salas de reuniones y diseños lineales con estilo.',
		descripcion:
			'El panel LED rectangular de 120x30 cm aporta un diseño lineal y elegante que funciona muy bien en pasillos, salas de reuniones, recepciones y locales donde se busca un acabado arquitectónico.\n\n' +
			'Con 40W de potencia y luz día, ilumina de forma pareja y reemplaza con ventaja las lámparas fluorescentes de dos tubos.',
		caracteristicas: [
			'Formato rectangular de 120x30 cm',
			'40W de potencia con luz día (6500K)',
			'Diseño delgado para cielo raso',
			'Iluminación uniforme y sin parpadeos',
		],
		aplicaciones: ['Pasillos', 'Salas de reuniones', 'Recepciones', 'Locales comerciales'],
		especificaciones: [
			{ etiqueta: 'Tecnología', valor: 'LED' },
			{ etiqueta: 'Medidas', valor: '120 x 30 cm' },
			{ etiqueta: 'Potencia', valor: '40W' },
			{ etiqueta: 'Instalación', valor: 'De incrustar' },
			{ etiqueta: 'Temperatura de color', valor: '6500K (luz día)' },
		],
		variantes: [],
	},
	{
		nombre: 'Driver LED 40W 1000mA',
		categoria: 'paneles-led',
		imagen: '/productos/led-driver.webp',
		resumen: 'Recupera tu panel LED: el repuesto que lo vuelve a encender como el primer día.',
		descripcion:
			'Muchas veces, cuando un panel LED deja de funcionar, el problema no son los LED sino el driver: la fuente que convierte la energía de la red en la corriente que necesitan. Cambiarlo es mucho más económico que comprar un panel nuevo.\n\n' +
			'Este driver de 40W y 1000mA es el repuesto indicado para paneles LED de esa potencia, como los de 60x60 y 120x30. Si tienes dudas sobre la compatibilidad, escríbenos y te asesoramos antes de comprar.',
		caracteristicas: [
			'Potencia de 40W y salida de 1000mA',
			'Repuesto para paneles LED de 40W',
			'Alarga la vida útil de tus luminarias',
			'Asesoría de compatibilidad por WhatsApp',
		],
		aplicaciones: ['Mantenimiento de paneles 60x60', 'Paneles 120x30', 'Reparaciones eléctricas'],
		especificaciones: [
			{ etiqueta: 'Tipo', valor: 'Driver (fuente) para LED' },
			{ etiqueta: 'Potencia', valor: '40W' },
			{ etiqueta: 'Corriente de salida', valor: '1000mA' },
		],
		variantes: [],
	},

	/* ---------------------------- Tubos y lamparas ---------------------------- */
	{
		nombre: 'Tubo LED T8 de vidrio 6500K',
		categoria: 'tubos-y-lamparas',
		imagen: '/productos/tubo-led.webp',
		resumen: 'Dile adiós al fluorescente: más luz, menos consumo y encendido instantáneo.',
		descripcion:
			'El tubo LED T8 es el reemplazo moderno de los tubos fluorescentes tradicionales. Enciende al instante, sin parpadeos ni zumbidos, y ofrece una luz día blanca y constante que mejora la visibilidad en cualquier espacio de trabajo.\n\n' +
			'Su cuerpo de vidrio distribuye la luz de forma pareja y mantiene la apariencia clásica del tubo. Disponible en 9W y 18W para adaptarse a las lámparas que ya tienes.',
		caracteristicas: [
			'Formato T8, reemplazo de tubos fluorescentes',
			'Cuerpo de vidrio con luz uniforme',
			'Encendido instantáneo, sin parpadeo ni ruido',
			'Luz día (6500K) ideal para áreas de trabajo',
		],
		aplicaciones: ['Bodegas', 'Talleres', 'Parqueaderos', 'Oficinas y locales'],
		especificaciones: [
			{ etiqueta: 'Tecnología', valor: 'LED' },
			{ etiqueta: 'Formato', valor: 'T8' },
			{ etiqueta: 'Material', valor: 'Vidrio' },
			{ etiqueta: 'Potencias', valor: '9W y 18W' },
			{ etiqueta: 'Temperatura de color', valor: '6500K (luz día)' },
		],
		variantes: ['9W · 6500K', '18W · 6500K'],
		destacado: true,
	},
	{
		nombre: 'Lámpara hermética 2x18W T8 luz día',
		categoria: 'tubos-y-lamparas',
		imagen: '/productos/lampara-hermetica.webp',
		resumen: 'Resiste polvo y humedad: la lámpara que aguanta donde otras fallan.',
		descripcion:
			'La lámpara hermética está pensada para los lugares más exigentes: parqueaderos, bodegas, cuartos de máquinas, lavaderos y zonas expuestas a polvo o humedad. Su cuerpo sellado protege los tubos y las conexiones para que la luz no se interrumpa.\n\n' +
			'Aloja dos tubos T8 de 18W con luz día, suficiente para iluminar áreas amplias con claridad.',
		caracteristicas: [
			'Cuerpo hermético que protege contra polvo y humedad',
			'Capacidad para 2 tubos T8 de 18W',
			'Luz día para áreas de trabajo y circulación',
			'Ideal para interiores y exteriores cubiertos',
		],
		aplicaciones: ['Parqueaderos', 'Bodegas e industrias', 'Cuartos técnicos', 'Lavaderos y zonas húmedas'],
		especificaciones: [
			{ etiqueta: 'Tipo', valor: 'Lámpara hermética' },
			{ etiqueta: 'Tubos', valor: '2 x T8 18W' },
			{ etiqueta: 'Luz', valor: 'Luz día' },
		],
		variantes: [],
	},
	{
		nombre: 'Lámpara LED tortuga 12W luz día',
		categoria: 'tubos-y-lamparas',
		imagen: '/productos/lampara-tortuga.webp',
		resumen: 'Resistente y compacta para fachadas, pasillos y zonas exteriores.',
		descripcion:
			'La lámpara tipo tortuga es un clásico de la iluminación exterior por una buena razón: es compacta, resistente y se instala fácilmente en paredes y techos. Esta versión LED de 12W entrega luz día con bajo consumo.\n\n' +
			'Úsala en fachadas, patios, pasillos, escaleras, baños y zonas comunes de conjuntos residenciales.',
		caracteristicas: [
			'Tecnología LED de 12W y bajo consumo',
			'Diseño compacto y resistente tipo tortuga',
			'Instalación en pared o techo',
			'Luz día para mayor visibilidad y seguridad',
		],
		aplicaciones: ['Fachadas y patios', 'Pasillos y escaleras', 'Zonas comunes', 'Baños'],
		especificaciones: [
			{ etiqueta: 'Tecnología', valor: 'LED' },
			{ etiqueta: 'Potencia', valor: '12W' },
			{ etiqueta: 'Luz', valor: 'Luz día' },
			{ etiqueta: 'Instalación', valor: 'Pared o techo' },
		],
		variantes: [],
	},

	/* ------------------------ Reflectores y emergencia ------------------------ */
	{
		nombre: 'Reflector LED Jeta luz día',
		categoria: 'reflectores-y-emergencia',
		marca: 'Jeta',
		imagen: '/productos/reflector-jeta.webp',
		resumen: 'Ilumina fachadas, canchas, parqueaderos y obras con potencias de 10W a 200W.',
		descripcion:
			'Cuando necesitas iluminar a lo grande, el reflector LED Jeta responde. Es ideal para fachadas, avisos, parqueaderos, canchas, bodegas y obras en construcción, y aporta seguridad a cualquier espacio exterior durante la noche.\n\n' +
			'Elige la potencia según el área: 10W para entradas y avisos pequeños, 50W y 100W para patios y fachadas, y 200W para canchas, lotes y grandes superficies. Todos con luz día blanca y potente.',
		caracteristicas: [
			'Cuatro potencias: 10W, 50W, 100W y 200W',
			'Luz día blanca para máxima visibilidad',
			'Diseñado para uso en exteriores',
		],
		aplicaciones: ['Fachadas y avisos', 'Parqueaderos y lotes', 'Canchas deportivas', 'Obras y bodegas'],
		especificaciones: [
			{ etiqueta: 'Tecnología', valor: 'LED' },
			{ etiqueta: 'Potencias', valor: '10W, 50W, 100W y 200W' },
			{ etiqueta: 'Luz', valor: 'Luz día' },
			{ etiqueta: 'Uso', valor: 'Exterior' },
		],
		variantes: ['10W', '50W', '100W', '200W'],
		destacado: true,
	},
	{
		nombre: 'Lámpara de emergencia R2 3W',
		categoria: 'reflectores-y-emergencia',
		imagen: '/productos/lampara-emergencia-r2.webp',
		resumen: 'Se enciende sola cuando se va la luz: seguridad para tu hogar, negocio o empresa.',
		descripcion:
			'Un corte de energía no tiene por qué dejarte a oscuras. La lámpara de emergencia R2 se enciende automáticamente cuando se interrumpe el servicio eléctrico, iluminando rutas de salida, escaleras y pasillos para que las personas se desplacen con seguridad.\n\n' +
			'Es un elemento clave para cumplir con las recomendaciones de seguridad en locales comerciales, oficinas, edificios y conjuntos residenciales.',
		caracteristicas: [
			'Encendido automático al cortarse la energía',
			'Batería recargable conectada a la red',
			'Iluminación LED de 3W',
			'Ideal para rutas de evacuación y zonas comunes',
		],
		aplicaciones: ['Locales y oficinas', 'Escaleras y pasillos', 'Edificios y conjuntos', 'Bodegas'],
		especificaciones: [
			{ etiqueta: 'Tipo', valor: 'Lámpara de emergencia' },
			{ etiqueta: 'Modelo', valor: 'R2' },
			{ etiqueta: 'Potencia', valor: '3W' },
		],
		variantes: [],
		destacado: true,
	},
	{
		nombre: 'Lámpara de emergencia R1 2x1.6W',
		categoria: 'reflectores-y-emergencia',
		imagen: '/productos/lampara-emergencia-r1.webp',
		resumen: 'Dos focos orientables que se activan solos ante un corte de energía.',
		descripcion:
			'La lámpara de emergencia R1 cuenta con dos focos que puedes orientar para cubrir mejor pasillos, salidas y escaleras. Se mantiene cargada mientras hay energía y se enciende sola en el momento en que se va la luz.\n\n' +
			'Una inversión pequeña que marca la diferencia en seguridad para tu hogar, negocio o lugar de trabajo.',
		caracteristicas: [
			'Dos focos LED de 1.6W orientables',
			'Encendido automático ante cortes de energía',
			'Batería recargable',
			'Fácil instalación en pared',
		],
		aplicaciones: ['Salidas y pasillos', 'Escaleras', 'Locales comerciales', 'Hogares'],
		especificaciones: [
			{ etiqueta: 'Tipo', valor: 'Lámpara de emergencia' },
			{ etiqueta: 'Modelo', valor: 'R1' },
			{ etiqueta: 'Potencia', valor: '2 x 1.6W' },
		],
		variantes: [],
	},
	{
		nombre: 'Lámpara de emergencia R3 2x1W Design',
		categoria: 'reflectores-y-emergencia',
		imagen: '/productos/lampara-emergencia-r3.webp',
		resumen: 'Seguridad con diseño: discreta, moderna y siempre lista.',
		descripcion:
			'La R3 Design combina la función de una lámpara de emergencia con una apariencia moderna y discreta, pensada para espacios donde la estética importa: oficinas, consultorios, tiendas y recepciones.\n\n' +
			'Sus dos luces LED se activan automáticamente al cortarse la energía, para que nadie quede a oscuras.',
		caracteristicas: [
			'Diseño moderno y discreto',
			'Dos luces LED de 1W',
			'Encendido automático ante cortes de energía',
			'Batería recargable',
		],
		aplicaciones: ['Oficinas', 'Consultorios', 'Tiendas y recepciones', 'Hogares'],
		especificaciones: [
			{ etiqueta: 'Tipo', valor: 'Lámpara de emergencia' },
			{ etiqueta: 'Modelo', valor: 'R3 Design' },
			{ etiqueta: 'Potencia', valor: '2 x 1W' },
		],
		variantes: [],
	},

	/* -------------------------- Herramientas manuales -------------------------- */
	{
		nombre: 'Alicate aislado 1000V 8"',
		categoria: 'herramientas-manuales',
		referencia: '84-002',
		imagen: '/productos/alicate-aislado.webp',
		resumen: 'Protección para trabajos eléctricos: mangos aislados hasta 1000V.',
		descripcion:
			'Cuando trabajas con electricidad, la herramienta correcta es tu primera línea de protección. Este alicate de 8 pulgadas tiene mangos aislados para 1000V, diseñados para reducir el riesgo al manipular cables y conexiones.\n\n' +
			'Corta, sujeta y dobla con firmeza gracias a su cabeza robusta y a un agarre cómodo que reduce el cansancio en jornadas largas. Imprescindible en la caja de cualquier electricista.',
		caracteristicas: [
			'Mangos aislados para trabajos hasta 1000V',
			'Tamaño de 8" para mayor palanca y control',
			'Corta, sujeta y dobla cables con firmeza',
			'Agarre ergonómico para uso prolongado',
		],
		aplicaciones: ['Instalaciones eléctricas', 'Mantenimiento industrial', 'Electricistas y técnicos'],
		especificaciones: [
			{ etiqueta: 'Tipo', valor: 'Alicate aislado' },
			{ etiqueta: 'Aislamiento', valor: '1000V' },
			{ etiqueta: 'Tamaño', valor: '8"' },
			{ etiqueta: 'Referencia', valor: '84-002' },
		],
		variantes: [],
		destacado: true,
	},
	{
		nombre: 'Alicate eléctrico 8"',
		categoria: 'herramientas-manuales',
		referencia: '84-023',
		imagen: '/productos/alicate-electrico.webp',
		resumen: 'El alicate de todos los días para cortar, pelar y sujetar cables.',
		descripcion:
			'Un buen alicate eléctrico es la herramienta que más se usa en cualquier instalación. Este modelo de 8 pulgadas combina mordaza para sujetar, zona de corte para cables y un agarre cómodo que facilita el trabajo repetitivo.\n\n' +
			'Ideal para electricistas, técnicos de mantenimiento y para tener a mano en casa.',
		caracteristicas: [
			'Tamaño de 8" versátil',
			'Mordaza para sujetar y zona de corte',
			'Mangos con agarre cómodo',
			'Construcción resistente para uso frecuente',
		],
		aplicaciones: ['Instalaciones eléctricas', 'Mantenimiento', 'Uso doméstico'],
		especificaciones: [
			{ etiqueta: 'Tipo', valor: 'Alicate eléctrico' },
			{ etiqueta: 'Tamaño', valor: '8"' },
			{ etiqueta: 'Referencia', valor: '84-023' },
		],
		variantes: [],
	},
	{
		nombre: 'Alicate profesional',
		categoria: 'herramientas-manuales',
		imagen: '/productos/alicate-profesional.webp',
		resumen: 'Resistencia y precisión para quienes trabajan con herramienta todos los días.',
		descripcion:
			'El alicate profesional está hecho para aguantar el ritmo del trabajo diario en obra, taller o mantenimiento. Su construcción robusta ofrece un corte limpio y un agarre firme, jornada tras jornada.\n\n' +
			'Una herramienta confiable que no puede faltar en tu caja.',
		caracteristicas: [
			'Construcción robusta de uso profesional',
			'Corte limpio y agarre firme',
			'Mangos ergonómicos',
			'Versátil para obra, taller y hogar',
		],
		aplicaciones: ['Obras', 'Talleres', 'Mantenimiento', 'Uso doméstico'],
		especificaciones: [{ etiqueta: 'Tipo', valor: 'Alicate universal' }],
		variantes: [],
	},
	{
		nombre: 'Destornillador Stanley profesional de estrella',
		categoria: 'herramientas-manuales',
		marca: 'Stanley',
		imagen: '/productos/destornillador-estrella.webp',
		resumen: 'Calidad Stanley para atornillar con precisión y sin barrer la cabeza del tornillo.',
		descripcion:
			'Los destornilladores profesionales Stanley son sinónimo de durabilidad. Su punta de estrella (Phillips) encaja con precisión en el tornillo para transmitir la fuerza sin dañar la cabeza, y su mango está diseñado para un agarre firme y cómodo.\n\n' +
			'Disponible en punta de 1/4" y 1/8" con vástago de 4", las medidas más usadas en trabajos eléctricos, de ensamble y de mantenimiento.',
		caracteristicas: [
			'Marca Stanley, línea profesional',
			'Punta de estrella (Phillips) de ajuste preciso',
			'Mango ergonómico de agarre firme',
			'Medidas de 1/4" y 1/8" con vástago de 4"',
		],
		aplicaciones: ['Instalaciones eléctricas', 'Ensamble de muebles', 'Mantenimiento', 'Uso doméstico'],
		especificaciones: [
			{ etiqueta: 'Marca', valor: 'Stanley' },
			{ etiqueta: 'Tipo de punta', valor: 'Estrella (Phillips)' },
			{ etiqueta: 'Medidas', valor: '1/4" x 4" y 1/8" x 4"' },
			{ etiqueta: 'Referencias', valor: '69-145 y 69-177' },
		],
		variantes: ['1/4" x 4" · Ref. 69-145', '1/8" x 4" · Ref. 69-177'],
		destacado: true,
	},
	{
		nombre: 'Destornillador Stanley profesional de pala',
		categoria: 'herramientas-manuales',
		marca: 'Stanley',
		imagen: '/productos/destornillador-pala.webp',
		resumen: 'Punta plana Stanley: el clásico que resuelve en borneras, tomas e interruptores.',
		descripcion:
			'El destornillador de pala es indispensable en trabajos eléctricos: borneras, tomacorrientes, interruptores y tableros. La línea profesional Stanley ofrece una punta resistente que no se deforma con el uso y un mango cómodo para trabajar con control.\n\n' +
			'Disponible en punta de 1/8" y 1/4" con vástago de 4".',
		caracteristicas: [
			'Marca Stanley, línea profesional',
			'Punta de pala (plana) resistente',
			'Mango ergonómico',
			'Medidas de 1/8" y 1/4" con vástago de 4"',
		],
		aplicaciones: ['Tomas e interruptores', 'Borneras y tableros', 'Mantenimiento', 'Uso doméstico'],
		especificaciones: [
			{ etiqueta: 'Marca', valor: 'Stanley' },
			{ etiqueta: 'Tipo de punta', valor: 'Pala (plana)' },
			{ etiqueta: 'Medidas', valor: '1/8" x 4" y 1/4" x 4"' },
			{ etiqueta: 'Referencias', valor: '69-104 y 69-119' },
		],
		variantes: ['1/8" x 4" · Ref. 69-104', '1/4" x 4" · Ref. 69-119'],
	},
	{
		nombre: 'Destornillador probador de voltaje Stanley',
		categoria: 'medicion',
		marca: 'Stanley',
		referencia: '66-119',
		imagen: '/productos/tester-probador.webp',
		resumen: 'Detecta si hay corriente antes de tocar: dos herramientas en una.',
		descripcion:
			'Antes de trabajar en un toma, un interruptor o una lámpara, confirma si hay corriente. Este probador Stanley funciona como destornillador de pala y, al mismo tiempo, indica con una luz la presencia de voltaje.\n\n' +
			'Compacto, práctico y fácil de llevar en el bolsillo: una herramienta básica de seguridad para electricistas y para cualquier persona que haga reparaciones en casa.',
		caracteristicas: [
			'Indicador luminoso de presencia de voltaje',
			'Funciona también como destornillador de pala',
			'Tamaño de bolsillo',
			'Marca Stanley',
		],
		aplicaciones: ['Revisión de tomas e interruptores', 'Instalación de lámparas', 'Mantenimiento eléctrico'],
		especificaciones: [
			{ etiqueta: 'Marca', valor: 'Stanley' },
			{ etiqueta: 'Tipo', valor: 'Destornillador probador de voltaje' },
			{ etiqueta: 'Referencia', valor: '66-119' },
		],
		variantes: [],
	},

	/* ------------------- Herramientas agregadas despues del sitio viejo ------------------- */
	{
		nombre: 'Alicate cortafrío profesional Stanley',
		categoria: 'herramientas-manuales',
		marca: 'Stanley',
		imagen: '/productos/cortafrio-profesional.webp',
		resumen: 'Corte limpio y al ras en cable y alambre, con la fuerza que da una buena palanca.',
		descripcion:
			'El alicate cortafrío de corte diagonal resuelve cuando hay que cortar cable, alambre o amarras sin pelear con el material. Su filo entra en ángulo y deja un corte al ras, justo lo que se necesita al rematar una instalación eléctrica.\n\n' +
			'La línea profesional de Stanley suma mangos bimateriales que amortiguan el esfuerzo de la mano, para trabajar cómodo aunque la jornada sea larga.',
		caracteristicas: [
			'Corte diagonal para rematar al ras',
			'Filos de uso profesional',
			'Mangos bimateriales con buen agarre',
			'Marca Stanley',
		],
		aplicaciones: ['Instalaciones eléctricas', 'Mantenimiento', 'Obra y taller', 'Uso doméstico'],
		especificaciones: [
			{ etiqueta: 'Marca', valor: 'Stanley' },
			{ etiqueta: 'Tipo', valor: 'Alicate de corte diagonal (cortafrío)' },
			{ etiqueta: 'Línea', valor: 'Profesional' },
		],
		variantes: [],
		nuevo: true,
	},
	{
		nombre: 'Juego de alicates eléctricos Stanley 3 piezas',
		categoria: 'herramientas-manuales',
		marca: 'Stanley',
		referencia: '90-162',
		imagen: '/productos/juego-alicate-electrico.webp',
		resumen: 'Los tres alicates que más usa un electricista, en un solo juego.',
		descripcion:
			'Este juego reúne las tres herramientas que no pueden faltar en una instalación eléctrica: el alicate universal para sujetar y doblar, el de punta larga para llegar a espacios estrechos y el de corte diagonal para rematar.\n\n' +
			'Comprarlos juntos sale mejor que uno por uno, y de entrada tienes la caja lista para cualquier trabajo. Marca Stanley, con mangos bimateriales de buen agarre.',
		caracteristicas: [
			'3 piezas: universal, punta larga y corte diagonal',
			'Mangos bimateriales cómodos para jornadas largas',
			'Marca Stanley, referencia 90-162',
			'Cubre la mayoría de tareas eléctricas del día a día',
		],
		aplicaciones: ['Electricistas', 'Mantenimiento', 'Obra', 'Hogar'],
		especificaciones: [
			{ etiqueta: 'Marca', valor: 'Stanley' },
			{ etiqueta: 'Contenido', valor: '3 piezas' },
			{ etiqueta: 'Referencia', valor: '90-162' },
		],
		variantes: [],
		nuevo: true,
		destacado: true,
	},
	{
		nombre: 'Juego de destornilladores aislados Stanley 1000V 7 piezas',
		categoria: 'herramientas-manuales',
		marca: 'Stanley',
		referencia: '60-175',
		imagen: '/productos/juego-destornillador-stanley-aislado.webp',
		resumen: 'Siete destornilladores aislados para 1000V, en estuche y listos para trabajar con seguridad.',
		descripcion:
			'Trabajar con electricidad exige herramienta hecha para eso. Este juego Stanley reúne siete destornilladores con aislamiento para 1000V, en medidas de pala y estrella, de modo que tengas la punta correcta para cada tornillo sin improvisar.\n\n' +
			'Viene en estuche rígido, así que las puntas se conservan en buen estado y es fácil llevar el juego completo a donde esté el trabajo.',
		caracteristicas: [
			'7 piezas aisladas para trabajos hasta 1000V',
			'Medidas de pala y estrella',
			'Estuche rígido para transporte y orden',
			'Marca Stanley, referencia 60-175',
		],
		aplicaciones: ['Electricistas', 'Tableros y borneras', 'Mantenimiento industrial', 'Instalaciones residenciales'],
		especificaciones: [
			{ etiqueta: 'Marca', valor: 'Stanley' },
			{ etiqueta: 'Contenido', valor: '7 piezas' },
			{ etiqueta: 'Aislamiento', valor: '1000V' },
			{ etiqueta: 'Referencia', valor: '60-175' },
		],
		variantes: [],
		nuevo: true,
		destacado: true,
	},
	{
		nombre: 'Juego de destornilladores aislados Truper 1000V 6 piezas',
		categoria: 'herramientas-manuales',
		marca: 'Truper',
		referencia: '14196',
		imagen: '/productos/juego-destornillador-aislado.webp',
		resumen: 'La opción Truper para trabajar protegido: seis piezas aisladas 1000V con estuche.',
		descripcion:
			'Un juego completo de destornilladores aislados para 1000V, pensado para quienes manipulan tableros, tomas e interruptores y necesitan reducir el riesgo en cada maniobra.\n\n' +
			'Incluye seis piezas entre pala y estrella, en un estuche que mantiene todo ordenado y a la mano. Una alternativa confiable y económica de Truper.',
		caracteristicas: [
			'6 piezas aisladas para trabajos hasta 1000V',
			'Puntas de pala y estrella',
			'Estuche organizador',
			'Marca Truper, referencia 14196',
		],
		aplicaciones: ['Electricistas', 'Mantenimiento', 'Tableros eléctricos', 'Uso doméstico'],
		especificaciones: [
			{ etiqueta: 'Marca', valor: 'Truper' },
			{ etiqueta: 'Contenido', valor: '6 piezas' },
			{ etiqueta: 'Aislamiento', valor: '1000V' },
			{ etiqueta: 'Referencia', valor: '14196' },
		],
		variantes: [],
		nuevo: true,
	},
	{
		nombre: 'Juego de destornilladores Stanley profesional',
		categoria: 'herramientas-manuales',
		marca: 'Stanley',
		imagen: '/productos/juego-destornillador-stanley-profesional.webp',
		resumen: 'Varias medidas de pala y estrella en un solo juego: la base de cualquier caja de herramientas.',
		descripcion:
			'Tener una sola medida de destornillador siempre termina en tornillos barridos. Este juego profesional Stanley trae varias medidas de pala y estrella, para que uses la punta que de verdad encaja.\n\n' +
			'Sirve igual para ensamblar muebles, revisar un electrodoméstico o atender una instalación: es la herramienta que más se usa en casa y en el trabajo.',
		caracteristicas: [
			'Varias medidas de pala y estrella',
			'Línea profesional Stanley',
			'Mangos ergonómicos de buen agarre',
			'Ideal como juego base',
		],
		aplicaciones: ['Hogar', 'Taller', 'Mantenimiento', 'Ensamble de muebles'],
		especificaciones: [
			{ etiqueta: 'Marca', valor: 'Stanley' },
			{ etiqueta: 'Línea', valor: 'Profesional' },
			{ etiqueta: 'Tipo de puntas', valor: 'Pala y estrella' },
		],
		variantes: [],
		nuevo: true,
	},
	{
		nombre: 'Llave de tubo Stanley',
		categoria: 'herramientas-manuales',
		marca: 'Stanley',
		imagen: '/productos/llave-de-tubo-stanley.webp',
		resumen: 'La llave de plomería que agarra donde otras resbalan.',
		descripcion:
			'La llave de tubo (tipo stillson) es la herramienta clásica de plomería: su mordaza dentada y ajustable muerde la tubería y aprieta más cuanta más fuerza aplicas, para aflojar uniones oxidadas o apretar accesorios con firmeza.\n\n' +
			'Indispensable para instalaciones de agua y mantenimiento general.',
		caracteristicas: [
			'Mordaza dentada ajustable para tubería',
			'Mayor agarre a mayor fuerza aplicada',
			'Construcción robusta, marca Stanley',
			'Para apretar y aflojar uniones roscadas',
		],
		aplicaciones: ['Plomería', 'Instalaciones de agua', 'Mantenimiento', 'Obra'],
		especificaciones: [
			{ etiqueta: 'Marca', valor: 'Stanley' },
			{ etiqueta: 'Tipo', valor: 'Llave de tubo (stillson)' },
		],
		variantes: [],
		nuevo: true,
	},
	{
		nombre: 'Llave expansiva Stanley',
		categoria: 'herramientas-manuales',
		marca: 'Stanley',
		imagen: '/productos/llave-expansiva-alemana-stanley.webp',
		resumen: 'Una sola llave para muchas medidas de tuerca: se ajusta a lo que tengas enfrente.',
		descripcion:
			'La llave expansiva (ajustable) reemplaza a todo un juego de llaves fijas: giras el tornillo sinfín y la mordaza se adapta a la medida de la tuerca o el perno.\n\n' +
			'Es la herramienta práctica por excelencia para mantenimiento, plomería y reparaciones en casa, donde nunca se sabe con qué medida te vas a encontrar.',
		caracteristicas: [
			'Mordaza ajustable a varias medidas',
			'Reemplaza varias llaves fijas',
			'Acabado y construcción Stanley',
			'Práctica para mantenimiento y plomería',
		],
		aplicaciones: ['Mantenimiento', 'Plomería', 'Hogar', 'Taller'],
		especificaciones: [
			{ etiqueta: 'Marca', valor: 'Stanley' },
			{ etiqueta: 'Tipo', valor: 'Llave expansiva (ajustable)' },
		],
		variantes: [],
		nuevo: true,
	},

	/* --------------------------------- Medición --------------------------------- */
	{
		nombre: 'Flexómetro Stanley 8 metros',
		categoria: 'medicion',
		marca: 'Stanley',
		imagen: '/productos/flexometro-8metros.webp',
		resumen: 'Ocho metros de cinta para medir de un solo tiro en obra.',
		descripcion:
			'Un flexómetro de 8 metros cubre de sobra una fachada, una habitación completa o un tramo de tubería sin tener que medir por partes, que es donde se cuelan los errores.\n\n' +
			'La línea Global Plus de Stanley trae carcasa resistente para aguantar los golpes del día a día, freno para fijar la medida y gancho en la punta para medir sin ayuda.',
		caracteristicas: [
			'Cinta de 8 metros (26 pies)',
			'Carcasa resistente a los golpes',
			'Freno para fijar la medida',
			'Gancho en la punta para medir solo',
		],
		aplicaciones: ['Obra y construcción', 'Remodelaciones', 'Carpintería', 'Instalaciones'],
		especificaciones: [
			{ etiqueta: 'Marca', valor: 'Stanley' },
			{ etiqueta: 'Modelo', valor: 'Global Plus' },
			{ etiqueta: 'Longitud', valor: '8 m (26 pies)' },
		],
		variantes: [],
		nuevo: true,
		destacado: true,
	},
	{
		nombre: 'Flexómetro Truper liviano 3 metros',
		categoria: 'medicion',
		marca: 'Truper',
		imagen: '/productos/flexometro-liviano-3metros.webp',
		resumen: 'Compacto y liviano: el que siempre llevas en el bolsillo.',
		descripcion:
			'Para medidas rápidas en casa, en el taller o en una visita técnica, un flexómetro de 3 metros es más práctico que uno grande: pesa poco, cabe en el bolsillo y está siempre a la mano.\n\n' +
			'La línea Gripper de Truper tiene cuerpo con agarre de goma, para que no se resbale ni se maltrate con las caídas.',
		caracteristicas: [
			'Cinta de 3 metros (10 pies)',
			'Cuerpo compacto y liviano',
			'Agarre de goma antideslizante',
			'Clip para llevar en el cinturón',
		],
		aplicaciones: ['Hogar', 'Visitas técnicas', 'Taller', 'Medidas rápidas'],
		especificaciones: [
			{ etiqueta: 'Marca', valor: 'Truper' },
			{ etiqueta: 'Modelo', valor: 'Gripper' },
			{ etiqueta: 'Longitud', valor: '3 m (10 pies)' },
		],
		variantes: [],
		nuevo: true,
	},
]
