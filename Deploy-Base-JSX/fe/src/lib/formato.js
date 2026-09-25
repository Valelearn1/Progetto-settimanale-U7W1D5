const numero = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 0 })

/** 64900 -> "€64.900", come nel design. */
export const euro = (valore) => `€${numero.format(Number(valore))}`

/** 58500 -> "58.500 km" */
export const km = (valore) => `${numero.format(Number(valore))} km`

export const CONDIZIONI = {
  NUOVO: 'Nuovo',
  KM_0: 'Km 0',
  USATO: 'Usato',
}

export const CARBURANTI = {
  BENZINA: 'Benzina',
  DIESEL: 'Diesel',
  IBRIDA: 'Ibrida',
  ELETTRICA: 'Elettrica',
  GPL: 'GPL',
  METANO: 'Metano',
}

/**
 * Ordinamenti offerti nella select: ognuno corrisponde a una coppia sort/dir
 * che il backend accetta (lo stesso elenco chiuso e' verificato anche li').
 */
export const ORDINAMENTI = [
  { valore: 'recenti-desc', etichetta: 'Più recenti inseriti' },
  { valore: 'prezzo-asc', etichetta: 'Prezzo: dal più basso' },
  { valore: 'prezzo-desc', etichetta: 'Prezzo: dal più alto' },
  { valore: 'km-asc', etichetta: 'Chilometraggio crescente' },
  { valore: 'titolo-asc', etichetta: 'Nome (A-Z)' },
]
