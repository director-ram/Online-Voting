"""
Initialize Render Database Schema
Run this script to initialize your Render database with the schema
"""

import psycopg2
import os
import sys

# Your Render database URL
DATABASE_URL = "postgresql://voting_user:gLGwW8rcNbme9U64jK7GrFxxqzhDYtwB@dpg-d4kddqm3jp1c738p49pg-a.singapore-postgres.render.com/voting_system_9ys7"

def init_database():
    """Initialize database with schema"""
    
    print("\n" + "="*60)
    print("🗄️  INITIALIZING RENDER DATABASE")
    print("="*60 + "\n")
    
    try:
        # Connect to database with SSL
        print("📡 Connecting to Render database...")
        conn = psycopg2.connect(DATABASE_URL, sslmode='require')
        conn.autocommit = True
        cursor = conn.cursor()
        print("✅ Connected successfully!\n")
        
        # Read SQL schema file
        sql_file = os.path.join(os.path.dirname(__file__), '..', 'database', 'voting_system.sql')
        
        if not os.path.exists(sql_file):
            print(f"❌ Schema file not found: {sql_file}")
            return False
        
        print("📝 Reading schema file...")
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql_commands = f.read()
        
        print("🔧 Executing schema...")
        cursor.execute(sql_commands)
        
        print("\n✅ Database schema created successfully!\n")
        
        # Create admin user
        print("👤 Creating admin user...")
        admin_sql = """
        INSERT INTO users (name, email, password, role, status, created_at)
        VALUES (
            'Admin',
            'admin@voting.com',
            '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJ5q5q5q5',
            'admin',
            'active',
            NOW()
        )
        ON CONFLICT (email) DO NOTHING;
        """
        cursor.execute(admin_sql)
        
        print("✅ Admin user created!")
        print("\n📋 Admin Credentials:")
        print("   Email: admin@voting.com")
        print("   Password: admin123\n")
        
        # Verify tables
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        tables = cursor.fetchall()
        
        print("📊 Tables created:")
        for table in tables:
            print(f"   ✅ {table[0]}")
        
        cursor.close()
        conn.close()
        
        print("\n" + "="*60)
        print("🎉 Database initialization complete!")
        print("="*60 + "\n")
        
        return True
        
    except psycopg2.Error as e:
        print(f"\n❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = init_database()
    sys.exit(0 if success else 1)

