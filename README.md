"Client Call Prep Assistant" - version A
This is a test
# Client Call Prep Assistant

A Sierra AI agent that prepares account managers for client calls.
Given a client name, it reads past meeting notes, summarizes the deployment 
status, extracts open items and risks, and outputs a structured prep document.

## How it works

**Perceive**
Receives the client name as input and reads all meeting notes for that client
from the knowledge base.

**Think**
Sends the notes and request to Claude, which identifies what to summarize,
what open items remain unresolved, and what agenda items to prioritize.

**Act**
Calls the summarizer tool, open items extractor, and agenda builder in sequence.
Writes the final output to a structured MD file ready for review.

## Tools

- file_reader — reads meeting notes from the notes/ folder
- summarizer — sends notes to Claude and returns a structured summary
- open_items_extractor — identifies unresolved action items and owners
- agenda_builder — drafts a suggested agenda based on open items and risks
- file_writer — saves the final prep document to the output/ folder