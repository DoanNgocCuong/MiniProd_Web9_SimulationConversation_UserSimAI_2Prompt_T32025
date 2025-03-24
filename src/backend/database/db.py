import sqlite3
import os
from pathlib import Path

# Create database directory if it doesn't exist
DB_DIR = Path(__file__).parent
DB_DIR.mkdir(exist_ok=True)

DB_PATH = DB_DIR / "user_prompts.db"

def init_db():
    """Initialize the database and create tables if they don't exist."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create user_prompts table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS user_prompts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_name TEXT NOT NULL,
        full_prompt TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    conn.commit()
    conn.close()

def migrate_from_txt():
    """Migrate data from existing text file to SQLite database."""
    txt_path = "user_prompts.txt"
    if not txt_path.exists():
        return
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        with open(txt_path, 'r') as file:
            for line in file:
                parts = line.strip().split(',', 2)
                if len(parts) == 3:
                    _, name, content = parts
                    cursor.execute(
                        'INSERT INTO user_prompts (user_name, full_prompt) VALUES (?, ?)',
                        (name.strip(), content.strip())
                    )
        
        conn.commit()
    except Exception as e:
        print(f"Error migrating data: {e}")
    finally:
        conn.close()

def get_all_prompts():
    """Get all prompts from the database."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, user_name, full_prompt FROM user_prompts')
    prompts = [
        {"id": row[0], "name": row[1], "content": row[2]}
        for row in cursor.fetchall()
    ]
    
    conn.close()
    return prompts

def update_prompt(prompt_id: int, name: str, content: str):
    """Update an existing prompt."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            'UPDATE user_prompts SET user_name = ?, full_prompt = ? WHERE id = ?',
            (name, content, prompt_id)
        )
        conn.commit()
        return True
    except Exception as e:
        print(f"Error updating prompt: {e}")
        return False
    finally:
        conn.close() 