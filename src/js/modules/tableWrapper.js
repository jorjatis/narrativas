export default function tableWrapper() {
  const wrapper = document.querySelector('.v-n-table-wrapper');

  if (!wrapper) return;

  const urlCSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTvDx2f3hMeLtuHEfXCQg6eY0nwt1E3dQTz3Fm7Dn475mR1e_FSkQ0lODB7BCmKn7KQEIlkLifKlAGG/pub?output=csv';

  const loading = wrapper.querySelector('#loadingMessage');
  const empty = wrapper.querySelector('#emptyResults');
  const searchInput = wrapper.querySelector('#communitySearch');
  const sortButton = wrapper.querySelector('#sortCommunitiesBtn');

  let communities = [];
  let currentData = [];
  let communitiesAsc = false;

  init();

  async function init() {
    try {
      const response = await fetch(urlCSV);

      if (!response.ok) {
        throw new Error('Error cargando CSV');
      }

      const csv = await response.text();

      const rows = parseCSV(csv);

      communities = groupByCommunity(rows);

      currentData = communities.map(c => ({
        ...c,
        items: [...c.items]
      }));

      loading.hidden = true;

      searchInput.disabled = false;
      sortButton.disabled = false;

      render(currentData);

      bindEvents();

    } catch (error) {

      console.error(error);

      loading.textContent = 'No se han podido cargar los datos.';
    }
  }

  function parseCSV(csv) {
    const rows = [];
    let row = [];
    let value = '';
    let insideQuotes = false;

    for (let i = 0; i < csv.length; i++) {
      const char = csv[i];
      const next = csv[i + 1];

      if (char === '"') {
        if (insideQuotes && next === '"') {
          value += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        row.push(value.trim());
        value = '';
      } else if ((char === '\n' || char === '\r') && !insideQuotes) {
        if (value || row.length) {
          row.push(value.trim());
          rows.push(row);
        }

        row = [];
        value = '';

        if (char === '\r' && next === '\n') i++;
      } else {
        value += char;
      }
    }

    if (value || row.length) {
      row.push(value.trim());
      rows.push(row);
    }

    const headers = rows.shift();

    return rows.map(values => {
      const obj = {};

      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });

      return obj;
    });
  }

  function groupByCommunity(rows) {
    const grouped = {};

    rows.forEach(row => {

      const community = row['Comunidad Autónoma'];

      if (!grouped[community]) {
        grouped[community] = [];
      }

      grouped[community].push(row);
    });

    return Object.entries(grouped)
      .map(([name, items]) => ({
        name,
        items: items.sort((a, b) => {
          const aValue = `${a.Provincia} ${a.Localidad}`;
          const bValue = `${b.Provincia} ${b.Localidad}`;

          return aValue.localeCompare(
            bValue,
            'es'
          );
        }),
        open: false,
        asc: true
      }))
      .sort((a, b) =>
        a.name.localeCompare(b.name, 'es')
      );
  }

  function render(data) {
    const container = wrapper.querySelector('#communitiesContainer');

    container.innerHTML = '';

    empty.hidden = !!data.length;

    if (!data.length) return;

    data.forEach((community, index) => {
      container.insertAdjacentHTML(
        'beforeend',
        renderCommunity(community, index)
      );
    });
  }

  function renderCommunity(community, index) {
    return `
      <div class="community">
        <div class="community__header" data-index="${index}">
          <button type="button" class="community__toggle">
            ${community.open ? '−' : '+'}
          </button>
          <span class="community__name">
            ${community.name}
          </span>
        </div>
        <div class="community__body" style="display:${community.open ? 'block' : 'none'}">
          ${renderSubtable(community, index)}
        </div>
      </div>
    `;
  }

  function renderSubtable(community, index) {
    return `
      <table class="community-table">
        <thead>
          <tr>
            <th>
              Provincia / Localidad
              <button type="button" class="sort-subtable" data-index="${index}">
                ⇅
              </button>
            </th>
            <th>
              Qué incluye la entrada
            </th>
            <th>
              Otras especificaciones
            </th>
            <th>
              Página web
            </th>
          </tr>
        </thead>
        <tbody>
          ${community.items
            .map(renderRow)
            .join('')}
        </tbody>
      </table>
    `;
  }

  function renderRow(item) {
    return `
      <tr>
        <td>
          <strong>${item.Provincia}</strong>
          <br>
          ${item.Localidad}
        </td>
        <td>
          ${item['Qué incluye la entrada']}
        </td>
        <td>
          ${item['Otras especificaciones']}
        </td>
        <td>
          ${item['Página web']
            ? `
              <a href="${item['Página web']}" target="_blank" rel="noopener noreferrer">
                Ver web
              </a>
              `
            : '-'
          }
        </td>
      </tr>
    `;
  }

  function normalizeText(text) {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function bindEvents() {
    wrapper.addEventListener('click', event => {
      const header = event.target.closest('.community__header');

      if (header) {
        const index = Number(header.dataset.index);

        currentData[index].open = !currentData[index].open;

        render(currentData);
      }

      if ( event.target.id === 'sortCommunitiesBtn') {
        communitiesAsc = !communitiesAsc;

        currentData.sort((a, b) =>
          communitiesAsc
            ? b.name.localeCompare(a.name, 'es')
            : a.name.localeCompare(b.name, 'es')
        );

        render(currentData);
      }

      if ( event.target.classList.contains('sort-subtable') ) {
        const index = Number(event.target.dataset.index);

        const community = currentData[index];
        community.asc = !community.asc;
        community.items.sort((a, b) => {
          const aValue = `${a.Provincia} ${a.Localidad}`;
          const bValue = `${b.Provincia} ${b.Localidad}`;

          return community.asc
            ? bValue.localeCompare(aValue, 'es')
            : aValue.localeCompare(bValue, 'es');
        });

        render(currentData);
      }
    });

    searchInput.addEventListener(
      'input',
      event => {
        const value = normalizeText(
          event.target.value.trim()
        );

        if (value.length < 3) {
          currentData = communities.map(c => ({
            ...c,
            open: false,
            items: [...c.items]
          }));

          render(currentData);

          return;
        }

        currentData = communities
          .map(community => {

            if ( normalizeText(community.name).startsWith(value) ) {
              return {
                ...community,
                open: false,
                items: [...community.items]
              };
            }

            const matches = community.items.filter(item => {
              return (
                normalizeText(item.Provincia).startsWith(value) ||
                normalizeText(item.Localidad).startsWith(value)
              );
            });

            if (!matches.length) {
              return null;
            }

            const provinceSearch = matches.some(item =>
              normalizeText(item.Provincia).startsWith(value)
            );

            return {
              ...community,
              open: true,
              items: provinceSearch
                ? [...community.items]
                : matches
            };
          })
          .filter(Boolean);

        render(currentData);
      }
    );
  }
}