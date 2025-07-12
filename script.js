let allData = [];

// Load data from API
async function fetchData() {
  const payload = { level: "2", id: "105" };
  try {
    const res = await fetch("https://zeropovertyp4.ap.gov.in/zeropovertyp4_API/V1/DepartmentDrildown/GetDrildownData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    allData = json.Data || [];

    updateDashboard(allData);
    populateTable(allData);

  } catch (err) {
    console.error("Error fetching data:", err);
    alert("Failed to load data");
  }
}

// Update summary cards and chart
function updateDashboard(data) {
  document.getElementById('totalFamilies').textContent = data.reduce((sum, d) => sum + parseInt(d.TotalFamilies), 0);
  document.getElementById('totalAdopted').textContent = data.reduce((sum, d) => sum + parseInt(d.TotalAdopted), 0);

  const labels = data.map(d => d.ConstituencyName);
  const datasets = [
    {
      label: 'Total Families',
       data.map(d => d.TotalFamilies),
      backgroundColor: '#0d6efd'
    },
    {
      label: 'Adopted',
       data.map(d => d.TotalAdopted),
      backgroundColor: '#198754'
    }
  ];

  if (window.myChart) window.myChart.destroy();

  const ctx = document.getElementById('dashboardChart').getContext('2d');
  window.myChart = new Chart(ctx, {
    type: 'bar',
     { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Families vs Adopted by Constituency' }
      }
    }
  });
}

// Populate table
function populateTable(data) {
  const tbody = document.querySelector("#dataTable tbody");
  tbody.innerHTML = "";
  data.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${row.ConstituencyName}</td><td>${row.TotalFamilies}</td><td>${row.TotalAdopted}</td>`;
    tbody.appendChild(tr);
  });
}

// Filter input
document.getElementById('constituencyFilter').addEventListener('input', function () {
  const filter = this.value.toLowerCase();
  const filtered = allData.filter(d => d.ConstituencyName.toLowerCase().includes(filter));
  updateDashboard(filtered);
  populateTable(filtered);
});

// Run on load
fetchData();
