"""
Test Database Connection
"""
import psycopg2
from config import Config

print("\n" + "="*60)
print("🔍 DATABASE CONNECTION TEST")
print("="*60 + "\n")

print("Database Configuration:")
print(f"  Host: {Config.DB_HOST}")
print(f"  Port: {Config.DB_PORT}")
print(f"  User: {Config.DB_USER}")
print(f"  Database: {Config.DB_NAME}")
print()

try:
    print("📡 Attempting to connect...")
    conn = psycopg2.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        dbname=Config.DB_NAME
    )
    print("✅ Connection successful!")
    
    cursor = conn.cursor()
    cursor.execute("SELECT version();")
    version = cursor.fetchone()
    if version:
        print(f"\n✅ PostgreSQL Version: {version[0]}\n")
    else:
        print(f"\n⚠️ Could not retrieve PostgreSQL version\n")
    
    cursor.execute("SELECT COUNT(*) FROM users WHERE role='admin';")
    result = cursor.fetchone()
    admin_count = result[0] if result else 0
    print(f"✅ Admin users found: {admin_count}\n")
    
    cursor.close()
    conn.close()
    
    print("="*60)
    print("✅ ALL DATABASE TESTS PASSED!")
    print("="*60 + "\n")
    
except psycopg2.OperationalError as e:
    print(f"❌ Connection failed!")
    print(f"\nError: {e}\n")
    print("Possible issues:")
    print("  1. Wrong database name (should be: voting_system)")
    print("  2. Wrong username/password")
    print("  3. Database doesn't exist yet")
    print("  4. PostgreSQL not accepting connections")
    print("\nTo create database:")
    print("  psql -U postgres")
    print("  CREATE DATABASE voting_system;")
    print()
except Exception as e:
    print(f"❌ Error: {e}\n")
