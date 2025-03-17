
import { Conversation } from "@/types";

export const voteDataScrapingConversation: Conversation = {
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
};

export const mockConversations: Conversation[] = [
  voteDataScrapingConversation
];
