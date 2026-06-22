# File reader tool
# Input: file path (string)
# Output: raw text content (string)

def read_notes(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return content
    except FileNotFoundError:
        return f"Error: file not found at path: {file_path}"
    except Exception as e:
        return f"Error reading file: {str(e)}"