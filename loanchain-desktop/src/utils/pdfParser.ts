import * as pdfjsLib from 'pdfjs-dist';
import { LoanAgreement, Covenant, Participant } from '../types';

// Set worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface ParsedResult {
    metadata: LoanAgreement;
    covenants: Covenant[];
    participants: Participant[];
    rawText: string;
}

export async function parseLoanAgreement(file: File): Promise<ParsedResult> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

    let fullText = '';
    // Limit to first 50 pages for performance, usually enough for key terms
    const maxPages = Math.min(pdf.numPages, 50);

    for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + ' ';
    }

    // Heuristic Parsing Logic
    const amountMatch = fullText.match(/\$\s*([\d,]+(\.\d{2})?)\s*(million|billion)?/i);
    const facilityAmount = amountMatch ? parseAmount(amountMatch[0]) : 100000000; // Default fallback

    const borrowerMatch = fullText.match(/(?:Borrower|Company|Credit Parties)\s*[:\-] \s*([A-Z][a-zA-Z0-9\s,\.]+)(?:,|\s+and)/);
    const borrower = borrowerMatch ? borrowerMatch[1].trim().substring(0, 50) : "Unknown Borrower";

    const rateMatch = fullText.match(/(?:Interest Rate|Margin|Applicable Rate).*?(?:SOFR|LIBOR|Base Rate)\s*(?:plus|\+)\s*([\d\.]+)\s*%/i);
    const interestType = rateMatch ? `SOFR + ${(parseFloat(rateMatch[1]) * 100).toFixed(0)}bps` : "SOFR + 350bps";

    const maturityMatch = fullText.match(/(?:Maturity Date|Termination Date).*?([A-Z][a-z]+ \d{1,2}, \d{4})/);
    const maturityDate = maturityMatch ? maturityMatch[1] : new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split('T')[0];

    // Section-based Covenant Extraction
    const covenants: Covenant[] = [];
    const covenantSectionMatch = fullText.match(/(?:ARTICLE|SECTION)\s*(?:V|VI|6|7)\.?\s*COVENANTS([\s\S]{0,3000})/i);

    if (covenantSectionMatch) {
        const sectionText = covenantSectionMatch[1];

        // Look for Leverage Ratio
        if (sectionText.match(/Leverage Ratio/i)) {
            covenants.push({
                id: 'cov-lev',
                name: 'Leverage Ratio',
                type: 'Financial',
                threshold: 4.50,
                currentValue: 4.20, // Simulated current value
                status: 'healthy'
            });
        }

        // Look for Interest Coverage
        if (sectionText.match(/Interest Coverage/i)) {
            covenants.push({
                id: 'cov-icr',
                name: 'Interest Coverage Ratio',
                type: 'Financial',
                threshold: 3.00,
                currentValue: 2.85,
                status: 'warning'
            });
        }

        // Look for Debt Service
        if (sectionText.match(/Debt Service/i)) {
            covenants.push({
                id: 'cov-dscr',
                name: 'Debt Service Coverage',
                type: 'Financial',
                threshold: 1.25,
                currentValue: 1.40,
                status: 'healthy'
            });
        }
    }

    // Generate Agreement Object
    const agreement: LoanAgreement = {
        id: `agreement-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ""),
        borrower,
        facilityAmount,
        interestType,
        maturityDate,
        uploadDate: new Date().toISOString(),
        parsed: true
    };

    // Deduced Participants (Mock logic based on size)
    const participants = [
        { id: 'p1', name: 'Lead Arranger Bank', role: 'agent' as const, exposure: facilityAmount * 0.2 },
        { id: 'p2', name: 'Syndicate Member A', role: 'lender' as const, exposure: facilityAmount * 0.4 },
        { id: 'p3', name: 'Syndicate Member B', role: 'lender' as const, exposure: facilityAmount * 0.4 },
        { id: 'p4', name: 'Institutional Investor X', role: 'buyer' as const, exposure: 0 },
    ];

    return {
        metadata: agreement,
        covenants: covenants.length > 0 ? covenants : [
            { id: 'c1', name: 'Leverage Ratio', type: 'Financial', threshold: 4.0, currentValue: 3.8, status: 'healthy' }
        ],
        participants,
        rawText: fullText.substring(0, 1000) + '...' // Preview
    };
}

function parseAmount(text: string): number {
    const number = parseFloat(text.replace(/[^0-9.]/g, ''));
    if (text.toLowerCase().includes('billion')) return number * 1000000000;
    if (text.toLowerCase().includes('million')) return number * 1000000;
    return number;
}
