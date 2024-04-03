class InvoiceManager {
    constructor() {
        this.setupDate();
        this.setupInputRestrictions();
        this.setupPrintButton();
        this.setupDuplicateButton();
        this.setupRemoveButton();
        this.setupBarcodeGeneration();
    }

    setupDate() {
        const currentDate = new Date();
        const formattedDate = new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }).format(currentDate);

        document.querySelectorAll('.date').forEach(dateElement => {
            dateElement.textContent = formattedDate;
        });
    }

    setupInputRestrictions() {
        document.addEventListener('input', event => {
            const editableDiv = event.target;
            if (editableDiv.matches('[contenteditable="true"]')) {
                this.applyInputRestrictions(editableDiv);
            }
        });
    }

    applyInputRestrictions(editableDiv) {
        const max = parseInt(editableDiv.getAttribute('max')) || Infinity;
        const length = parseInt(editableDiv.getAttribute('length')) || Infinity;
        const only = editableDiv.getAttribute('only');
        let textContent = editableDiv.textContent;

        if (textContent.length > max) {
            textContent = textContent.slice(0, max);
        }

        if (textContent.length > length) {
            textContent = textContent.slice(0, length);
        }

        if (only === 'number') {
            textContent = textContent.replace(/\D/g, '');
        } else if (only === 'character') {
            textContent = textContent.replace(/[^A-Za-z\s]/g, '');
        }

        editableDiv.textContent = textContent;
        this.TrackCursorPoint(editableDiv);
    }

    TrackCursorPoint(element) {
        // Save the current cursor position
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const offset = range.endOffset;

        // Modify the content
        const text = element.textContent;
        element.textContent = text; // Refresh the content to reset the cursor position

        // Restore the cursor position
        const newRange = document.createRange();
        newRange.setStart(element.childNodes[0], Math.min(offset, text.length));
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
    }

    generateBarcode(invoiceNumberElement, barcodeElement) {
        if (invoiceNumberElement) {
            invoiceNumberElement.addEventListener('blur', function () {
                JsBarcode(barcodeElement, this.textContent, {
                    width: 2,
                    height: 40,
                    displayValue: false
                });
            });
        }
    }

    setupBarcodeGeneration() {
        document.querySelectorAll('.pager-body').forEach(pagerBody => {
            const invoiceNumberElement = pagerBody.querySelector('#invoice-number');
            const barcodeElement = pagerBody.querySelector('#barcode');
            this.generateBarcode(invoiceNumberElement, barcodeElement);
        });
    }

    setupPrintButton() {
        document.querySelector('#print').addEventListener("click", () => {
            const pdfElement = document.getElementById('printerElement');
            const invoiceNumber = document.querySelector('#invoice-number').textContent;
            window.scrollTo(0, 0);
            const options = {
                margin: [0, -0.2, 0, 0],
                filename: `${invoiceNumber}.pdf`,
                image: { type: 'jpeg', quality: 1 },
                html2canvas: { scale: 6 },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().set(options).from(pdfElement).save();
        });
    }

    setupDuplicateButton() {
        document.getElementById('duplicateButton').addEventListener('click', () => {
            const pagerBodies = document.querySelectorAll('.pager-body');
            if (pagerBodies.length < 2) {
                const clonedPagerBody = document.querySelector('.pager-body').cloneNode(true);
                document.getElementById('printerElement').appendChild(clonedPagerBody);
                this.setupInputRestrictions();
            }
            this.setupBarcodeGeneration();
            this.updateButtonVisibility();
        });
    }

    setupRemoveButton() {
        document.getElementById('removeButton').addEventListener('click', () => {
            const pagerBodies = document.querySelectorAll('.pager-body');
            if (pagerBodies.length > 1) {
                pagerBodies[pagerBodies.length - 1].remove();
            }
            this.updateButtonVisibility();
        });
    }

    updateButtonVisibility() {
        const pagerBodies = document.querySelectorAll('.pager-body');
        const duplicateButton = document.getElementById('duplicateButton');
        const removeButton = document.getElementById('removeButton');

        if (pagerBodies.length >= 2) {
            duplicateButton.style.display = 'none';
            removeButton.style.display = 'inline-block';
        } else {
            duplicateButton.style.display = 'inline-block';
            removeButton.style.display = 'none';
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    new InvoiceManager();
});
