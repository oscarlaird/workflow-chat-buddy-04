
import { Workflow, WorkflowStep } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Function to get the Supabase URL for an image
export const getSupabaseImageUrl = (fileName: string) => {
  const { data } = supabase.storage
    .from('workflow-screenshots')
    .getPublicUrl(fileName);
  
  return data.publicUrl;
};

// Define a constant for chat_id to use consistently
const MOCK_CHAT_ID = "workflow-chat-1";

// Define a type for screenshots
interface Screenshot {
  id: string;
  url: string;
  caption: string;
}

export const mockWorkflow: Workflow = {
  id: "workflow-1",
  title: "Website Vote Data Scraper",
  currentStep: 3,
  totalSteps: 10,
  steps: [
    {
      id: "step-1",
      chat_id: MOCK_CHAT_ID,
      title: "Authenticate with the vote tracking website",
      description: "Connect securely to the website using provided credentials",
      status: "complete",
      step_number: 1,
      code: `async function authenticateWithWebsite(credentials) {
  const response = await fetch('https://api.legiscan.com/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  });
  
  if (!response.ok) {
    throw new Error('Authentication failed');
  }
  
  return await response.json();
}`,
      // Custom field - not in WorkflowStep interface
      screenshots: [
        {
          id: "screenshot-1",
          url: getSupabaseImageUrl("3787fcb9-6ee1-4dc1-8ba4-f128921dac07.png"),
          caption: "Login screen for the LegiScan website"
        }
      ] as Screenshot[]
    } as WorkflowStep & { screenshots?: Screenshot[] },
    {
      id: "step-2",
      chat_id: MOCK_CHAT_ID,
      title: "Validate bill IDs",
      description: "Check if all bill IDs exist and are accessible",
      status: "complete",
      step_number: 2,
      code: `async function validateBillIDs(billIDs, authToken) {
  const validBills = [];
  const invalidBills = [];
  
  for (const billID of billIDs) {
    try {
      const response = await fetch(\`https://api.legiscan.com/bill/\${billID}\`, {
        headers: {
          'Authorization': \`Bearer \${authToken}\`
        }
      });
      
      if (response.ok) {
        validBills.push(billID);
      } else {
        invalidBills.push(billID);
      }
    } catch (error) {
      invalidBills.push(billID);
    }
  }
  
  return { validBills, invalidBills };
}`,
      // Custom field - not in WorkflowStep interface
      screenshots: [
        {
          id: "screenshot-2",
          url: getSupabaseImageUrl("d77919d8-ec33-4b18-88e4-b0bd6273c649.png"),
          caption: "Bill search results on LegiScan"
        }
      ] as Screenshot[]
    } as WorkflowStep & { screenshots?: Screenshot[] },
    {
      id: "step-3",
      chat_id: MOCK_CHAT_ID,
      title: "Extract representative data",
      description: "Gather information about each representative",
      status: "complete",
      step_number: 3,
      code: `async function extractRepresentativeData(state) {
  const url = \`https://ratings.conservative.org/\${state.toLowerCase()}\`;
  
  const response = await fetch(url);
  const html = await response.text();
  
  // Using a DOM parser to extract data
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const representatives = [];
  
  // Select all representative elements
  const repElements = doc.querySelectorAll('.representative-card');
  
  repElements.forEach(el => {
    representatives.push({
      name: el.querySelector('.name').textContent,
      party: el.querySelector('.party').textContent,
      district: el.querySelector('.district').textContent,
      rating: el.querySelector('.rating').textContent
    });
  });
  
  return representatives;
}`,
      // Custom field - not in WorkflowStep interface
      screenshots: [
        {
          id: "screenshot-3",
          url: getSupabaseImageUrl("1b371124-f8f8-4ab5-8d93-541f9c1b0bfd.png"),
          caption: "Representative profiles on CPAC website"
        }
      ] as Screenshot[]
    } as WorkflowStep & { screenshots?: Screenshot[] },
    {
      id: "step-4",
      chat_id: MOCK_CHAT_ID,
      title: "Scrape voting records",
      description: "Collect voting data for each bill ID provided",
      status: "active",
      step_number: 4,
      code: `async function scrapeVotingRecords(billIDs, authToken) {
  const votingData = {};
  
  for (const billID of billIDs) {
    const url = \`https://api.legiscan.com/roll_call/\${billID}\`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': \`Bearer \${authToken}\`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      votingData[billID] = data.roll_call.votes;
    }
  }
  
  return votingData;
}`,
      // Custom field - not in WorkflowStep interface 
      screenshots: [
        {
          id: "screenshot-4",
          url: getSupabaseImageUrl("3651c761-43bf-424a-b48f-6b0ae1f45811.png"),
          caption: "Voting record page on LegiScan"
        }
      ] as Screenshot[]
    } as WorkflowStep & { screenshots?: Screenshot[] },
    {
      id: "step-5",
      chat_id: MOCK_CHAT_ID,
      title: "Parse and normalize data",
      description: "Clean and format the scraped data for consistency",
      status: "waiting",
      step_number: 5,
      code: `function normalizeData(voteData, repData) {
  // Normalize representative names
  const normalizedRepData = repData.map(rep => ({
    ...rep,
    normalizedName: normalizeNameFormat(rep.name)
  }));
  
  // Normalize voting records
  const normalizedVoteData = {};
  
  for (const [billID, votes] of Object.entries(voteData)) {
    normalizedVoteData[billID] = votes.map(vote => ({
      ...vote,
      normalizedName: normalizeNameFormat(vote.name)
    }));
  }
  
  return {
    representatives: normalizedRepData,
    votes: normalizedVoteData
  };
}

function normalizeNameFormat(name) {
  // Remove titles, standardize format
  return name
    .replace(/^(Sen\.|Rep\.|Senator|Representative)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}`
    } as WorkflowStep,
    {
      id: "step-6",
      chat_id: MOCK_CHAT_ID,
      title: "Match representatives to votes",
      description: "Link each representative to their voting record",
      status: "waiting",
      step_number: 6,
      exampleInput: null,
      exampleOutput: [
        { "name": "Rep. Adams, Alma S.", "party": "D", "state": "NC", "vote": "Nay", "rating": "5%" },
        { "name": "Rep. Aderholt, Robert B.", "party": "R", "state": "AL", "vote": "Yea", "rating": "92%" },
        { "name": "Rep. Aguilar, Pete", "party": "D", "state": "CA", "vote": "Nay", "rating": "8%" },
        { "name": "Rep. Alford, Mark", "party": "R", "state": "MO", "vote": "Yea", "rating": "95%" }
      ]
    } as WorkflowStep,
    {
      id: "step-7",
      chat_id: MOCK_CHAT_ID,
      title: "Format data for spreadsheet",
      description: "Structure data in the required format for import",
      status: "waiting",
      step_number: 7
    } as WorkflowStep,
    {
      id: "step-8",
      chat_id: MOCK_CHAT_ID,
      title: "Generate spreadsheet file",
      description: "Create an Excel or CSV file with the data",
      status: "waiting",
      step_number: 8
    } as WorkflowStep,
    {
      id: "step-9",
      chat_id: MOCK_CHAT_ID,
      title: "Verify data accuracy",
      description: "Check for any discrepancies or missing information",
      status: "waiting",
      step_number: 9
    } as WorkflowStep,
    {
      id: "step-10",
      chat_id: MOCK_CHAT_ID,
      title: "Provide download link",
      description: "Generate a link for downloading the completed spreadsheet",
      status: "waiting",
      step_number: 10
    } as WorkflowStep
  ]
};
