import psycopg2
import os

print("\n🔍 Checking Render Database...\n")

try:
    # Connect with SSL
    database_url = os.getenv('DATABASE_URL')
    conn = psycopg2.connect(database_url, sslmode='require')
    cur = conn.cursor()
    
    # Check tables
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
    tables = cur.fetchall()
    
    print("✅ Connected to Render database successfully!")
    print(f"\nTables found: {len(tables)}")
    
    if tables:
        for table in tables:
            print(f"  - {table[0]}")
            
            # Count rows in each table
            cur.execute(f"SELECT COUNT(*) FROM {table[0]}")
            result = cur.fetchone()
            count = result[0] if result else 0
            print(f"    ({count} rows)")
    else:
        print("  ⚠️  NO TABLES FOUND!")
        print("\n❌ Database is empty - tables were not created")
    
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
