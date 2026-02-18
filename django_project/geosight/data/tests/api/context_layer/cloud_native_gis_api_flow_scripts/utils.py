import os


def load_env():
    """Load key=value pairs from .env file next to this script."""
    env = {}
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                env[key.strip()] = value.strip()
    return env