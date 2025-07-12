let allData = [];

// Load data from API
async function fetchData() {
  const payload = { level: "2", id: "105" };
  try {
    const res = await fetch("https://zeropovertyp4.ap.gov.in/zeropovertyp4_API/V1/DepartmentDrildown/GetDrildownData ", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    allData = json.Data || [];

    updateDashboard(allData);
    initDataTable(allData);

  } catch (err) {
    console.error("Error fetching data:", err);
    alert("Failed to load data");
  }
}

// Update summary cards and chart
function updateDashboard(data) {
  const totalFamilies = data.reduce((sum, d) => sum + parseInt(d.TotalFamilies), 0);
  const totalAdopted = data.reduce((sum, d) => sum + parseInt(d.TotalAdopted), 0);
  const coverage = ((totalAdopted / totalFamilies) * 100).toFixed(1) + "%";

  document.getElementById('totalFamilies').textContent = totalFamilies;
  document.getElementById('totalAdopted').textContent = totalAdopted;
  document.getElementById('coveragePercent').textContent = coverage;

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

// Initialize DataTable
function initDataTable(data) {
  $('#dataTable').DataTable({
    destroy: true,
    data: data,
    columns: [
      { data: 'ConstituencyName' },
      { data: 'TotalFamilies' },
      { data: 'TotalAdopted' },
      { data: 'CoverdMandals' }
    ],
    paging: true,
    searching: true,
    scrollX: true
  });
}

// Filter input
document.getElementById('constituencyFilter').addEventListener('input', function () {
  const filter = this.value.toLowerCase();
  const filtered = allData.filter(d => d.ConstituencyName.toLowerCase().includes(filter));
  updateDashboard(filtered);
  initDataTable(filtered);
});

// Refresh button
document.getElementById('refreshBtn').addEventListener('click', fetchData);

// Export to CSV
document.getElementById('exportCsvBtn').addEventListener('click', () => {
  let csv = "Constituency,Families,Adopted,Margadarsi Mobilized\n";
  allData.forEach(row => {
    csv += `${row.ConstituencyName},${row.TotalFamilies},${row.TotalAdopted},${row.TotalMargadarsiMobilized}\n`;
  });
  downloadCSV(csv, "zeropverty_data.csv");
});

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// Run on load
fetchData();
