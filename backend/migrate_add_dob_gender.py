"""
Migration: Add DOB and Gender columns to candidates table
Run this script to add dob and gender columns to your Render database
"""

import psycopg2
import os

# Your Render database URL
DATABASE_URL = "postgresql://voting_user:gLGwW8rcNbme9U64jK7GrFxxqzhDYtwB@dpg-d4kddqm3jp1c738p49pg-a.singapore-postgres.render.com/voting_system_9ys7"

def migrate_database():
    """Add dob and gender columns to candidates table"""
    
    print("\n" + "="*60)
    print("🔄 MIGRATING DATABASE - Adding DOB and Gender Columns")
    print("="*60 + "\n")
    
    try:
        # Connect to database
        print("📡 Connecting to Render database...")
        conn = psycopg2.connect(DATABASE_URL, sslmode='require')
        conn.autocommit = True
        cursor = conn.cursor()
        print("✅ Connected successfully!\n")
        
        # Read migration SQL
        migration_file = os.path.join(os.path.dirname(__file__), '..', 'database', 'add_dob_gender_to_candidates.sql')
        
        if not os.path.exists(migration_file):
            print(f"❌ Migration file not found: {migration_file}")
            return False
        
        print("📝 Reading migration file...")
        with open(migration_file, 'r', encoding='utf-8') as f:
            migration_sql = f.read()
        
        print("🔧 Executing migration...")
        cursor.execute(migration_sql)
        
        print("✅ Migration completed successfully!\n")
        
        # Verify columns exist
        cursor.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'candidates'
            AND column_name IN ('dob', 'gender')
            ORDER BY column_name
        """)
        columns = cursor.fetchall()
        
        print("📊 New columns added:")
        if columns:
            for col in columns:
                print(f"   ✅ {col[0]} ({col[1]})")
        else:
            print("   ⚠️  Columns not found (may already exist)")
        
        cursor.close()
        conn.close()
        
        print("\n" + "="*60)
        print("🎉 Migration complete!")
        print("="*60 + "\n")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    migrate_database()

