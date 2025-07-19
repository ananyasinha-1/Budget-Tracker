const budgetForm = document.getElementById('budget-form');
const budgetList = document.getElementById('budget-list').querySelector('tbody');
const totalIncomeEl = document.getElementById('total-income');
const totalExpensesEl = document.getElementById('total-expenses');
const balanceEl = document.getElementById('balance');

const timeframeSelect = document.getElementById('timeframe');
const expenseChartCtx = document.getElementById('expenseChart').getContext('2d');

const budgetSettingForm = document.getElementById('budget-setting-form');
const budgetAmountInput = document.getElementById('budget-amount');
const budgetPeriodSelect = document.getElementById('budget-period');
const budgetDisplay = document.getElementById('budget-display');

let budgetItems = JSON.parse(localStorage.getItem('budgetItems')) || [];
let userBudget = JSON.parse(localStorage.getItem('userBudget')) || null;

function saveToLocalStorage() {
    localStorage.setItem('budgetItems', JSON.stringify(budgetItems));
}

function saveBudgetToLocalStorage() {
    localStorage.setItem('userBudget', JSON.stringify(userBudget));
}

function updateSummary() {
    const totalIncome = budgetItems
        .filter(item => item.category === 'income')
        .reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = budgetItems
        .filter(item => item.category === 'expense')
        .reduce((sum, item) => sum + item.amount, 0);
    const balance = totalIncome - totalExpenses;

    totalIncomeEl.textContent = `₹${totalIncome.toFixed(2)}`;
    totalExpensesEl.textContent = `₹${totalExpenses.toFixed(2)}`;
    balanceEl.textContent = `₹${balance.toFixed(2)}`;
    balanceEl.style.color = balance >= 0 ? 'green' : 'red';

    updateBudgetDisplay(totalExpenses);
    updateOverviewChart(totalIncome, totalExpenses);
    updateExpenseChart();
}

function renderBudgetList() {
    budgetList.innerHTML = '';
    budgetItems.forEach((item, index) => {
        const row = document.createElement('tr');

        const descCell = document.createElement('td');
        descCell.textContent = item.description;
        row.appendChild(descCell);

        const amountCell = document.createElement('td');
        amountCell.textContent = `₹${item.amount.toFixed(2)}`;
        row.appendChild(amountCell);

        const categoryCell = document.createElement('td');
        categoryCell.textContent = item.category.charAt(0).toUpperCase() + item.category.slice(1);
        row.appendChild(categoryCell);

        const dateCell = document.createElement('td');
        dateCell.textContent = item.date;
        row.appendChild(dateCell);

        const actionCell = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';
        deleteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this budget item?')) {
                budgetItems.splice(index, 1);
                saveToLocalStorage();
                renderBudgetList();
                updateSummary();
            }
        });
        actionCell.appendChild(deleteBtn);
        row.appendChild(actionCell);

        budgetList.appendChild(row);
    });
}

budgetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const description = budgetForm.description.value.trim();
    const amount = parseFloat(budgetForm.amount.value);
    const category = budgetForm.category.value;
    const date = budgetForm.date.value;

    if (description && !isNaN(amount) && amount > 0 && category && date) {
        budgetItems.push({ description, amount, category, date });
        saveToLocalStorage();
        renderBudgetList();
        updateSummary();
        budgetForm.reset();
    } else {
        alert('Please enter valid values. Amount must be greater than 0.');
    }
});
