
// Mock data for tables used in the UI

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
