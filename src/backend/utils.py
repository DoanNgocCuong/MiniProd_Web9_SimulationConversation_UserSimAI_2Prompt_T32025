# src/backend/utils.py

def read_user_prompts(file_path):
    try:
        with open(file_path, 'r') as file:
            prompts = []
            for line in file:
                parts = line.strip().split(',', 2)
                if len(parts) == 3:
                    id, name, content = parts
                    prompts.append({
                        "id": int(id.strip()),
                        "name": name.strip(),
                        "content": content.strip()
                    })
        return prompts
    except Exception as e:
        print(f"Error reading user prompts: {e}")
        return []