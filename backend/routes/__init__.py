# Make routes a package and export token_required for IDEs
from .auth_routes import token_required  # re-export for Pylance