"""
Database Initialization Script
Creates all required tables for the voting system
"""

import psycopg2
from config import Config
import os

def init_database():
    """Initialize database with schema"""
    
    print("\n" + "="*60)
    print("🗄️  DATABASE INITIALIZATION")
    print("="*60 + "\n")
    
    try:
        # Connect to PostgreSQL
        print("📡 Connecting to database...")
        conn = psycopg2.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME
        )
        conn.autocommit = True
        cursor = conn.cursor()
        print("✅ Connected successfully!\n")
        
        # Read and execute SQL schema
        sql_file = os.path.join(os.path.dirname(__file__), '..', 'database', 'voting_system.sql')
        
        if not os.path.exists(sql_file):
            print(f"❌ Schema file not found: {sql_file}")
            return False
        
        print("📝 Reading schema file...")
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql_commands = f.read()
        
        print("🔧 Executing schema...")
        cursor.execute(sql_commands)
        
        print("👤 Creating admin account...")
        cursor.close()
        conn.close()
        
        # Create admin using the create_admin module
        from create_admin import create_admin
        create_admin()
        
        print("\n✅ Database initialized successfully!\n")
        print("="*60)
        print("📊 Created Tables:")
        print("="*60)
        print("  • users (voters and admin)")
        print("  • candidates")
        print("  • votes (with daily voting)")
        print("  • results")
        print("\n" + "="*60)
        print("👤 Default Admin Account:")
        print("="*60)
        print("  Email:    admin@voting.com")
        print("  Password: admin123")
        print("="*60 + "\n")
        
        cursor.close()
        conn.close()
        
        return True
        
    except psycopg2.Error as e:
        print(f"\n❌ Database Error: {e}\n")
        print("Make sure:")
        print("  1. PostgreSQL is running")
        print("  2. Database exists (CREATE DATABASE voting_system)")
        print("  3. Credentials in config.py are correct\n")
        return False
        
    except Exception as e:
        print(f"\n❌ Error: {e}\n")
        return False


if __name__ == '__main__':
    success = init_database()
    exit(0 if success else 1)
