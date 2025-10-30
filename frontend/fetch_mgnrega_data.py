import requests
import psycopg2
from psycopg2.extras import execute_values

# --- CONFIG ---
API_KEY = "579b464db66ec23bdd00000158d7f27568304ad5723a580fca32723b"
API_URL = "https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722"

# PostgreSQL connection config
DB_CONFIG = {
    "dbname": "mgnrega_db",
    "user": "postgres",  # change if you use another username
    "password": "postgres",  # 🔹 replace with your actual password
    "host": "localhost",
    "port": "5432"
}

# --- Fetch data from API ---
params = {
    "api-key": API_KEY,
    "format": "json",
    "limit": 50
}

print("Fetching data from API...")
response = requests.get(API_URL, params=params)

if response.status_code == 200:
    data = response.json()
    records = data.get("records", [])

    if not records:
        print("⚠️ No records found.")
    else:
        print(f"✅ Fetched {len(records)} records from API.")

        # --- Connect to PostgreSQL ---
        try:
            conn = psycopg2.connect(**DB_CONFIG)
            cur = conn.cursor()

            # Prepare data for insertion
            rows = []
            for r in records:
                rows.append((
                    r.get("state_name"),
                    r.get("district_name"),
                    r.get("month_year"),
                    r.get("jobcards_issued"),
                    r.get("households_worked"),
                    r.get("total_persondays"),
                    r.get("total_wages_paid")
                ))

            # Insert into database
            query = """
                INSERT INTO mgnrega_data
                (state_name, district_name, month_year, jobcards_issued, households_worked, total_persondays, total_wages_paid)
                VALUES %s
            """
            execute_values(cur, query, rows)

            conn.commit()
            print("✅ Data inserted successfully into PostgreSQL.")

        except Exception as e:
            print(f"❌ Database error: {e}")
        finally:
            cur.close()
            conn.close()

else:
    print(f"❌ Failed to fetch data. Status Code: {response.status_code}")
