"""
Fix Admin Password Hash
This script generates a proper werkzeug password hash and updates the admin user
"""

from werkzeug.security import generate_password_hash
import psycopg2
import os

# Your Render database URL
DATABASE_URL = "postgresql://voting_user:gLGwW8rcNbme9U64jK7GrFxxqzhDYtwB@dpg-d4kddqm3jp1c738p49pg-a.singapore-postgres.render.com/voting_system_9ys7"

def fix_admin_password():
    """Generate proper password hash and update admin user"""
    
    print("\n" + "="*60)
    print("🔐 FIXING ADMIN PASSWORD HASH")
    print("="*60 + "\n")
    
    # Generate proper werkzeug password hash
    password = "admin123"
    print(f"📝 Generating hash for password: {password}")
    password_hash = generate_password_hash(password)
    print(f"✅ Generated hash: {password_hash[:50]}...\n")
    
    try:
        # Connect to database
        print("📡 Connecting to Render database...")
        conn = psycopg2.connect(DATABASE_URL, sslmode='require')
        conn.autocommit = True
        cursor = conn.cursor()
        print("✅ Connected successfully!\n")
        
        # Update admin password
        print("🔄 Updating admin password...")
        cursor.execute("""
            UPDATE users 
            SET password = %s 
            WHERE email = 'admin@voting.com'
        """, (password_hash,))
        
        if cursor.rowcount > 0:
            print("✅ Admin password updated successfully!\n")
            
            # Verify the update
            cursor.execute("""
                SELECT name, email, role, 
                       CASE WHEN password IS NOT NULL AND password != '' THEN 'Set' ELSE 'Empty' END as password_status
                FROM users 
                WHERE email = 'admin@voting.com'
            """)
            user = cursor.fetchone()
            
            if user:
                print("📋 Admin User Info:")
                print(f"   Name: {user[0]}")
                print(f"   Email: {user[1]}")
                print(f"   Role: {user[2]}")
                print(f"   Password: {user[3]}\n")
        else:
            print("⚠️  No admin user found. Creating new admin user...\n")
            cursor.execute("""
                INSERT INTO users (name, email, password, role, status, created_at)
                VALUES (%s, %s, %s, 'admin', 'active', NOW())
            """, ('Admin', 'admin@voting.com', password_hash))
            print("✅ Admin user created!\n")
        
        cursor.close()
        conn.close()
        
        print("="*60)
        print("📋 LOGIN CREDENTIALS")
        print("="*60)
        print(f"\n   Email:    admin@voting.com")
        print(f"   Password: {password}\n")
        print("="*60)
        print("🎉 Password fix complete!\n")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    fix_admin_password()

