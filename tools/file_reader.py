# File reader tool
# Input: file path (string) or folder path (string)
# Output: raw text content (string) or list of text contents (list)

import os

def read_notes(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return content
    except FileNotFoundError:
        return f"Error: file not found at path: {file_path}"
    except Exception as e:
        return f"Error reading file: {str(e)}"

def read_notes_folder(folder_path):
    try:
        if not os.path.exists(folder_path):
            print(f"Error: folder not found at path: {folder_path}")
            return []
        
        notes = []
        for filename in os.listdir(folder_path):
            if filename.endswith('.md'):
                file_path = os.path.join(folder_path, filename)
                content = read_notes(file_path)
                notes.append(content)
        
        return notes
    except Exception as e:
        print(f"Error reading folder: {str(e)}")
        return []