const loadShipData = () => {
  return Promise.all([
    fetch('dist/ships.json').then(response => response.json()),
    fetch('dist/types.json').then(response => response.json())
  ]);
};

const RARITY = {
  2: "Common",
  3: "Rare",
  4: "Elite",
  5: "Super Rare/Priority",
  6: "Decisive"
};

const NATIONALITY = {
  98: "Universal",
  1: "Eagle Union",
  2: "Royal Navy",
  3: "Sakura Empire",
  4: "Iron Blood",
  5: "Dragon Empery",
  6: "Sardegna Empire",
  7: "Northern Parliament",
  8: "Iris Libre",
  9: "Vichya Dominion",
  96: "Tempesta",
  97: "Meta",
  101: "Neptunia",
  104: "Kizuna AI",
  105: "Hololive",
  106: "Venus Vacation",
  107: "IdolMaster",
  108: "SSSS Gridman",
  109: "Atelier Ryza",
  110: "Senran Kagura",
};

loadShipData().then(([ships, types]) => {
  const shipDataSection = document.getElementById('ship-data');

  const shipTable = document.createElement('table');
  const shipTableBody = document.createElement('tbody'); // Создаем тело таблицы

  // Create table header row
  const headerRow = shipTable.createTHead().insertRow(); // Создаем заголовок таблицы
  const headers = ["Name", "Type", "Rarity", "Nationality", "Available"];

  const arrowUp = "\u25B2";
  const arrowDown = "\u25BC";

  const sortDirection = {
    asc: 1,
    desc: -1
  };

  const sortState = {};

  headers.forEach(headerText => {
    const headerCell = document.createElement("th");
    headerCell.textContent = headerText;
    headerCell.addEventListener("click", () => {
      sortTable(headerText);
    });
    headerRow.appendChild(headerCell);

    const sortIndicator = document.createElement("span");
    sortIndicator.className = "sort-indicator";
    headerCell.appendChild(sortIndicator);

    sortState[headerText] = 'none';
  });

  function sortTable(headerText) {
    const currentSortState = sortState[headerText];
    const columnIndex = headers.indexOf(headerText);

    // Reset sort indicators
    Object.values(sortState).forEach(state => {
      state !== 'none' && (sortState[headerText] = 'none');
    });

    if (currentSortState === 'none' || currentSortState === 'desc') {
      sortState[headerText] = 'asc';
    } else {
      sortState[headerText] = 'desc';
    }

    // Update sort indicators
    const indicators = document.querySelectorAll('.sort-indicator');
    indicators.forEach(indicator => {
      indicator.textContent = '';
    });
    const indicator = headerRow.cells[columnIndex].querySelector('.sort-indicator');
    if (sortState[headerText] === 'asc') {
      indicator.textContent = arrowUp;
    } else if (sortState[headerText] === 'desc') {
      indicator.textContent = arrowDown;
    }

    const rows = Array.from(shipTableBody.rows); // Получаем строки из тела таблицы

    if (headerText === "Available") {
      const activeRows = rows.filter(row => {
        const checkbox = row.cells[columnIndex].querySelector('input[type="checkbox"]');
        return checkbox.checked;
      });

      const inactiveRows = rows.filter(row => {
        const checkbox = row.cells[columnIndex].querySelector('input[type="checkbox"]');
        return !checkbox.checked;
      });

      const sortedRows = sortDirection[sortState[headerText]] === 1 ? [...activeRows, ...inactiveRows] : [...inactiveRows, ...activeRows];
      shipTableBody.innerHTML = ''; // Очищаем тело таблицы
      sortedRows.forEach(row => shipTableBody.appendChild(row)); // Добавляем отсортированные строки обратно
    } else {
      rows.sort((a, b) => {
        const cellA = a.cells[columnIndex].textContent.trim();
        const cellB = b.cells[columnIndex].textContent.trim();
        return sortDirection[sortState[headerText]] * cellA.localeCompare(cellB, undefined, {numeric: true});
      });
      shipTableBody.innerHTML = ''; // Очищаем тело таблицы
      rows.forEach(row => shipTableBody.appendChild(row)); // Добавляем отсортированные строки обратно
    }
  }

  for (const shipId in ships) {
    const ship = ships[shipId];
    
    if (
      !ship.name.en || 
      !types[ship.type].en || 
      !RARITY[ship.data[Object.keys(ship.data)[0]].rarity] || 
      !NATIONALITY[ship.nationality]
    ) {
      console.warn(`Skipping ship with ID ${shipId} due to missing data.`);
      continue; // Skip to the next ship if any field is empty
    }
    // Create table row with ship data
    const dataRow = shipTableBody.insertRow();
    dataRow.insertCell().textContent = ship.name.en || ""; // Provide a default empty string if the field is missing
    const shipType = types[ship.type].en || "";
    dataRow.insertCell().textContent = shipType;
    const rarity = ship.data[Object.keys(ship.data)[0]].rarity;
    const rarityName = RARITY[rarity];
    dataRow.insertCell().textContent = rarityName;

    const nationalityName = NATIONALITY[ship.nationality];
    dataRow.insertCell().textContent = nationalityName;

    // Add checkbox for availability
    const checkboxCell = dataRow.insertCell();
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `ship_${shipId}_checkbox`;
    checkboxCell.appendChild(checkbox);

    // Load availability status from localStorage
    const availabilityKey = `ship_${shipId}_available`;
    const savedAvailability = localStorage.getItem(availabilityKey);
    if (savedAvailability) {
      checkbox.checked = JSON.parse(savedAvailability);
    }
  }

  shipTable.appendChild(shipTableBody); // Добавляем тело таблицы к таблице
  shipDataSection.appendChild(shipTable);
});
