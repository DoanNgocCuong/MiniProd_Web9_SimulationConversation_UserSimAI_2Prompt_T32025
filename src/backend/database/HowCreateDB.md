# Database Migration Report: Text File to SQLite

## Overview
This document details the process of migrating from a text-based storage system to a SQLite database for managing user prompts in the backend system.

## Database Structure

### Table: user_prompts
```sql
CREATE TABLE user_prompts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL,
    full_prompt TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Fields:
- `id`: Unique identifier for each prompt
- `user_name`: Name of the user/character
- `full_prompt`: Complete prompt text
- `created_at`: Timestamp of creation (automatically set)

## Implementation Details

### 1. Database Setup (db.py)
- Created database module in `src/backend/database/db.py`
- Uses SQLite3 for lightweight, serverless database management
- Implements core functions:
  - `init_db()`: Creates database and tables
  - `migrate_from_txt()`: Migrates data from text file
  - `get_all_prompts()`: Retrieves all prompts
  - `update_prompt()`: Updates existing prompts

### 2. Migration Process
The migration from text file to SQLite happens in these steps:

1. **Initialize Database**
```python
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS user_prompts...''')
    conn.commit()
```

2. **Data Migration**
```python
def migrate_from_txt():
    txt_path = Path(__file__).parent.parent / "user_prompts.txt"
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    with open(txt_path, 'r') as file:
        for line in file:
            parts = line.strip().split(',', 2)
            if len(parts) == 3:
                _, name, content = parts
                cursor.execute(
                    'INSERT INTO user_prompts (user_name, full_prompt) VALUES (?, ?)',
                    (name.strip(), content.strip())
                )
```

### 3. API Integration

1. **Updated Utils Function**
```python
def read_user_prompts(file_path=None):
    """
    Read user prompts from the database.
    file_path parameter is kept for backward compatibility.
    """
    return get_all_prompts()
```

2. **Updated API Endpoint**
```python
@app.post("/update-prompt")
async def update_prompt_endpoint(prompt_update: PromptUpdate):
    success = update_prompt(
        prompt_update.id,
        prompt_update.name,
        prompt_update.content
    )
```

## How to Use

1. **Initialize Database**
```bash
# Create database directory
mkdir -p src/backend/database

# Run initialization script
python src/backend/database/init_db.py
```

2. **Verify Migration**
- Check if database file exists: `src/backend/database/user_prompts.db`
- Verify data using SQLite client:
```sql
sqlite3 src/backend/database/user_prompts.db
SELECT * FROM user_prompts;
```

## Benefits of Migration

1. **Data Integrity**
   - ACID compliance
   - Structured data storage
   - Better error handling

2. **Performance**
   - Faster data retrieval
   - Efficient updates
   - Better scalability

3. **Maintainability**
   - Easier to backup
   - Better data structure
   - Support for future features

4. **Security**
   - Better access control
   - Data validation
   - Transaction support

## Backward Compatibility
- Maintained old function signatures
- Kept file_path parameter in read_user_prompts
- Seamless integration with existing code

## Future Improvements

1. **Indexing**
   - Add indexes for frequently queried fields
   - Optimize query performance

2. **Backup System**
   - Implement automated backups
   - Add restore functionality

3. **Additional Features**
   - Add user management
   - Version control for prompts
   - Audit logging

4. **Error Handling**
   - Add more detailed error messages
   - Implement retry mechanisms
   - Add validation layers

## Testing

1. **Database Operations**
```python
# Test database connection
sqlite3 src/backend/database/user_prompts.db

# Test data retrieval
SELECT * FROM user_prompts LIMIT 5;

# Test update operation
UPDATE user_prompts SET user_name = 'Test' WHERE id = 1;
```

2. **API Testing**
```bash
# Test get prompts
curl http://localhost:25050/get-prompts

# Test update prompt
curl -X POST http://localhost:25050/update-prompt \
  -H "Content-Type: application/json" \
  -d '{"id": 1, "name": "Test", "content": "New content"}'
```
