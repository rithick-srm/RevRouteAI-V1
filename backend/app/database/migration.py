import os
import sqlite3

def run_migrations():
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "revroute.db")
    if not os.path.exists(db_path):
        db_path = "revroute.db"

    print(f"Connecting to database at: {os.path.abspath(db_path)}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 1. Add missing columns to fuel_logs
    fuel_cols = [row[1] for row in cursor.execute("PRAGMA table_info(fuel_logs);").fetchall()]
    new_fuel_cols = [
        ("ocr_status", "VARCHAR DEFAULT 'NONE'"),
        ("manager_review_status", "VARCHAR DEFAULT 'PENDING_REVIEW'"),
        ("ocr_raw_text", "TEXT"),
        ("ocr_extracted_json", "TEXT")
    ]
    for col_name, col_def in new_fuel_cols:
        if col_name not in fuel_cols:
            print(f"Adding column '{col_name}' to fuel_logs...")
            cursor.execute(f"ALTER TABLE fuel_logs ADD COLUMN {col_name} {col_def};")

    # 2. Add missing columns to maintenance_logs
    maint_cols = [row[1] for row in cursor.execute("PRAGMA table_info(maintenance_logs);").fetchall()]
    new_maint_cols = [
        ("ocr_status", "VARCHAR DEFAULT 'NONE'"),
        ("manager_review_status", "VARCHAR DEFAULT 'PENDING_REVIEW'"),
        ("ocr_raw_text", "TEXT"),
        ("ocr_extracted_json", "TEXT")
    ]
    for col_name, col_def in new_maint_cols:
        if col_name not in maint_cols:
            print(f"Adding column '{col_name}' to maintenance_logs...")
            cursor.execute(f"ALTER TABLE maintenance_logs ADD COLUMN {col_name} {col_def};")

    # 3. Create driver_notifications table safely
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS driver_notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        driver_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        notification_type VARCHAR(50) DEFAULT 'INFO',
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (driver_id) REFERENCES users (id)
    );
    """)

    conn.commit()
    print("Database migration completed successfully.")

    print("\nVERIFICATION - fuel_logs columns:")
    for row in cursor.execute("PRAGMA table_info(fuel_logs);").fetchall():
        print("  -", row[1], "(", row[2], ")")

    print("\nVERIFICATION - maintenance_logs columns:")
    for row in cursor.execute("PRAGMA table_info(maintenance_logs);").fetchall():
        print("  -", row[1], "(", row[2], ")")

    conn.close()

if __name__ == "__main__":
    run_migrations()
