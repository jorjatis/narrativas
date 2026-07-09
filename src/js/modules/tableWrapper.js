export default function tableWrapper() {
  const wrapper = document.querySelector('.v-n-table-wrapper');
  if (!wrapper) return;

  const urlCSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTvDx2f3hMeLtuHEfXCQg6eY0nwt1E3dQTz3Fm7Dn475mR1e_FSkQ0lODB7BCmKn7KQEIlkLifKlAGG/pub?output=csv';

  const loading = wrapper.querySelector('#loadingMessage');
  const empty = wrapper.querySelector('#emptyResults');
  const searchInput = wrapper.querySelector('#communitySearch');
  const container = wrapper.querySelector('#communitiesContainer');
  const clearSearch = wrapper.querySelector('#clearSearch');

  let communities = [];
  let currentData = [];

  init();

  async function init() {
    try {
      const response = await fetch(urlCSV);

      if (!response.ok) throw new Error('Error cargando CSV');

      const csv = await response.text();

      communities = groupByCommunity(parseCSV(csv));
      currentData = cloneCommunities(communities);

      loading.hidden = true;
      searchInput.disabled = false;

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

    return rows.map(values => Object.fromEntries(
      headers.map((header, index) => [header, values[index] || ''])
    ));
  }

  function groupByCommunity(rows) {
    const grouped = {};

    rows.forEach(row => {
      const community = row['Comunidad Autónoma'];

      if (!grouped[community]) grouped[community] = [];

      grouped[community].push(row);
    });

    return Object.entries(grouped)
      .map(([name, items]) => ({
        name,
        open: false,
        asc: true,
        items: items.sort(sortLocations)
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }

  function cloneCommunities(data) {
    return data.map(c => ({
      ...c,
      items: [...c.items]
    }));
  }

  function sortLocations(a, b) {
    return `${a.Provincia} ${a.Localidad}`
      .localeCompare(`${b.Provincia} ${b.Localidad}`, 'es');
  }

  function normalize(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function render(data) {
    container.innerHTML = '';

    empty.hidden = !!data.length;
    if (!data.length) return;

    data.forEach((community, index) => {
      container.insertAdjacentHTML('beforeend', `
      <div class="community">

        <div class="community__header" data-index="${index}">
          <button class="community__toggle" type="button">
            ${community.open ? '−' : '+'}
          </button>

          <span>${community.name}</span>
        </div>

        <div class="community__body ${community.open ? 'is-open' : ''}">
          ${renderTable(community, index)}
        </div>

      </div>
    `);
    });

    updateScrollShadows();
  }

  function renderTable(community, index) {
    let currentProvince = '';

    const rows = community.items.map(item => {
      let html = '';

      if (item.Provincia !== currentProvince) {
        currentProvince = item.Provincia;

        html += `
          <tr class="province-row">
            <td colspan="4">${item.Provincia}</td>
          </tr>
        `;
      }

      html += `
        <tr>
          <td>${item.Localidad}</td>

          <td>${item['Qué incluye la entrada']}</td>

          <td>${item['Otras especificaciones']}</td>

          <td>
            ${item['Página web']
          ? `<a href="${item['Página web']}" target="_blank" rel="noopener noreferrer">Ver web</a>`
          : '-'
        }
          </td>
        </tr>
      `;

      return html;
    }).join('');

    return `
      <div class="community-table-shadow has-right-shadow">
        <div class="community-table-wrapper">
          <table class="community-table">

            <colgroup>
              <col style="width:18%">
              <col style="width:35%">
              <col style="width:35%">
              <col style="width:12%">
            </colgroup>

            <thead>
              <tr>
                <th>Provincia / Localidad</th>
                <th>Qué incluye la entrada</th>
                <th>Otras especificaciones</th>
                <th>Página web</th>
              </tr>
            </thead>

            <tbody>${rows}</tbody>

          </table>
        </div>
      </div>
    `;
  }

  function updateScrollShadows() {
    const wrappers = container.querySelectorAll('.community-table-wrapper');

    wrappers.forEach(wrapper => {
      const shadow = wrapper.parentElement;

      const update = () => {
        shadow.classList.toggle(
          'has-left-shadow',
          wrapper.scrollLeft > 0
        );

        shadow.classList.toggle(
          'has-right-shadow',
          wrapper.scrollLeft + wrapper.clientWidth < wrapper.scrollWidth - 1
        );
      };

      update();

      wrapper.addEventListener('scroll', update);
    });
  }

  function bindEvents() {
    wrapper.addEventListener('click', event => {
      const header = event.target.closest('.community__header');

      if (header) {
        const index = Number(header.dataset.index);
        currentData[index].open = !currentData[index].open;
        render(currentData);
      }

      if (event.target.classList.contains('sort-subtable')) {
        const community = currentData[Number(event.target.dataset.index)];

        community.asc = !community.asc;

        community.items.sort((a, b) => {
          const result = sortLocations(a, b);
          return community.asc ? result : -result;
        });

        render(currentData);
      }
    });

    searchInput.addEventListener('input', event => {
      clearSearch.hidden = event.target.value.length === 0;

      const value = normalize(event.target.value.trim());

      if (value.length < 3) {
        currentData = cloneCommunities(communities)
          .map(c => ({ ...c, open: false }));

        render(currentData);
        return;
      }

      currentData = communities
        .map(community => {

          if (normalize(community.name).startsWith(value)) {
            return {
              ...community,
              open: false,
              items: [...community.items]
            };
          }

          const matches = community.items.filter(item =>
            normalize(item.Provincia).startsWith(value) ||
            normalize(item.Localidad).startsWith(value)
          );

          if (!matches.length) return null;

          return {
            ...community,
            open: true,
            items: matches
          };
        })
        .filter(Boolean);

      render(currentData);
    });

    clearSearch.addEventListener('click', () => {
      searchInput.value = '';
      searchInput.dispatchEvent(new Event('input'));
      searchInput.focus();
    });
  }
}