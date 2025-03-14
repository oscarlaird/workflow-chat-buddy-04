
import { Conversation, Workflow } from "@/types";

export const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    title: "Vote Data Scraping",
    date: "Today",
    messages: [
      {
        id: "msg-1",
        role: "assistant",
        content: "What are you trying to do? Explain your task in one sentence."
      },
      {
        id: "msg-2",
        role: "user",
        content: "I need to get vote data from a couple of websites."
      },
      {
        id: "msg-3",
        role: "assistant",
        content: "Great. What information will we need to start?"
      },
      {
        id: "msg-4",
        role: "user",
        content: "I will provide a state and a bill for you."
      },
      {
        id: "msg-5",
        role: "assistant",
        content: "Great. What do you want at the end? Do you need a spreadsheet?"
      },
      {
        id: "msg-6",
        role: "user",
        content: "Yes, I want an excel spreadsheet combining data from the two websites."
      },
      {
        id: "msg-7",
        role: "assistant",
        content: "Okay, what is the first step in your task?"
      },
      {
        id: "msg-8",
        role: "user",
        content: "I lookup a bill on the legiscan website and get the rollcall."
      },
      {
        id: "msg-9",
        role: "assistant",
        content: "Great. Can you show me how to do that?"
      },
      {
        id: "msg-10",
        role: "assistant",
        content: "I found the following data: [table]\nIs this what you want?"
      },
      {
        id: "msg-11",
        role: "user",
        content: "Yes."
      },
      {
        id: "msg-12",
        role: "assistant",
        content: "Great what is next?"
      },
      {
        id: "msg-13",
        role: "user",
        content: "I need to visit the acu's website to find legislators' scores from last year?"
      },
      {
        id: "msg-14",
        role: "assistant",
        content: "Okay, can you please show me?"
      },
      {
        id: "msg-15",
        role: "assistant",
        content: "I found the following data: [table]. Is this correct?"
      },
      {
        id: "msg-16",
        role: "user",
        content: "Yes."
      },
      {
        id: "msg-17",
        role: "assistant",
        content: "Great. Would you like excel spreadsheets for each of these?"
      },
      {
        id: "msg-18",
        role: "user",
        content: "No, can you please combine the data into one spreadsheet?"
      },
      {
        id: "msg-19",
        role: "assistant",
        content: "I see. You want me to join the tables on the legislators' names?"
      },
      {
        id: "msg-20",
        role: "user",
        content: "Yes, I guess so."
      },
      {
        id: "msg-21",
        role: "assistant",
        content: "Okay, one minute..."
      },
      {
        id: "msg-22",
        role: "assistant",
        content: "[table]\n\nHere is the joined table and a download link for the excel spreadsheet.\nIs this correct?"
      },
      {
        id: "msg-23",
        role: "user",
        content: "Yes"
      },
      {
        id: "msg-24",
        role: "assistant",
        content: "Great. You can try this on another bill by pressing \"run workflow\" in the upper right."
      },
      {
        id: "msg-25",
        role: "user",
        content: "Thanks"
      },
      {
        id: "msg-26",
        role: "assistant",
        content: "Happy to assist."
      },
    ]
  },
  {
    id: "conv-2",
    title: "Multiple Bills Analysis",
    date: "Yesterday",
    messages: [
      {
        id: "msg-1",
        role: "user",
        content: "Can you please run this for multiple bills at the same time?"
      },
      {
        id: "msg-2",
        role: "assistant",
        content: "Yes, just a minute...\nOkay, you can input as many bills as you like"
      },
      {
        id: "msg-3",
        role: "user",
        content: "Hmmm. This isn't quite right, I want to the votes for each bill to be in the same spreadsheet; one column per bill."
      },
      {
        id: "msg-4",
        role: "assistant",
        content: "Okay, let me think...\nThe bills should now appear in a single spreadsheet."
      }
    ]
  },
  {
    id: "conv-3",
    title: "Data Export Options",
    date: "March 20",
    messages: []
  }
];

export const mockWorkflow: Workflow = {
  id: "workflow-1",
  title: "Website Vote Data Scraper",
  currentStep: 3,
  totalSteps: 10,
  steps: [
    {
      id: "step-1",
      title: "Authenticate with the vote tracking website",
      description: "Connect securely to the website using provided credentials",
      status: "complete",
      screenshots: [
        {
          id: "screenshot-1",
          url: "/lovable-uploads/3787fcb9-6ee1-4dc1-8ba4-f128921dac07.png",
          caption: "Login screen for the LegiScan website"
        }
      ],
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
}`
    },
    {
      id: "step-2",
      title: "Validate bill IDs",
      description: "Check if all bill IDs exist and are accessible",
      status: "complete",
      screenshots: [
        {
          id: "screenshot-2",
          url: "/lovable-uploads/d77919d8-ec33-4b18-88e4-b0bd6273c649.png",
          caption: "Bill search results on LegiScan"
        }
      ],
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
}`
    },
    {
      id: "step-3",
      title: "Extract representative data",
      description: "Gather information about each representative",
      status: "complete",
      screenshots: [
        {
          id: "screenshot-3",
          url: "/lovable-uploads/1b371124-f8f8-4ab5-8d93-541f9c1b0bfd.png",
          caption: "Representative profiles on CPAC website"
        }
      ],
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
}`
    },
    {
      id: "step-4",
      title: "Scrape voting records",
      description: "Collect voting data for each bill ID provided",
      status: "active",
      screenshots: [
        {
          id: "screenshot-4",
          url: "/lovable-uploads/3651c761-43bf-424a-b48f-6b0ae1f45811.png",
          caption: "Voting record page on LegiScan"
        }
      ],
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
}`
    },
    {
      id: "step-5",
      title: "Parse and normalize data",
      description: "Clean and format the scraped data for consistency",
      status: "waiting",
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
    },
    {
      id: "step-6",
      title: "Match representatives to votes",
      description: "Link each representative to their voting record",
      status: "waiting",
      exampleData: [
        { "name": "Rep. Adams, Alma S.", "party": "D", "state": "NC", "vote": "Nay", "rating": "5%" },
        { "name": "Rep. Aderholt, Robert B.", "party": "R", "state": "AL", "vote": "Yea", "rating": "92%" },
        { "name": "Rep. Aguilar, Pete", "party": "D", "state": "CA", "vote": "Nay", "rating": "8%" },
        { "name": "Rep. Alford, Mark", "party": "R", "state": "MO", "vote": "Yea", "rating": "95%" }
      ]
    },
    {
      id: "step-7",
      title: "Format data for spreadsheet",
      description: "Structure data in the required format for import",
      status: "waiting"
    },
    {
      id: "step-8",
      title: "Generate spreadsheet file",
      description: "Create an Excel or CSV file with the data",
      status: "waiting"
    },
    {
      id: "step-9",
      title: "Verify data accuracy",
      description: "Check for any discrepancies or missing information",
      status: "waiting"
    },
    {
      id: "step-10",
      title: "Provide download link",
      description: "Generate a link for downloading the completed spreadsheet",
      status: "waiting"
    }
  ]
};

export const voteDataColumns = [
  { id: "col-1", header: "Name", accessor: "name" },
  { id: "col-2", header: "Yea", accessor: "yea" },
  { id: "col-3", header: "Nay", accessor: "nay" },
  { id: "col-4", header: "NV", accessor: "nv" },
  { id: "col-5", header: "Absent", accessor: "absent" },
  { id: "col-6", header: "State Profile", accessor: "stateProfile" },
  { id: "col-7", header: "Financial", accessor: "financial" },
  { id: "col-8", header: "Encyclopedia", accessor: "encyclopedia" },
  { id: "col-9", header: "Biography", accessor: "biography" },
  { id: "col-10", header: "BioGuide", accessor: "bioGuide" }
];

export const voteData = [
  { name: "Rep. Adams, Alma S. [D-NC]", yea: false, nay: true, nv: false, absent: false, stateProfile: "State Profile", financial: "OpenSecrets", encyclopedia: "Ballotpedia", biography: "VoteSmart", bioGuide: "BioGuide" },
  { name: "Rep. Aderholt, Robert B. [R-AL]", yea: true, nay: false, nv: false, absent: false, stateProfile: "State Profile", financial: "OpenSecrets", encyclopedia: "Ballotpedia", biography: "VoteSmart", bioGuide: "BioGuide" },
  { name: "Rep. Aguilar, Pete [D-CA]", yea: false, nay: true, nv: false, absent: false, stateProfile: "State Profile", financial: "OpenSecrets", encyclopedia: "Ballotpedia", biography: "VoteSmart", bioGuide: "BioGuide" },
  { name: "Rep. Alford, Mark [R-MO]", yea: true, nay: false, nv: false, absent: false, stateProfile: "State Profile", financial: "N/A", encyclopedia: "Ballotpedia", biography: "VoteSmart", bioGuide: "BioGuide" }
];

export const cpacDataColumns = [
  { id: "col-1", header: "Rank", accessor: "rank" },
  { id: "col-2", header: "Lawmaker Name", accessor: "name" },
  { id: "col-3", header: "2022 Votes", accessor: "votes" },
  { id: "col-4", header: "2022 Rating", accessor: "rating" }
];

export const cpacData = [
  { rank: 1, name: "Rep. Mark Baisley (R)", votes: "19 votes in 2022\nRated for 5 years", rating: "100\n+5 from 2021" },
  { rank: 1, name: "Rep. Shane Sandridge (R)", votes: "19 votes in 2022\nRated for 5 years", rating: "100\nNo change from 2021" },
  { rank: 1, name: "Rep. Patrick Neville (R)", votes: "19 votes in 2022\nRated for 8 years", rating: "100\nNo change from 2021" },
  { rank: 1, name: "Rep. Dave Williams (R)", votes: "19 votes in 2022\nRated for 6 years", rating: "100\nNo change from 2021" }
];
