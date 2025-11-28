"""
Test Complete Flow
Test creating a candidate with DOB and gender, then retrieving it
"""

import psycopg2
import os
from werkzeug.security import generate_password_hash
from datetime import date

# Your Render database URL
DATABASE_URL = "postgresql://voting_user:gLGwW8rcNbme9U64jK7GrFxxqzhDYtwB@dpg-d4kddqm3jp1c738p49pg-a.singapore-postgres.render.com/voting_system_9ys7"

def test_complete_flow():
    """Test complete candidate creation and retrieval flow"""
    
    print("\n" + "="*60)
    print("🧪 TESTING COMPLETE FLOW")
    print("="*60 + "\n")
    
    try:
        # Connect to database
        print("📡 Connecting to database...")
        conn = psycopg2.connect(DATABASE_URL, sslmode='require')
        conn.autocommit = True
        cursor = conn.cursor()
        print("✅ Connected successfully!\n")
        
        # Test: Create a test candidate with DOB and gender
        print("📝 Test: Creating test candidate with DOB and gender...")
        
        # Get first user (admin)
        cursor.execute("SELECT id FROM users LIMIT 1")
        user_result = cursor.fetchone()
        if not user_result:
            print("   ⚠️  No users found, skipping test")
            return
        
        user_id = user_result[0]
        print(f"   Using user_id: {user_id}")
        
        # Check if candidate already exists
        cursor.execute("SELECT id FROM candidates WHERE user_id = %s", (user_id,))
        existing = cursor.fetchone()
        
        if existing:
            print(f"   ℹ️  Candidate already exists (id: {existing[0]}), updating...")
            candidate_id = existing[0]
            cursor.execute("""
                UPDATE candidates 
                SET name = %s, manifesto = %s, party = %s, dob = %s, gender = %s
                WHERE id = %s
            """, ("Test Candidate", "Test manifesto", "Test Party", date(1990, 1, 1), "male", candidate_id))
        else:
            print("   Creating new candidate...")
            cursor.execute("""
                INSERT INTO candidates (user_id, name, manifesto, party, dob, gender, is_active)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (user_id, "Test Candidate", "Test manifesto", "Test Party", date(1990, 1, 1), "male", True))
            candidate_id = cursor.fetchone()[0]
        
        print(f"   ✅ Candidate created/updated (id: {candidate_id})\n")
        
        # Test: Retrieve candidate using get_all query
        print("📊 Test: Retrieving candidate using get_all query...")
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
        
        print(f"   Found {len(candidates)} candidates")
        if candidates:
            cand = candidates[0]
            print(f"\n   ✅ Candidate Data Retrieved:")
            print(f"      ID: {cand[0]}")
            print(f"      Name: {cand[1]}")
            print(f"      Party: {cand[2]}")
            print(f"      User ID: {cand[3]}")
            print(f"      Description: {cand[4]}")
            print(f"      Is Active: {cand[5]}")
            print(f"      Profile Pic: {cand[6] if cand[6] else 'None'}")
            print(f"      Created At: {cand[7]}")
            print(f"      DOB: {cand[8]} ✅")
            print(f"      Gender: {cand[9]} ✅")
            print(f"      User Name: {cand[10] if cand[10] else 'None'}")
            print(f"      Email: {cand[11] if cand[11] else 'None'}")
            
            # Verify DOB and gender are not None
            if cand[8] is not None and cand[9] is not None:
                print("\n   ✅ SUCCESS: DOB and gender are saved and retrieved correctly!")
            else:
                print("\n   ⚠️  WARNING: DOB or gender is None")
                print(f"      DOB: {cand[8]}")
                print(f"      Gender: {cand[9]}")
        
        # Test: Retrieve using get_by_user_id query
        print("\n📊 Test: Retrieving candidate using get_by_user_id query...")
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
            print(f"   ✅ Candidate found for user_id {user_id}")
            print(f"      DOB: {candidate[8]} ✅")
            print(f"      Gender: {candidate[9]} ✅")
            print(f"      Vote Count: {candidate[12]}")
        
        cursor.close()
        conn.close()
        
        print("\n" + "="*60)
        print("✅ Complete flow test finished!")
        print("="*60 + "\n")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    test_complete_flow()

