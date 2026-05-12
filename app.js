/**
 * Uganda PAYE 2026 Calculation Logic
 *
 * Brackets:
 * - Under 235,000 UGX: 0%
 * - 235,001 to 335,000: 10% of excess over 235,000
 * - 335,001 to 410,000: 10,000 + 20% of excess over 335,000
 * - Above 410,000: 25,000 + 30% of excess over 410,000
 * - Above 10,000,000: Add additional 10% surcharge on amount above 10m
 */

function calculatePAYE(grossSalary) {
    let tax = 0;

    if (grossSalary <= 235000) {
        tax = 0;
    } else if (grossSalary <= 335000) {
        tax = (grossSalary - 235000) * 0.10;
    } else if (grossSalary <= 410000) {
        tax = 10000 + (grossSalary - 335000) * 0.20;
    } else {
        tax = 25000 + (grossSalary - 410000) * 0.30;
    }

    // Additional 10% surcharge on amount above 10,000,000
    if (grossSalary > 10000000) {
        tax += (grossSalary - 10000000) * 0.10;
    }

    return Math.max(0, tax);
}

document.addEventListener('DOMContentLoaded', () => {
    const grossInput = document.getElementById('gross-salary');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultsCard = document.getElementById('results-card');
    const resGross = document.getElementById('res-gross');
    const resTax = document.getElementById('res-tax');
    const resNet = document.getElementById('res-net');
    const copyBtn = document.getElementById('copy-btn');

    function formatCurrency(amount) {
        return 'UGX ' + amount.toLocaleString('en-UG');
    }

    calculateBtn.addEventListener('click', () => {
        const grossSalary = parseFloat(grossInput.value) || 0;
        const tax = calculatePAYE(grossSalary);
        const netPay = grossSalary - tax;

        resGross.textContent = formatCurrency(grossSalary);
        resTax.textContent = formatCurrency(tax);
        resNet.textContent = formatCurrency(netPay);

        resultsCard.classList.remove('hidden');
        resultsCard.scrollIntoView({ behavior: 'smooth' });
    });

    copyBtn.addEventListener('click', () => {
        const summary = `TaxMaster Uganda PAYE Summary:
Gross Salary: ${resGross.textContent}
PAYE Tax: ${resTax.textContent}
Net Pay: ${resNet.textContent}`;

        navigator.clipboard.writeText(summary).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            copyBtn.classList.add('success');
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.classList.remove('success');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            alert('Failed to copy to clipboard.');
        });
    });
});
