// console.log("Boilerplate");

// Load data if it exists

let portfolio = JSON.parse(localStorage.getItem("portfolio")) || [];

// Add or Edit Stocks

document.getElementById("add-stock-form").onsubmit = (e) => addEditStock(e);

function addEditStock(e) {
  e.preventDefault();
  const symbol = document.getElementById("symbol").value.toUpperCase();
  const name = document.getElementById("name").value;
  const shares = parseFloat(document.getElementById("shares").value);
  const buyInPrice = parseFloat(document.getElementById("buy-in-price").value);
  const currentPrice = parseFloat(
    document.getElementById("current-price").value
  );

  if (!symbol || !name || isNaN(shares) || shares <= 0) {
    showAlert(
      "Please enter valid data",
      "danger",
      document.getElementById("add-stock-form")
    );
    return;
  }

  const existingStockIndex = portfolio.findIndex(
    (stock) => stock.symbol === symbol
  );

  if (existingStockIndex !== -1) {
    const existingStock = portfolio[existingStockIndex];
    existingStock.shares += shares;

    if (!isNaN(buyInPrice) && buyInPrice > 0) {
      existingStock.buyInPrice = buyInPrice;
    }

    if (!isNaN(currentPrice) && currentPrice > 0) {
      existingStock.currentPrice = currentPrice;
    }
  } else {
    const stock = {
      symbol,
      name,
      shares,
      buyInPrice: !isNaN(buyInPrice) && buyInPrice > 0 ? buyInPrice : null,
      currentPrice:
        !isNaN(currentPrice) && currentPrice > 0 ? currentPrice : null,
    };
    portfolio.push(stock);

    showAlert(
      "Stock add successfully",
      "success",
      document.getElementById("add-stock-form")
    );
  }

  // Clear inputs

  document.getElementById("symbol").value = "";
  document.getElementById("name").value = "";
  document.getElementById("shares").value = "";
  document.getElementById("buy-in-price").value = "";
  document.getElementById("current-price").value = "";

  // Save to local storage

  localStorage.setItem("portfolio", JSON.stringify(portfolio));

  // Update stock portfolio
  displayStockPortfolio();
  console.log("stock add");
}

displayStockPortfolio();

function displayStockPortfolio() {
  const portfolioBody = document.getElementById("portfolio-body");

  portfolioBody.innerHTML = "";

  let totalValue = 0;

  for (const stock of portfolio) {
    const row = document.createElement("tr");

    const currentPrice = stock.currentPrice !== null ? stock.currentPrice : 0;
    const currentValue = stock.shares * currentPrice;
    const buyInPrice = stock.buyInPrice !== null ? stock.buyInPrice : 0;
    const buyInValue = stock.shares * buyInPrice;

    const gainLoss = currentValue - buyInValue;

    row.innerHTML = `

              <td>${stock.symbol}</td>
              <td>${stock.name}</td>
              <td>${formatNumberWithPeriods(stock.shares)}</td>
              <td>
              ${
                buyInPrice !== 0
                  ? "$" + formatNumberWithPeriods(buyInPrice.toFixed(2))
                  : "N/A"
              }
              </td>
              <td>
              ${
                currentPrice !== 0
                  ? "$" + formatNumberWithPeriods(currentPrice.toFixed(2))
                  : "N/A"
              }
              </td>
              <td>$${formatNumberWithPeriods(currentValue.toFixed(2))}</td>
              <td>${calculateReturn(stock).toFixed(2)}%</td>
              <td>
              
              ${
                gainLoss !== 0
                  ? "$" + formatNumberWithPeriods(gainLoss.toFixed(2))
                  : "N/A"
              }
              </td>
              <td>
              <i class="fa-solid fa-pen-to-square" onclick="editStock('${
                stock.symbol
              }')"></i>
                 <i class="fa-solid fa-trash" onclick="deleteStock('${
                   stock.symbol
                 }')"></i>
              </td>


    `;

    portfolioBody.appendChild(row);

    if (stock.currentPrice !== null) {
      totalValue += stock.shares * stock.currentPrice;
    }
  }

  const portfolioTotal = document.getElementById("portfolio-total");

  portfolioTotal.innerHTML = `<span>Total portfolio value:</span><span>$${formatNumberWithPeriods(
    totalValue.toFixed(2)
  )}</span>`;

  return totalValue;
}

// Edit & Delete stocks form Portfolio

function editStock(symbol) {
  const stock = portfolio.find((stock) => stock.symbol === symbol);

  if (stock) {
    document.getElementById("symbol").value = stock.symbol;
    document.getElementById("name").value = stock.name;
    document.getElementById("shares").value = stock.shares;
    document.getElementById("buy-in-price").value =
      stock.buyInPrice !== null ? stock.buyInPrice : "";
    document.getElementById("current-price").value =
      stock.currentPrice !== null ? stock.currentPrice : "";

    // Remove the stock that is being edited from the stock portfolio

    portfolio = portfolio.filter((stock) => stock.symbol !== symbol);

    // Save the updated stock in the portfolio in localstorage
    localStorage.setItem("portfolio", JSON.stringify(portfolio));

    // Update the stock portfolio

    displayStockPortfolio();
  }
}
function deleteStock(symbol) {
  const confirmation = confirm(
    `Are you sure you want to delete ${symbol} form the stock portfolio?`
  );

  if (confirmation) {
    portfolio = portfolio.filter((stock) => stock.symbol !== symbol);

    // Save the updated stock in the portfolio in localstorage
    localStorage.setItem("portfolio", JSON.stringify(portfolio));

    // Update the stock portfolio

    displayStockPortfolio();
  }
}
// Calculate returns %

function calculateReturn(stock) {
  if (stock.buyInPrice === null || stock.currentPrice === null) {
    return "N/A";
  }

  const returnPercentage =
    ((stock.currentPrice - stock.buyInPrice) / stock.buyInPrice) * 100;

  return returnPercentage;
}

// Investment List

document.addEventListener("DOMContentLoaded", () => {
  const investmentList = document.getElementById("investment-list");
  const investmentAmountInput = document.getElementById("investment-amount");
  const investmentDateInput = document.getElementById("investment-date");
  const addInvestmentButton = document.getElementById("add-investment");
  const totalInvestedElement = document.getElementById("total-invested");

  let investments = JSON.parse(localStorage.getItem("investments")) || [];

  function displayInvestments() {
    investmentList.innerHTML = "";

    let totalInvested = 0;

    investments.map((investment, index) => {
      const listItem = document.createElement("li");

      listItem.classList.add("investment-list-item");

      listItem.innerHTML = `
              <p>${investment.date}</p>
              <b>$${formatNumberWithPeriods(investment.amount.toFixed(2))}</b>
              <div class="investment-actions">
                <i data-index="${index}" class="edit fa-solid fa-pen-to-square"></i>
                <i data-index="${index}" class="delete fa-solid fa-trash"></i>
              </div>
      `;

      investmentList.appendChild(listItem);
      totalInvested += investment.amount;
    });

    totalInvestedElement.innerHTML = ` <span>Total invested amount:</span> <span>$${totalInvested.toFixed(
      2
    )}</span>`;
  }

  addInvestmentButton.onclick = (e) => {
    e.preventDefault();

    const amount = parseFloat(investmentAmountInput.value);
    const date = investmentDateInput.value;
    if (!isNaN(amount) && date) {
      const editIndex = addInvestmentButton.dataset.editIndex;
      if (editIndex !== undefined) {
        editInvestment(editIndex, amount, date);
        //  Update

        addInvestmentButton.textContent === "Update" &&
          showAlert(
            "Investment updated successfully",
            "warning",
            document.getElementById("investment-form")
          );
        addInvestmentButton.textContent = "Add";
        addInvestmentButton.dataset.editIndex = "";
      } else {
        addInvestment(amount, date);
        showAlert(
          "Investment added successfully!",
          "success",
          document.getElementById("investment-form")
        );
      }
    } else {
      showAlert(
        "Please enter valid data",
        "danger",
        document.getElementById("investment-form")
      );
    }
  };

  investmentList.onclick = (e) => {
    if (e.target.classList.contains("edit")) {
      const index = e.target.getAttribute("data-index");
      if (index !== null) {
        const investment = investments[index];

        investmentAmountInput.value = investment.amount;
        investmentDateInput.value = investment.date;
        addInvestmentButton.textContent = "Update";
        addInvestmentButton.dataset.editIndex = index;
      }
    } else if (e.target.classList.contains("delete")) {
      const index = e.target.getAttribute("data-index");
      // console.log(e.target.parentElement.parentElement);
      const amount =
        e.target.parentElement.parentElement.querySelector("b").textContent;
      const date =
        e.target.parentElement.parentElement.querySelector("p").textContent;
      if (index !== null) {
        deleteInvestment(index, amount, date);
      }
    }
  };

  function addInvestment(amount, date) {
    investments.push({ amount, date });
    localStorage.setItem("investments", JSON.stringify(investments));
    displayInvestments();
    investmentAmountInput.value = "";
    investmentDateInput.value = "";
  }
  function editInvestment(index, amount, date) {
    if (index >= 0 && index < investments.length) {
      investments[index] = { amount, date };
      localStorage.setItem("investments", JSON.stringify(investments));
      displayInvestments();
      investmentAmountInput.value = "";
      investmentDateInput.value = "";
    }
  }
  function deleteInvestment(index, amount, date) {
    const confirmation = confirm(
      `Are you sure you want to delete the ${amount} from ${date} investment`
    );
    if (!confirmation) {
      return;
    }

    if (index >= 0 && index < investments.length) {
      investments.splice(index, 1);
      localStorage.setItem("investments", JSON.stringify(investments));
      displayInvestments();
    }
  }

  displayInvestments();
});

// Display pie chart

const analysisBtn = document.getElementById("portfolio-analysis-btn");

function getFreeCash() {
  let freeCash = parseFloat(document.getElementById("free-cash").value);
  if (isNaN(freeCash)) {
    freeCash = 0;
  }

  return freeCash;
}

function getTotalInvested() {
  let totalInvested = 0;

  const investments = JSON.parse(localStorage.getItem("investments") || []);

  investments.forEach((investment) => {
    totalInvested += investment.amount;
  });

  return totalInvested;
}

function getPortfolioTotalValue() {
  let totalValue = 0;

  const portfolio = JSON.parse(localStorage.getItem("portfolio") || []);

  portfolio.forEach((stock) => {
    totalValue += stock.shares * stock.currentPrice + getFreeCash();
  });

  return totalValue;
}

function calculateGainLoss() {
  console.log(getPortfolioTotalValue(), getTotalInvested());
  return getPortfolioTotalValue() - getTotalInvested();
}

function calculateTotalReturn() {
  return (
    ((getPortfolioTotalValue() - getTotalInvested()) / getTotalInvested()) * 100
  );
}

analysisBtn.onclick = () => {
  const analysisGainLoss = document.querySelector(".analysis-gain-loss .value");
  analysisGainLoss.innerHTML = `$${calculateGainLoss().toFixed(2)}`;
  const analysisReturn = document.querySelector(".analysis-return .value");
  analysisReturn.innerHTML = `$${calculateTotalReturn().toFixed(2)}`;

  showPieChart();
};

// Show Alerts

function showAlert(message, type, parentElement = document.body) {
  const alert = document.createElement("div");
  alert.classList.add("alert", type);
  alert.textContent = message;
  parentElement.appendChild(alert);
  setTimeout(() => {
    alert.remove();
  }, 3000);
}

// Number format with ,

function formatNumberWithPeriods(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function showPieChart() {
  let sliceA = 30;
  let sliceB = 70;
  // use values

  sliceA = { size: getTotalInvested(), color: "#e67e22" };
  sliceB = { size: getPortfolioTotalValue(), color: "#3498bd" };

  const values = [sliceA.size, sliceB.size];

  const total = values.reduce((acc, val) => acc + val, 0);

  let startAngle = 0;

  const canvas = document.getElementById("pie-chart");

  const ctx = canvas.getContext("2d");

  // Calc Angles

  values.forEach((value, index) => {
    const angle = (value / total) * Math.PI * 2;

    // Draw a slice

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.arc(
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2,
      startAngle,
      startAngle + angle
    );

    ctx.closePath();

    ctx.fillStyle = index === 0 ? sliceA.color : sliceB.color;

    ctx.fill();

    startAngle += angle;

    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`TOTAL`, canvas.width / 2, canvas.height / 2);

    // Show Legend

    const legend = document.getElementById("pie-chart-legend");

    legend.innerHTML = `

<li class="legend-item">
<div class="legend-color" style="background-color:${sliceA.color}"></div>
<div class="legend-label"> Total Invested: $${sliceA.size} - ${(
      (sliceA.size / total) *
      100
    ).toFixed(2)} %</div>
</li>

<li class="legend-item">
<div class="legend-color" style="background-color:${sliceB.color}"></div>
<div class="legend-label"> Total Invested: $${sliceB.size} - ${(
      (sliceB.size / total) *
      100
    ).toFixed(2)} %</div>
</li>

`;
  });
}

// Save investment list to CSV

const saveInvestmentsBtn = document.getElementById("save-investment-btn");

saveInvestmentsBtn.onclick = () => {
  console.log("click");
  const investmentData = JSON.parse(localStorage.getItem("investments")) || [];

  const csv = investmentData.map((investment) => {
    return `${investment.date},${investment.amount}`;
  });

  csv.unshift("date,amount");

  const csvData = csv.join("\n");
  const CSVBlob = new Blob([csvData], { type: "text/csv" });
  const csvUrl = URL.createObjectURL(CSVBlob);
  const csvA = document.createElement("a");

  csvA.href = csvUrl;
  csvA.download = "investments.csv";
  csvA.click();
};
