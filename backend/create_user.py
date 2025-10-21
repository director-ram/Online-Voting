"""
Create user account
Usage: python create_user.py "Name" "email@example.com" "password"
"""
from models.user_model import User
import sys

if len(sys.argv) < 4:
    print("\n" + "="*60)
    print("📝 CREATE USER ACCOUNT")
    print("="*60)
    print("\nUsage:")
    print("  python create_user.py \"Name\" \"email@example.com\" \"password\"")
    print("\nExample:")
    print("  python create_user.py \"Neeraj\" \"neeraj@koja.com\" \"mypassword\"")
    print("\n" + "="*60 + "\n")
    sys.exit(1)

name = sys.argv[1]
email = sys.argv[2]
password = sys.argv[3]

print("\n" + "="*60)
print("📝 CREATING USER ACCOUNT")
print("="*60 + "\n")

try:
    # Check if user already exists
    existing = User.find_by_email(email)
    if existing:
        print(f"⚠️  User '{email}' already exists!\n")
        sys.exit(1)
    
    # Create user
    user_id = User.create(name, email, password, role='user')
    
    print(f"✅ User created successfully!\n")
    print("="*60)
    print("📋 ACCOUNT DETAILS")
    print("="*60)
    print(f"\n  ID:       {user_id}")
    print(f"  Name:     {name}")
    print(f"  Email:    {email}")
    print(f"  Password: {password}")
    print(f"  Role:     user\n")
    print("="*60)
    print("\n✅ You can now login at: http://localhost:3001")
    print("="*60 + "\n")
    
except Exception as e:
    print(f"❌ Error creating user: {e}\n")
    sys.exit(1)
