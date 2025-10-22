import psycopg2
import os

print("\n🔍 Checking Profile Picture Paths in Database...\n")

try:
    # Connect with SSL
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("❌ DATABASE_URL not set!")
        print("Please set it in your environment or .env file")
        exit(1)
    
    conn = psycopg2.connect(database_url, sslmode='require')
    cur = conn.cursor()
    
    # Check users table
    print("📊 USERS TABLE:")
    print("=" * 60)
    cur.execute("SELECT id, email, profile_pic FROM users ORDER BY id")
    users = cur.fetchall()
    
    if users:
        for user in users:
            user_id, email, profile_pic = user
            print(f"\nUser ID: {user_id}")
            print(f"Email: {email}")
            print(f"Profile Pic: {profile_pic if profile_pic else '(no picture)'}")
    else:
        print("No users found")
    
    # Check candidates table
    print("\n\n📊 CANDIDATES TABLE:")
    print("=" * 60)
    cur.execute("SELECT id, name, profile_pic FROM candidates ORDER BY id")
    candidates = cur.fetchall()
    
    if candidates:
        for candidate in candidates:
            cand_id, name, profile_pic = candidate
            print(f"\nCandidate ID: {cand_id}")
            print(f"Name: {name}")
            print(f"Profile Pic: {profile_pic if profile_pic else '(no picture)'}")
    else:
        print("No candidates found")
    
    cur.close()
    conn.close()
    
    print("\n" + "=" * 60)
    print("✅ Database check complete!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
