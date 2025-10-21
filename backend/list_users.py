"""
List all users in database
"""
from models import execute_query

print("\n" + "="*60)
print("📋 ALL USERS IN DATABASE")
print("="*60 + "\n")

try:
    users = execute_query("SELECT id, name, email, role FROM users ORDER BY id", fetch=True)
    
    if users and isinstance(users, list):
        print(f"Total users: {len(users)}\n")
        for user in users:
            if isinstance(user, dict):
                id_val = user.get('id')
                name_val = user.get('name')
                email_val = user.get('email')
                role_val = user.get('role')
            else:
                # assume tuple/list order: id, name, email, role
                id_val, name_val, email_val, role_val = user[0], user[1], user[2], user[3]
            print(f"  ID: {id_val}")
            print(f"  Name: {name_val}")
            print(f"  Email: {email_val}")
            print(f"  Role: {role_val}")
            print()
    else:
        print("❌ No users found in database!")
        print("\nDatabase might have been reinitialized.")
        print("Run: python create_admin.py")
        print()
        
except Exception as e:
    print(f"❌ Error: {e}\n")

print("="*60 + "\n")
