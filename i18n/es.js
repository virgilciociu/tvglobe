window.I18N = window.I18N || {};
window.I18N.es = {
  navGlobe: 'Globo',
  navInfo: 'Información',
  libraryBtn: 'Favoritos e historial',
  bannerTitle: 'En construcción',
  bannerText: 'Muy pronto podrás enviar a tu televisor los canales que ahora ves solo en el móvil. ¡Estate atento!',
  favorites: 'Favoritos',
  history: 'Historial',
  clearHistory: 'Borrar historial',
  noFavorites: 'Aún no hay favoritos. Toca la estrella junto a un canal.',
  noHistory: 'Aún no has visto ningún canal.',
  addFavorite: 'Añadir a favoritos',
  removeFavorite: 'Quitar de favoritos',
  officialTime: 'Hora oficial',
  localTime: 'Hora oficial (capital)',
  channels: 'Canales',
  search: 'Buscar canales',
  noChannels: 'Este país aún no tiene canales de televisión incluidos, porque este sitio web todavía está en construcción.',
  noResults: 'Ningún canal coincide con tu búsqueda.',
  officialSite: 'Sitio oficial',
  loading: 'Cargando…',
  playError: 'Este canal no se puede reproducir ahora mismo.',
  officialPlayer: 'Reproductor oficial',
  openOfficial: 'Abrir en el sitio oficial',
  embedHint: 'Si el reproductor no carga, este canal no permite la incrustación.',
  close: 'Cerrar',
  language: 'Idioma',
  categories: {
    general: 'General', news: 'Noticias', music: 'Música', movies: 'Cine', sports: 'Deportes',
    religious: 'Religión', kids: 'Infantil', business: 'Economía', outdoor: 'Aire libre',
    entertainment: 'Entretenimiento', culture: 'Cultura', comedy: 'Comedia', series: 'Series',
    lifestyle: 'Estilo de vida', travel: 'Viajes', classic: 'Clásicos'
  }
};
Object.assign(window.I18N.es, {
  infoH1: 'Acerca de Globe',
  introP1: 'Globe es un globo terráqueo 3D giratorio. Elige un país y mira sus canales de televisión en el navegador. Globe no aloja, graba ni copia ninguna señal de televisión.',

  sec1Title: 'Tres formas de abrir un canal',
  way1Title: 'Reproducido directamente en Globe',
  way1Text: 'El canal publica una emisión en directo abierta (HLS). Globe reproduce esa señal pública en su propio reproductor. Ejemplos: la televisión pública TVR, muchas televisiones locales y canales de música.',
  way2Title: 'Reproductor oficial, mostrado en Globe',
  way2Text: 'El canal es comercial y sus derechos de emisión son de pago (por ejemplo Antena 1, Kanal D, Prima News o Voyo Sport). Globe no toma su señal. Muestra el sitio web oficial del canal dentro de un marco (iframe), así que el reproductor oficial, su publicidad, sus condiciones y cualquier inicio de sesión quedan exactamente como el canal quiere.',
  way3Title: 'Solo enlace',
  way3Text: 'Algunos sitios web se niegan a mostrarse dentro de otra página. En ese caso el marco queda vacío y el enlace de debajo abre el sitio oficial.',

  sec2Title: 'Por qué los canales comerciales se abren en sus sitios originales',
  why1: 'Los canales pagan por sus derechos de emisión. Copiar su señal y retransmitirla desde otro sitio sin permiso es una retransmisión no autorizada, aunque la señal sea técnicamente fácil de alcanzar.',
  why2: 'Con un reproductor oficial, el espectador mira en la propia página del canal. El canal mantiene el control: su reproductor, su publicidad, sus restricciones por país y su derecho a bloquear la incrustación.',
  why3: 'Globe nunca elude una restricción. Si un canal no quiere mostrarse dentro de Globe, puede bloquearlo (véase «Por qué algunos canales no cargan» más abajo) y Globe lo respeta.',

  sec3Title: 'Detalles técnicos',
  tech1: 'Los datos de los canales provienen de las listas públicas de iptv-org (canales, señales y lista de bloqueo). Se excluyen los canales bloqueados, cerrados o para adultos.',
  tech2: 'Solo se usan señales HTTPS en formato HLS (.m3u8). Los navegadores no pueden reproducir directamente otros formatos, y una página HTTPS no puede cargar señales HTTP simples (contenido mixto).',
  tech3: 'Cada señal se prueba antes de entrar en la lista: el servidor debe responder, devolver una lista de reproducción válida (debe empezar por #EXTM3U) y permitir el acceso desde una página web (CORS). Las señales caídas se eliminan. La lista es una instantánea, así que un canal puede dejar de funcionar más tarde.',
  tech4: 'Las señales que vienen de servidores de una plataforma comercial (por ejemplo la red Antena Play) o que contienen un token de acceso no se reproducen en Globe. Esos canales se muestran como reproductores oficiales.',
  tech5: 'La reproducción usa hls.js (Media Source Extensions). Safari y los iPhone reproducen HLS de forma nativa. Si una señal no arranca en 15 segundos, Globe prueba una dirección de respaldo y, si no la hay, muestra un mensaje.',
  tech6: 'Los reproductores oficiales se muestran en un iframe con restricciones (sandbox): se permiten scripts, formularios y ventanas emergentes para que el reproductor funcione, pero la página incrustada no puede tomar el control de Globe ni redirigirlo. Se permiten la reproducción automática y la pantalla completa. Las direcciones que empiezan por http:// se convierten a https://.',
  tech7: 'El globo se dibuja con WebGL (globe.gl y three.js) a partir de las formas de países de Natural Earth. La hora oficial usa la API Intl del navegador y la zona horaria IANA del país; en países con varias zonas se usa la de la capital. Las banderas vienen de flagcdn.com.',
  tech8: 'El idioma se toma de los ajustes del teléfono o del navegador (inglés, alemán, rumano, francés o español; inglés si el tuyo no está disponible). Puedes cambiarlo con el selector y tu elección se guarda en el navegador.',

  sec4Title: 'Por qué algunos canales no cargan',
  fail1: 'El sitio web envía X-Frame-Options, o una Content-Security-Policy con frame-ancestors, que indica al navegador que no lo muestre dentro de otras páginas.',
  fail2: 'Bloqueo geográfico: muchas señales y reproductores solo funcionan dentro del país del canal.',
  fail3: 'Pago o inicio de sesión: los servicios de pago como Voyo Sport necesitan una suscripción.',
  fail4: 'Los avisos de cookies, anuncios o scripts del sitio oficial pueden bloquear el reproductor hasta que aceptes o interactúes.',
  fail5: 'La señal se movió, se detuvo o su propietario la retiró.',

  sec5Title: 'Privacidad',
  privacy1: 'Globe no tiene cuentas, ni analíticas, ni publicidad. Lo único que guarda en tu navegador es tu elección de idioma.',
  privacy2: 'Tu navegador contacta directamente con terceros: bibliotecas de código (unpkg y jsDelivr), formas de países (GitHub), banderas (flagcdn.com), los servidores de señal de los canales y los sitios oficiales cuando abres un reproductor oficial. Allí se aplican sus propias cookies y normas de publicidad.',

  sec6Title: 'Canales en esta versión',
  channelsIntro: 'Generado a partir de la lista actual de canales.',
  countryLine: '{country}: {direct} reproducidos directamente, {official} reproductores oficiales',
  officialNames: 'Reproductores oficiales:',

  dedication: 'Este sitio web fue creado por Virgil C y está en memoria del Sr. I. Roth, mi vecino.'
});
