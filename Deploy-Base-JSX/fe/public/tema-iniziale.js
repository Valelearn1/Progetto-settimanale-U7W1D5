// Applica il tema salvato prima che React parta: niente lampo chiaro in tema scuro.
// File esterno (non inline) perche' la Content-Security-Policy ammette solo script 'self'.
try {
  var t = localStorage.getItem('salone.tema')
  if (t !== 'light' && t !== 'dark') t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  document.documentElement.dataset.theme = t
} catch (e) {
  document.documentElement.dataset.theme = 'light'
}
