import subprocess
import os
import sys
import time
import psycopg2

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_DATA_DIR = os.path.join(BASE_DIR, "postgres_data")
LOG_FILE = os.path.join(BASE_DIR, "postgres.log")
PG_BIN_DIR = r"C:\Program Files\PostgreSQL\18\bin"
PG_CTL = os.path.join(PG_BIN_DIR, "pg_ctl.exe")
PORT = 5433
DB_NAME = "statskill_ai_db"
USER = "postgres"

def start():
    print(f"Starting PostgreSQL on port {PORT}...")
    cmd = [PG_CTL, "-D", DB_DATA_DIR, "-l", LOG_FILE, "-o", f"-p {PORT}", "start"]
    subprocess.run(cmd, check=False)
    time.sleep(2)
    
    # Check if statskill_ai_db exists, create if not
    try:
        conn = psycopg2.connect(host="127.0.0.1", port=PORT, user=USER, dbname="postgres")
        conn.autocommit = True
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (DB_NAME,))
        if not cur.fetchone():
            cur.execute(f'CREATE DATABASE "{DB_NAME}"')
            print(f"Database '{DB_NAME}' created successfully.")
        else:
            print(f"Database '{DB_NAME}' already exists.")
        cur.close()
        conn.close()
        print(f"PostgreSQL is running and accessible on port {PORT}.")
    except Exception as e:
        print(f"Error checking/creating database: {e}")

def stop():
    print("Stopping PostgreSQL...")
    cmd = [PG_CTL, "-D", DB_DATA_DIR, "stop", "-m", "fast"]
    subprocess.run(cmd, check=False)

def status():
    cmd = [PG_CTL, "-D", DB_DATA_DIR, "status"]
    subprocess.run(cmd, check=False)

if __name__ == "__main__":
    action = sys.argv[1] if len(sys.argv) > 1 else "start"
    if action == "start":
        start()
    elif action == "stop":
        stop()
    elif action == "status":
        status()
    else:
        print(f"Unknown action: {action}")
