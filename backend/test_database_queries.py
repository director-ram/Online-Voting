"""
Test Database Queries
Verify that database queries return correct values with DOB and gender
"""

import psycopg2
import os

# Your Render database URL
DATABASE_URL = "postgresql://voting_user:gLGwW8rcNbme9U64jK7GrFxxqzhDYtwB@dpg-d4kddqm3jp1c738p49pg-a.singapore-postgres.render.com/voting_system_9ys7"

def test_database():
    """Test database queries to verify correct values"""
    
    print("\n" + "="*60)
    print("🧪 TESTING DATABASE QUERIES")
    print("="*60 + "\n")
    
    try:
        # Connect to database
        print("📡 Connecting to database...")
        conn = psycopg2.connect(DATABASE_URL, sslmode='require')
        conn.autocommit = True
        cursor = conn.cursor()
        print("✅ Connected successfully!\n")
        
        # Test 1: Check candidates table structure
        print("📊 Test 1: Checking candidates table structure...")
        cursor.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'candidates'
            ORDER BY ordinal_position
        """)
        columns = cursor.fetchall()
        print("   Columns in candidates table:")
        for col in columns:
            nullable = "NULL" if col[2] == 'YES' else "NOT NULL"
            print(f"   ✅ {col[0]:20} {col[1]:20} {nullable}")
        
        # Test 2: Check if DOB and gender columns exist
        print("\n📊 Test 2: Verifying DOB and gender columns...")
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns
            WHERE table_name = 'candidates'
            AND column_name IN ('dob', 'gender')
        """)
        dob_gender_cols = cursor.fetchall()
        if len(dob_gender_cols) == 2:
            print("   ✅ DOB column exists")
            print("   ✅ Gender column exists")
        else:
            print(f"   ⚠️  Found {len(dob_gender_cols)} columns (expected 2)")
            for col in dob_gender_cols:
                print(f"      - {col[0]}")
        
        # Test 3: Test get_all query (same as Candidate.get_all())
        print("\n📊 Test 3: Testing get_all query...")
        query = """
            SELECT c.id, c.name, c.party, c.user_id, c.manifesto as description, c.is_active,
                   c.profile_pic, c.created_at, c.dob, c.gender,
                   u.name as user_name, u.email
            FROM candidates c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.is_active = true
            ORDER BY c.name
        """
        cursor.execute(query)
        candidates = cursor.fetchall()
        print(f"   Found {len(candidates)} active candidates")
        
        if candidates:
            print("\n   First candidate details:")
            cand = candidates[0]
            print(f"      ID: {cand[0]}")
            print(f"      Name: {cand[1]}")
            print(f"      Party: {cand[2]}")
            print(f"      User ID: {cand[3]}")
            print(f"      Description: {cand[4][:50] if cand[4] else 'None'}...")
            print(f"      Is Active: {cand[5]}")
            print(f"      Profile Pic: {cand[6] if cand[6] else 'None'}")
            print(f"      Created At: {cand[7]}")
            print(f"      DOB: {cand[8] if cand[8] else 'None'}")
            print(f"      Gender: {cand[9] if cand[9] else 'None'}")
            print(f"      User Name: {cand[10] if cand[10] else 'None'}")
            print(f"      Email: {cand[11] if cand[11] else 'None'}")
            print(f"   ✅ Query returned {len(cand)} columns (expected 12)")
        else:
            print("   ℹ️  No candidates found (this is OK for a fresh database)")
        
        # Test 4: Test get_by_user_id query
        print("\n📊 Test 4: Testing get_by_user_id query...")
        # Get first user ID if exists
        cursor.execute("SELECT id FROM users LIMIT 1")
        user_result = cursor.fetchone()
        if user_result:
            user_id = user_result[0]
            query = """
                SELECT c.id, c.name, c.party, c.user_id, c.manifesto as description, c.is_active,
                       c.profile_pic, c.created_at, c.dob, c.gender,
                       u.name as user_name, u.email,
                       COUNT(v.id) as vote_count
                FROM candidates c
                LEFT JOIN users u ON c.user_id = u.id
                LEFT JOIN votes v ON c.id = v.candidate_id AND v.vote_date = CURRENT_DATE
                WHERE c.user_id = %s
                GROUP BY c.id, c.name, c.party, c.user_id, c.manifesto, c.is_active,
                         c.profile_pic, c.created_at, c.dob, c.gender, u.name, u.email
            """
            cursor.execute(query, (user_id,))
            candidate = cursor.fetchone()
            if candidate:
                print(f"   ✅ Found candidate for user_id {user_id}")
                print(f"      Vote count: {candidate[12]}")
            else:
                print(f"   ℹ️  No candidate found for user_id {user_id}")
        
        # Test 5: Check users table
        print("\n📊 Test 5: Checking users table...")
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        print(f"   Total users: {user_count}")
        
        # Test 6: Check votes table
        print("\n📊 Test 6: Checking votes table...")
        cursor.execute("SELECT COUNT(*) FROM votes")
        vote_count = cursor.fetchone()[0]
        print(f"   Total votes: {vote_count}")
        
        cursor.close()
        conn.close()
        
        print("\n" + "="*60)
        print("✅ All database tests completed!")
        print("="*60 + "\n")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    test_database()

