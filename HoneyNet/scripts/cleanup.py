import docker

client = docker.from_env()

for c in client.containers.list(all=True, filters={"status": "exited"}):
    print(f"Removing: {c.name}")
    c.remove()
