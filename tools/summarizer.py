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