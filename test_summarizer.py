from tools.file_reader import read_notes
from tools.summarizer import summarize_notes, extract_agenda_items

notes = read_notes('notes/maison_and_main_notes.md')
summary = summarize_notes(notes)
print(extract_agenda_items(summary))