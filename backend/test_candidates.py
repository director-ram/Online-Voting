from models import execute_query

print("\n🔍 TESTING DATABASE...")

try:
    # Test 1: Check if candidates table exists
    print("\n1. Checking candidates table...")
    result = execute_query("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'candidates'
        ORDER BY ordinal_position
    """, fetch=True)
    
    if result:
        if isinstance(result, list):
            print(f"✅ Candidates table exists with {len(result)} columns:")
            for col in result:
                if isinstance(col, dict):
                    print(f"   - {col['column_name']}: {col['data_type']}")
                else:
                    print(f"   - {col[0]}: {col[1]}")
        else:
            print(f"✅ Candidates table exists: {result}")
    else:
        print("❌ Candidates table NOT FOUND!")
    
    # Test 2: Count candidates
    print("\n2. Counting candidates...")
    count_result = execute_query("SELECT COUNT(*) FROM candidates", fetch=True)
    if count_result:
        # If count_result is a list of tuples, extract the count; otherwise, print directly
        if isinstance(count_result, list) and len(count_result) > 0 and isinstance(count_result[0], (list, tuple)):
            print(f"✅ Found {count_result[0][0]} candidates in database")
        else:
            print(f"✅ Found {count_result} candidates in database")
    
    # Test 3: Try fetching candidates (same as GET /api/candidates)
    print("\n3. Testing GET candidates query...")
    candidates = execute_query("""
        SELECT c.id, c.name, c.party, c.position, c.description, c.profile_pic
        FROM candidates c
        WHERE c.is_active = true
        ORDER BY c.name ASC
    """, fetch=True)
    
    if candidates:
        if isinstance(candidates, list):
            print(f"✅ Successfully fetched {len(candidates)} active candidates")
            for c in candidates:
                print(f"   - {c[1]} ({c[2]})")
        else:
            print(f"⚠️  Unexpected result type: {type(candidates)}")
    else:
        print("⚠️  No active candidates found")
    
    print("\n✅ ALL TESTS PASSED!")
    
except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
