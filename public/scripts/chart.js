import Chart from 'chart.js/auto';

document.addEventListener('DOMContentLoaded', function() {
    // Sales Chart
    var ctx = document.getElementById('salesChart').getContext('2d');
    var salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [{
                label: 'Monthly Sales',
                data: [120, 150, 180, 220, 170, 200, 250],
                borderColor: 'rgba(85, 59, 106, 0.8)',
                backgroundColor: 'rgba(85, 59, 106, 0.2)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Expenses Chart
    var ctx2 = document.getElementById('expensesChart').getContext('2d');
    var expensesChart = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: ['Rent', 'Supplies', 'Utilities', 'Wages', 'Marketing'],
            datasets: [{
                label: 'Expenses by Month',
                data: [500, 300, 200, 700, 150],
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Income Chart
    var ctx3 = document.getElementById('incomeChart').getContext('2d');
    var incomeChart = new Chart(ctx3, {
        type: 'pie',
        data: {
            labels: ['Sales', 'Delivery Fees', 'Special Orders', 'Workshops'],
            datasets: [{
                label: 'Income Distribution',
                data: [3000, 500, 2000, 800],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true
        }
    });
});