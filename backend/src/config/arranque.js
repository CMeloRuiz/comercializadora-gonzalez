/**
 * Primera senal de vida del proceso.
 *
 * Se importa antes que nada en server.js, asi que se imprime incluso si luego
 * falla la configuracion, la base o alguna dependencia nativa. Sirve para
 * distinguir en los logs de un despliegue dos cosas que se parecen mucho:
 * que el proceso nunca llego a arrancar, o que arranco y se quedo colgado
 * mas adelante.
 */

console.log(`\n  [arranque] Node ${process.version} · PORT=${process.env.PORT ?? '(sin definir)'} · ${new Date().toISOString()}`)
