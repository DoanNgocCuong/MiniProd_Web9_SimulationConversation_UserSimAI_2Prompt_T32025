# src/backend/utils.py

from database.db import get_all_prompts

def read_user_prompts(file_path=None):
    """
    Read user prompts from the database.
    file_path parameter is kept for backward compatibility but is ignored.
    """
    return get_all_prompts()