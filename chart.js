const overviewCtx = document.createElement('canvas');
document.querySelector('.summary-section').appendChild(overviewCtx);

let overviewChart = new Chart(overviewCtx, {
    type: 'doughnut',
    data: {
        labels: ['Income', 'Expenses'],
        datasets: [{
            label: 'Budget Overview',
            data: [0, 0],
            backgroundColor: ['#2ecc71', '#e74c3c'],
            hoverOffset: 30
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
            },
            tooltip: {
                enabled: true
            }
        }
    }
});

function updateOverviewChart(income, expenses) {
    overviewChart.data.datasets[0].data = [income, expenses];
    overviewChart.update();
}

// Expense chart for daily, weekly, monthly, yearly views
let expenseChart = new Chart(expenseChartCtx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Expenses',
            data: [],
            backgroundColor: '#e74c3c'
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                enabled: true
            }
        }
    }
});

function groupExpensesByTimeframe(timeframe) {
    const expenses = budgetItems.filter(item => item.category === 'expense');
    const grouped = {};

    expenses.forEach(item => {
        const date = new Date(item.date);
        let key = '';

        switch (timeframe) {
            case 'daily':
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                key = days[date.getDay()];
                break;
            case 'weekly':
                const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
                const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
                const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
                key = `Week ${weekNumber}`;
                break;
            case 'monthly':
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
                break;
            case 'yearly':
                key = `${date.getFullYear()}`;
                break;
        }

        if (!grouped[key]) {
            grouped[key] = 0;
        }
        grouped[key] += item.amount;
    });

    return grouped;
}

function updateExpenseChart() {
    const timeframe = timeframeSelect.value;
    const groupedExpenses = groupExpensesByTimeframe(timeframe);

    const labels = Object.keys(groupedExpenses);
    const data = Object.values(groupedExpenses);

    expenseChart.data.labels = labels;
    expenseChart.data.datasets[0].data = data;
    expenseChart.update();
}

timeframeSelect.addEventListener('change', () => {
    updateExpenseChart();
});

// Budget setting form handling
budgetSettingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = parseFloat(budgetAmountInput.value);
    const period = budgetPeriodSelect.value;

    if (!isNaN(amount) && period) {
        userBudget = { amount, period };
        saveBudgetToLocalStorage();
        updateBudgetDisplay();
        budgetSettingForm.reset();
    }
});

function updateBudgetDisplay(currentExpenses = null) {
    if (!userBudget) {
        budgetDisplay.textContent = 'No budget set.';
        budgetDisplay.style.color = 'black';
        return;
    }

    const expenses = currentExpenses !== null
        ? currentExpenses
        : budgetItems
            .filter(item => item.category === 'expense')
            .reduce((sum, item) => sum + item.amount, 0);

    let budgetText = `Budget: ₹${userBudget.amount.toFixed(2)} (${userBudget.period})`;

    if (expenses > userBudget.amount) {
        budgetText += ' - Over budget!';
        budgetDisplay.style.color = 'red';
    } else {
        budgetDisplay.style.color = 'green';
    }

    budgetDisplay.textContent = budgetText;
}

// Initial render
renderBudgetList();
updateSummary();
updateBudgetDisplay();
