import sqlite3
import os

def initialize_database():
    db_path = 'opportunity_radar.db'
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create the Opportunity schema
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS opportunities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            company TEXT,
            deadline TEXT,
            requirements TEXT,
            raw_text TEXT,
            source_url TEXT
        )
    ''')
    
    conn.commit()
    conn.close()
    print(f"Database initialized successfully at {os.path.abspath(db_path)}")

if __name__ == "__main__":
    initialize_database()
