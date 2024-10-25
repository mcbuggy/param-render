const results = Array.from(window.results);
const target = window.targetUrl
let currentIndex = 0;

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
                <button onclick="makeRequest()">Make request</button>
                <p id="remainingClicks">Remaining clicks: 0</p>
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
        if (target.includes("?")) {
            targetString += `&${params.join('&')}`
        } else {
            targetString += `?${params.join('&')}`
        }
        if (includeHash) {
            targetString += `#${targetString}`;
        }
        window.open(target + targetString);
        currentIndex += count;
        updateRemainingClicks();
    } else {
        alert("No more results to request.");
    }
}

function updateRemainingClicks() {
    const numParams = parseInt(document.getElementById('numParams').value);
    const remainingClicks = Math.ceil((results.length - currentIndex) / numParams);
    document.getElementById('remainingClicks').innerText = `Remaining clicks: ${remainingClicks}`;
}

initialize();
