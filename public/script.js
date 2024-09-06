document.getElementById('uploadXmlBtn').addEventListener('click', function() {
    document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(e.target.result, "application/xml");
            const xmlDisplay = document.getElementById('xmlDisplay');
            xmlDisplay.innerHTML = '';
            generateHTML(xmlDoc.documentElement, xmlDisplay);
            document.getElementById('saveBtn').style.display = 'block';
            document.getElementById('addDataBtn').style.display = 'block';
        };
        reader.readAsText(file);
    }
});

function generateHTML(rootNode, container) {
    const categories = Array.from(rootNode.children);
    if (categories.length === 0) {
        container.innerHTML = '<p>No data to display</p>';
        return;
    }

    categories.forEach(category => {
        const categoryName = category.nodeName;
        const items = Array.from(category.children);
        if (items.length > 0) {
            const table = document.createElement('table');
            const thead = document.createElement('thead');
            const tbody = document.createElement('tbody');
            const headRow = document.createElement('tr');

            // Create table headers dynamically
            Array.from(items[0].children).forEach(child => {
                const th = document.createElement('th');
                th.textContent = child.nodeName;
                headRow.appendChild(th);
            });
            thead.appendChild(headRow);
            table.appendChild(thead);

            // Create table rows dynamically
            items.forEach(item => {
                const bodyRow = document.createElement('tr');
                Array.from(item.children).forEach(child => {
                    const td = document.createElement('td');
                    td.textContent = child.textContent;
                    td.setAttribute('contenteditable', 'true');

                    // Update XML node immediately on input
                    td.addEventListener('input', function() {
                        child.textContent = td.textContent;
                    });

                    bodyRow.appendChild(td);
                });

                // Add delete button to each row
                const deleteCell = document.createElement('td');
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Delete';
                deleteBtn.addEventListener('click', function() {
                    item.parentNode.removeChild(item); // Remove XML node
                    bodyRow.parentNode.removeChild(bodyRow); // Remove table row
                });
                deleteCell.appendChild(deleteBtn);
                bodyRow.appendChild(deleteCell);

                tbody.appendChild(bodyRow);
            });

            table.appendChild(tbody);
            container.appendChild(table);
        }
    });
}

// Function to handle adding a new row of data
document.getElementById('addDataBtn').addEventListener('click', function() {
    const modal = document.getElementById('dataModal');
    const addForm = document.getElementById('addForm');
    addForm.innerHTML = '';

    // Assume we get the structure of the first table for the form fields
    const table = document.querySelector('#xmlDisplay table');
    if (table) {
        const headers = table.querySelectorAll('th');
        headers.forEach(header => {
            const label = document.createElement('label');
            label.textContent = header.textContent;
            const input = document.createElement('input');
            input.type = 'text';
            input.name = header.textContent;
            addForm.appendChild(label);
            addForm.appendChild(input);
        });
    }

    modal.style.display = 'block';
});

// Close modal
document.querySelector('.closeBtn').addEventListener('click', function() {
    document.getElementById('dataModal').style.display = 'none';
});

// Submit new data
document.getElementById('submitDataBtn').addEventListener('click', function() {
    const addForm = document.getElementById('addForm');
    const formData = new FormData(addForm);
    const table = document.querySelector('#xmlDisplay table tbody');
    const newRow = document.createElement('tr');

    formData.forEach((value, key) => {
        const td = document.createElement('td');
        td.textContent = value;
        td.setAttribute('contenteditable', 'true');

        // Add event listener for updating XML node
        td.addEventListener('input', function() {
            // Update corresponding XML node if necessary
        });

        newRow.appendChild(td);
    });

    // Add delete button to new row
    const deleteCell = document.createElement('td');
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', function() {
        newRow.parentNode.removeChild(newRow); // Remove table row
    });
    deleteCell.appendChild(deleteBtn);
    newRow.appendChild(deleteCell);

    table.appendChild(newRow);
    document.getElementById('dataModal').style.display = 'none';
});

// Function to save the XML data
document.getElementById('saveBtn').addEventListener('click', function() {
    const xmlDisplay = document.getElementById('xmlDisplay');
    const tables = xmlDisplay.querySelectorAll('table');
    const xmlDoc = document.implementation.createDocument(null, 'root');
    const root = xmlDoc.documentElement;

    tables.forEach(table => {
        const category = xmlDoc.createElement(table.querySelector('th').textContent);
        root.appendChild(category);

        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const item = xmlDoc.createElement('item');
            category.appendChild(item);

            const cells = row.querySelectorAll('td');
            cells.forEach((cell, index) => {
                if (index < cells.length - 1) { // ignore the delete button cell
                    const child = xmlDoc.createElement(table.querySelectorAll('th')[index].textContent);
                    child.textContent = cell.textContent;
                    item.appendChild(child);
                }
            });
        });
    });

    const xmlString = new XMLSerializer().serializeToString(xmlDoc);
    fetch('/save-xml', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/xml'
        },
        body: xmlString
    }).then(response => response.text())
      .then(data => alert(data))
      .catch(error => console.error('Error:', error));
});