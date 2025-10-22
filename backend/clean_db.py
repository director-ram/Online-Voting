"""
Clean old profile picture paths from Render database
Run this script directly with your DATABASE_URL
"""
import psycopg2
import sys

print("\n🔧 CLEANING OLD PROFILE PICTURE PATHS\n")
print("="*60)

# Get database URL from command line argument
if len(sys.argv) < 2:
    print("\n❌ ERROR: Database URL required!\n")
    print("USAGE:")
    print("  python clean_db.py \"YOUR_DATABASE_URL\"\n")
    print("HOW TO GET DATABASE_URL FROM RENDER:")
    print("  1. Go to: https://dashboard.render.com/")
    print("  2. Click your PostgreSQL database: voting-db")
    print("  3. Look for 'Internal Database URL' or 'External Database URL'")
    print("  4. Click 'Copy' icon next to it")
    print("  5. Run: python clean_db.py \"paste-url-here\"\n")
    print("Example URL format:")
    print("  postgresql://user:pass@host.oregon-postgres.render.com/dbname\n")
    sys.exit(1)

database_url = sys.argv[1]

try:
    print("📡 Connecting to database...")
    conn = psycopg2.connect(database_url, sslmode='require')
    cur = conn.cursor()
    print("✅ Connected successfully!\n")
    
    # Check users table
    print("📋 Checking users table...")
    cur.execute("""
        SELECT id, email, profile_pic 
        FROM users 
        WHERE profile_pic IS NOT NULL 
        AND profile_pic LIKE '/uploads/%'
    """)
    users_with_old_pics = cur.fetchall()
    
    if users_with_old_pics:
        print(f"\n   Found {len(users_with_old_pics)} users with old paths:")
        for user in users_with_old_pics:
            print(f"   • User {user[0]} ({user[1]}): {user[2]}")
        
        # Clean users table
        cur.execute("UPDATE users SET profile_pic = NULL WHERE profile_pic LIKE '/uploads/%'")
        conn.commit()
        print(f"\n   ✅ Cleaned {len(users_with_old_pics)} old paths from users")
    else:
        print("   ✅ No old paths found in users table")
    
    # Check candidates table
    print("\n📋 Checking candidates table...")
    cur.execute("""
        SELECT id, user_id, profile_pic 
        FROM candidates 
        WHERE profile_pic IS NOT NULL 
        AND profile_pic LIKE '/uploads/%'
    """)
    candidates_with_old_pics = cur.fetchall()
    
    if candidates_with_old_pics:
        print(f"\n   Found {len(candidates_with_old_pics)} candidates with old paths:")
        for candidate in candidates_with_old_pics:
            print(f"   • Candidate {candidate[0]} (User {candidate[1]}): {candidate[2]}")
        
        # Clean candidates table
        cur.execute("UPDATE candidates SET profile_pic = NULL WHERE profile_pic LIKE '/uploads/%'")
        conn.commit()
        print(f"\n   ✅ Cleaned {len(candidates_with_old_pics)} old paths from candidates")
    else:
        print("   ✅ No old paths found in candidates table")
    
    # Verify cleanup
    print("\n🔍 Verifying cleanup...")
    cur.execute("SELECT COUNT(*) FROM users WHERE profile_pic LIKE '/uploads/%'")
    result = cur.fetchone()
    users_remaining = result[0] if result else 0
    
    cur.execute("SELECT COUNT(*) FROM candidates WHERE profile_pic LIKE '/uploads/%'")
    result = cur.fetchone()
    candidates_remaining = result[0] if result else 0
    
    print(f"   Users with old paths: {users_remaining}")
    print(f"   Candidates with old paths: {candidates_remaining}")
    
    if users_remaining == 0 and candidates_remaining == 0:
        print("\n" + "="*60)
        print("✅ DATABASE CLEANED SUCCESSFULLY!")
        print("="*60)
        print("\n📝 Summary:")
        print("   • All old local paths removed")
        print("   • Users will see default avatars")
        print("   • Users can re-upload with Cloudinary")
        print("   • New uploads will be permanent!\n")
    else:
        print("\n⚠️  Some old paths may still remain")
    
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    print("\nTroubleshooting:")
    print("  • Make sure the database URL is correct")
    print("  • URL should start with 'postgresql://'")
    print("  • Make sure you're copying the full URL")
    import traceback
    traceback.print_exc()
    sys.exit(1)
