import os

HONEYPOT_NETWORK = os.getenv("HONEYPOT_NETWORK", "honeynet-net")
DEFAULT_MEMORY = os.getenv("HONEYPOT_MEM", "256m")
