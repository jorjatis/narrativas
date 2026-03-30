export const SS_CALENDAR = {
  29: { key: "domingo-29", name: "Domingo 29" },
  30: { key: "lunes-30", name: "Lunes 30" },
  31: { key: "martes-31", name: "Martes 31" },
  1:  { key: "miercoles-1", name: "Miércoles 1" },
  2:  { key: "jueves-2", name: "Jueves 2" },
  3:  { key: "viernes-3", name: "Viernes 3" },
  4:  { key: "sabado-4", name: "Sábado 4" },
  5:  { key: "domingo-5", name: "Domingo 5" }
};

// Devuelve el objeto del día actual basado en la fecha del sistema
export function getSSDay() {
  // Ejemplo de uso para testear una fecha entre el 2 (marzo) 29 (sabado) y el 3 (abril) 5 (domingo)
  // const today = new Date(2026, 2, 31);
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth(); // 2: Marzo, 3: Abril

  // Caso especial Madrugá (3 de Abril antes de las 7:00)
  if (month === 3 && day === 3 && today.getHours() < 7) {
    return { key: "madruga", name: "Madrugá", isMadruga: true };
  }

  const data = SS_CALENDAR[day];
  // Si estamos fuera de rango, devolvemos Domingo de Ramos por defecto
  return data || SS_CALENDAR[29];
}

// IDs limpios (quita espacios y acentos si fuera necesario)
export const cleanStr = (str) => str.replace(/\s+/g, '').toLowerCase();