import schedule
import time
import subprocess

def fetch_data():
    print("🔁 Running data fetch script...")
    subprocess.run(["python", "fetch_mgnrega_data.py"])
    print("✅ Data updated successfully!\n")

# Schedule the job — runs every 24 hours
schedule.every(24).hours.do(fetch_data)

print("🕒 Auto-refresh started. The script will run every 24 hours.")
print("Leave this running in background (or use task scheduler).")

# Run immediately at startup too
fetch_data()

# Keep it running
while True:
    schedule.run_pending()
    time.sleep(60)
