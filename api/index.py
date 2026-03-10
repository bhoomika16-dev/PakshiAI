import sys
import os

# Add the 'backend' folder to the Python path so modules like 'database' map correctly
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app import app
