const results = Array.from(window.results);
const paramSearches = Array.from(window.paramSearches);
const target = window.targetUrl
let currentIndex = 0;
console.log(paramSearches);

function initialize() {
    if (results && results.length > 0) {
        generateHTML();
        populateTable();
        document.getElementById('resultsCount').innerText = `Number of results found: ${results.length}`;
        updateRemainingClicks();
    } else {
        document.write("No results found.");
    }
}

function generateHTML() {
    const appDiv = document.getElementById('app');
    appDiv.innerHTML = `
                <style>
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th, td {
                        border: 1px solid black;
                        padding: 4px;
                        text-align: left;
                    }
                        .iframe-container {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            padding: 20px;
            justify-content: flex-start;
        }
        .iframe-cell {
            width: calc(50% - 10px);
            box-sizing: border-box;
            border: 1px solid #ccc;
            padding: 5px;
            text-align: center;
        }
        iframe {
            width: 100%;
            height: 300px;
            border: none;
        }
        @media (max-width: 600px) {
            .iframe-cell {
                width: 100%;
            }
        }
                </style>
                <p id="resultsCount">Number of results found: 0</p>
                <label for="numParams">Number of parameters per request:</label>
                <input type="number" id="numParams" value="${results.length}">
                <br>
                <label for="canary">Canary:</label>
                <input type="text" id="canary" value="hdpewo56">
                <br>
                <label for="includeHash">Include hash:</label>
                <input type="checkbox" id="includeHash">
                <br>
                <button onclick="loadIframes()">Iframes</button>
                <br><br>
                <button onclick="makeRequest()">Make request</button>
                <p id="remainingClicks">Remaining clicks: 0</p>
                <br>
                <table id="resultsTable">
                    <thead>
                        <tr>
                            <th>Select</th>
                            <th>Result</th>
                            <th>Select</th>
                            <th>Result</th>
                            <th>Select</th>
                            <th>Result</th>
                            <th>Select</th>
                            <th>Result</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
                <br>
                <div id="iframe-grid" class="iframe-container"></div>
            `;
}

function populateTable() {
    const tableBody = document.getElementById('resultsTable').getElementsByTagName('tbody')[0];
    for (let i = 0; i < results.length; i += 4) {
        const row = tableBody.insertRow();
        for (let j = 0; j < 4; j++) {
            if (i + j < results.length) {
                const cell1 = row.insertCell();
                const cell2 = row.insertCell();
                cell1.innerHTML = `<input type="checkbox" checked id="result${i + j}">`;
                cell2.innerText = results[i + j];
            } else {
                row.insertCell();
                row.insertCell();
            }
        }
    }
}

function makeRequest() {
    const numParams = parseInt(document.getElementById('numParams').value);
    const includeHash = document.getElementById('includeHash').checked;
    const canary = document.getElementById('canary').value
    let params = [];
    let count = 0;

    for (let i = currentIndex; i < results.length && count < numParams; i++) {
        if (document.getElementById(`result${i}`).checked) {
            params.push(`${results[i]}=${canary}`);
            count++;
        }
    }

    if (params.length > 0) {
        let targetString = "";
        const url = new URL(target);
        const newQueryParams = params.join('&');

        if (url.search) {
            url.search += `&${newQueryParams}`;
        } else {
            url.search += `?${newQueryParams}`;
        }
        if (includeHash) {
            if (!url.hash) {
                url.hash += `?${newQueryParams}`;
            } else {
                if (url.hash.includes('?')) {
                    url.hash += `&${newQueryParams}`;
                } else {
                    url.hash += `?${newQueryParams}`;
                }
            }
        }
        window.open(url);
        currentIndex += count;
        updateRemainingClicks();
    } else {
        alert("No more results to request.");
        currentIndex = 0;
        updateRemainingClicks();
    }
}

function loadIframes() {
    const numParams = parseInt(document.getElementById('numParams').value) || 30;
    const includeHash = document.getElementById('includeHash').checked;
    const canary = document.getElementById('canary').value;

    let allParams = [];
    const generatedUrls = [];

    for (let i = 0; i < results.length; i++) {
        const resultElement = document.getElementById(`result${i}`);
        if (resultElement && resultElement.checked) {
            allParams.push(`${results[i]}=${canary}`);
        }
    }

    if (allParams.length > 0) {
        for (let i = 0; i < allParams.length; i += numParams) {
            const paramBatch = allParams.slice(i, i + numParams);
            const newQueryParams = paramBatch.join('&');

            try {
                const url = new URL(target);
                if (url.search) {
                    url.search += `&${newQueryParams}`;
                } else {
                    url.search = `?${newQueryParams}`;
                }

                if (includeHash) {
                    if (url.hash) {
                        if (url.hash.includes('?')) {
                            url.hash += `&${newQueryParams}`;
                        } else {
                            url.hash += `?${newQueryParams}`;
                        }
                    } else {
                        url.hash = `#?${newQueryParams}`;
                    }
                }
                generatedUrls.push(url.toString());
            } catch (e) {
                console.error(`Error processing URL for batch starting at index ${i}:`, e);
                continue;
            }
        }

        const gridContainer = document.getElementById('iframe-grid');

        generatedUrls.forEach((url, index) => {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'iframe-cell';

            const openButton = document.createElement('button');
            openButton.textContent = 'Open in New Tab';

            openButton.addEventListener('click', () => {
                window.open(url, '_blank');
            });

            const iframe = document.createElement('iframe');
            iframe.src = url;

            iframe.onerror = () => {
                cellDiv.innerHTML = `<p>Cannot load ${url}. The website may block embedding (X-Frame-Options).</p>`;
                cellDiv.style.backgroundColor = '#fdd';
            };

            cellDiv.appendChild(openButton);
            cellDiv.appendChild(iframe);
            gridContainer.appendChild(cellDiv);
        });
    } else {
        console.log("No parameters were selected to generate URLs.");
    }
}

function updateRemainingClicks() {
    const numParams = parseInt(document.getElementById('numParams').value);
    const remainingClicks = Math.ceil((results.length - currentIndex) / numParams);
    document.getElementById('remainingClicks').innerText = `Remaining clicks: ${remainingClicks}`;
}

initialize();
