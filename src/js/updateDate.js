export function initUpdateTime() {
  const time = document.querySelector('time.v-h__p');
  if (!time) return;

  const spanWeekDay = time.querySelector('span');
  if (!spanWeekDay) return;

  const today = new Date();

  const weekDay = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long'
  }).format(today);

  const dateRest = new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(today);

  spanWeekDay.textContent =
    weekDay.charAt(0).toUpperCase() + weekDay.slice(1);

  time.replaceChildren(
    spanWeekDay,
    document.createTextNode(` ${dateRest}`)
  );

  time.setAttribute(
    'datetime',
    today.toISOString().split('T')[0]
  );
}
