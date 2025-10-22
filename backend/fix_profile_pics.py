"""
Fix old profile picture paths in database
Sets them to null so users can re-upload with Cloudinary
"""
import psycopg2
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("\n🔧 Fixing Profile Picture URLs in Database...\n")

try:
    # Connect to database
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("❌ DATABASE_URL not found in environment variables")
        exit(1)
    
    conn = psycopg2.connect(database_url, sslmode='require')
    cur = conn.cursor()
    
    # Check users table for old profile pics
    print("📋 Checking users table...")
    cur.execute("SELECT id, email, profile_pic FROM users WHERE profile_pic IS NOT NULL AND profile_pic LIKE '/uploads/%'")
    users_with_old_pics = cur.fetchall()
    
    if users_with_old_pics:
        print(f"Found {len(users_with_old_pics)} users with old local paths:")
        for user in users_with_old_pics:
            print(f"  User ID {user[0]} ({user[1]}): {user[2]}")
        
        # Update to null
        cur.execute("UPDATE users SET profile_pic = NULL WHERE profile_pic LIKE '/uploads/%'")
        conn.commit()
        print(f"✅ Cleared {len(users_with_old_pics)} old profile picture paths in users table")
    else:
        print("✅ No old paths found in users table")
    
    # Check candidates table for old profile pics
    print("\n📋 Checking candidates table...")
    cur.execute("SELECT id, user_id, profile_pic FROM candidates WHERE profile_pic IS NOT NULL AND profile_pic LIKE '/uploads/%'")
    candidates_with_old_pics = cur.fetchall()
    
    if candidates_with_old_pics:
        print(f"Found {len(candidates_with_old_pics)} candidates with old local paths:")
        for candidate in candidates_with_old_pics:
            print(f"  Candidate ID {candidate[0]} (User ID {candidate[1]}): {candidate[2]}")
        
        # Update to null
        cur.execute("UPDATE candidates SET profile_pic = NULL WHERE profile_pic LIKE '/uploads/%'")
        conn.commit()
        print(f"✅ Cleared {len(candidates_with_old_pics)} old profile picture paths in candidates table")
    else:
        print("✅ No old paths found in candidates table")
    
    # Show summary
    print("\n" + "="*50)
    print("📊 SUMMARY")
    print("="*50)
    print("Old local paths have been cleared.")
    print("Users can now re-upload their profile pictures.")
    print("New uploads will use Cloudinary (permanent storage).")
    print("\n✅ Database fixed successfully!")
    
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
