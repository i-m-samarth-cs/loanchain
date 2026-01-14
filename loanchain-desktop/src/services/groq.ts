import { LoanAgreement, Covenant, Participant } from '../types';

interface GroqResponse {
  isValid: boolean;
  reason?: string;
  metadata?: {
    borrower: string;
    facilityAmount: number;
    interestType: string;
    maturityDate: string;
  };
  covenants?: Covenant[];
  flowchart?: {
    nodes: Array<{ id: string; label: string; type?: string; color?: string }>;
    edges: Array<{ id: string; source: string; target: string; label?: string }>;
  };
}

export async function analyzeDocumentWithGroq(text: string, apiKey: string): Promise<GroqResponse> {
  const prompt = `
    You are a specialized financial verification AI. Your job is to analyze the text of a document and determine if it is a valid Loan Agreement or Credit Agreement.
    
    If it IS a valid agreement, extract the structured data below.
    If it is NOT (e.g., a recipe, a novel, random text), set "isValid" to false and provide a reason.

    Required Data if Valid:
    1. Borrower Name
    2. Total Facility Amount (estimate if strictly not found, look for "Commitment" or "Total")
    3. Interest Rate (e.g., "SOFR + 3.5%")
    4. Maturity Date
    5. Covenants: Extract 2-3 key financial covenants (Leverage Ratio, DSCR, etc.)
    6. Flowchart: Create a logical flow of funds/process as nodes and edges. 
       - Nodes should behave like: Borrower -> Payment -> Agent -> Lenders -> Check Covenants. 
       - Assign colors: Borrower (#6366f1), Payment (#22c55e), Agent (#3b82f6), Covenants (#ef4444).

    Input Text (truncated):
    ${text.substring(0, 15000)}...

    Respond ONLY in valid JSON format matching this schema:
    {
      "isValid": boolean,
      "reason": string (if invalid),
      "metadata": {
        "borrower": string,
        "facilityAmount": number (raw number),
        "interestType": string,
        "maturityDate": string (YYYY-MM-DD)
      },
      "covenants": [
        { "id": string, "name": string, "type": "Financial", "threshold": number, "currentValue": number (mock a realistic current value), "status": "healthy" | "warning" | "breach" }
      ],
      "flowchart": {
        "nodes": [ { "id": "1", "label": "Borrower", "color": "#6366f1" } ],
        "edges": [ { "id": "e1-2", "source": "1", "target": "2" } ]
      }
    }
  `;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Groq API Error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Groq Analysis Failed:', error);
    throw error;
  }
}
