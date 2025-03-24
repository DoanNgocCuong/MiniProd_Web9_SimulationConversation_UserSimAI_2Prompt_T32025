from db import init_db, migrate_from_txt

if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    print("Migrating existing data...")
    migrate_from_txt()
    print("Database setup complete!") 