"""
Create or Reset Admin Account
This script creates a new admin account or resets the password for an existing admin.
"""

from werkzeug.security import generate_password_hash
from models import execute_query
import sys

def create_admin(name='Admin', email='admin@voting.com', password='admin123'):
    """Create or update admin account"""
    
    print("\n" + "="*60)
    print("🔐 ADMIN ACCOUNT SETUP")
    print("="*60 + "\n")
    
    # Check if admin exists
    existing_admin = execute_query(
        "SELECT id, name, email FROM users WHERE role = 'admin'",
        fetch_one=True
    )
    
    # Hash the password
    password_hash = generate_password_hash(password)
    
    if existing_admin:
        # Update existing admin
        if isinstance(existing_admin, dict):
            admin_name = existing_admin.get('name', 'Unknown')
        elif isinstance(existing_admin, (tuple, list)) and len(existing_admin) > 1:
            admin_name = existing_admin[1]
        else:
            admin_name = 'Unknown'
        print(f"⚠️  Admin account already exists: {admin_name}")
        print(f"🔄 Resetting password...\n")
        
        execute_query(
            """UPDATE users 
               SET name = %s, email = %s, password = %s 
               WHERE role = 'admin'""",
            (name, email, password_hash)
        )
        print("✅ Admin password has been reset!\n")
    else:
        # Create new admin
        print("📝 Creating new admin account...\n")
        
        execute_query(
            """INSERT INTO users (name, email, password, role, status)
               VALUES (%s, %s, %s, 'admin', 'active')""",
            (name, email, password_hash)
        )
        print("✅ New admin account created!\n")
    
    # Display credentials
    print("="*60)
    print("📋 ADMIN CREDENTIALS")
    print("="*60)
    print(f"\n   Name:     {name}")
    print(f"   Email:    {email}")
    print(f"   Password: {password}\n")
    print("="*60)
    print("\n💡 Use EMAIL to login, not name!")
    print("⚠️  IMPORTANT: Change this password after first login!")
    print("="*60 + "\n")
    
    return True


if __name__ == '__main__':
    try:
        # Default credentials (you can modify these)
        NAME = 'Admin'
        EMAIL = 'admin@voting.com'
        PASSWORD = 'admin123'
        
        # Allow custom credentials via command line arguments
        if len(sys.argv) > 1:
            NAME = sys.argv[1]
        if len(sys.argv) > 2:
            EMAIL = sys.argv[2]
        if len(sys.argv) > 3:
            PASSWORD = sys.argv[3]
        
        create_admin(NAME, EMAIL, PASSWORD)
        
    except Exception as e:
        print(f"\n❌ Error creating admin: {e}\n")
        print("Make sure:")
        print("  1. Database is running")
        print("  2. Database schema is initialized")
        print("  3. Backend dependencies are installed\n")
        sys.exit(1)
