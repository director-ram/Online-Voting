import psycopg2
import os

print("\n🔄 Running Database Migration...\n")

try:
    # Connect with SSL
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("❌ DATABASE_URL not set!")
        exit(1)
        
    conn = psycopg2.connect(database_url, sslmode='require')
    conn.autocommit = True
    cur = conn.cursor()
    
    print("✅ Connected to database")
    
    # Read migration file
    migration_file = os.path.join(os.path.dirname(__file__), '..', 'database', 'candidate_migration.sql')
    with open(migration_file, 'r') as f:
        migration_sql = f.read()
    
    print("📝 Executing migration...")
    cur.execute(migration_sql)
    
    print("✅ Migration completed successfully!\n")
    
    # Verify columns exist
    cur.execute("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'candidates'
        ORDER BY ordinal_position
    """)
    columns = cur.fetchall()
    
    print("Candidates table columns:")
    for col in columns:
        print(f"  - {col[0]}")
    
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Migration failed: {e}")
    import traceback
    traceback.print_exc()
