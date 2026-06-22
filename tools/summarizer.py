# Summarizer tool
# Input: meeting notes text (string)
# Output: structured summary (string)

import os
import anthropic
from dotenv import load_dotenv

load_dotenv()

def summarize_notes(notes_text):
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    
    system_prompt = """You are a strategic assistant for a Sierra AI account manager.
You read client meeting notes and extract what matters.
Be concise. Use bullet points. Never invent information not in the notes but feel free to suggest next steps and other action items to improve the work / customer service and make our clients happy."""
    
    user_prompt = f"""Read these meeting notes and return:
1. Key decisions made (bullet points)
2. Current deployment status (2-3 sentences)
3. Open items not yet resolved (bullet points with owner if known)
4. Risks flagged (bullet points)

Meeting notes:
{notes_text}"""
    
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}]
    )
    
    return message.content[0].text

###### AGENDA TOOL

def extract_agenda_items(summary_text):
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    
    system_prompt = """You are a strategic assistant for a Sierra AI account manager.
You create concise, structured meeting agendas from deployment summaries.
Format output for slides — short headers, brief context bullets, nothing redundant.
Never invent information not in the provided summary."""
    
    user_prompt = f"""Based on this deployment summary, create a 30-minute meeting agenda.

Format it exactly like this:

**[Agenda Item]**
- Context bullet 1
- Context bullet 2

Rules:
- Maximum 4 agenda items
- Each item gets 5-8 minutes
- Lead with the most urgent open item
- Every bullet must be actionable or provide direct context for the discussion
- No filler — if it doesn't need to be said in the meeting, leave it out

Deployment summary:
{summary_text}"""
    
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=800,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}]
    )
    
    return message.content[0].text