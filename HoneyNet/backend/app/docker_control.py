import docker
from docker.errors import NotFound, APIError

client = docker.from_env()


def _name(ip, protocol):
    return f"honeypot_{protocol}_{ip.replace('.', '_')}"


def launch_isolated_honeypot(ip: str, protocol: str, port: int = None, image: str = None):
    name = _name(ip, protocol)
    image = image or f"{protocol}_honeypot"

    ports = None
    if port:
        ports = {f"{port}/tcp": port}

    try:
        try:
            existing = client.containers.get(name)
            if existing.status != "running":
                existing.remove()
            else:
                return {"error": f"Container '{name}' already exists and is running"}
        except NotFound:
            pass

        container = client.containers.run(
            image=image,
            name=name,
            detach=True,
            network="honeynet-net",
            environment={"REMOTE_HOST": ip},
            mem_limit="256m",
            ports=ports,
        )
        return {"status": "launched", "name": container.name}
    except APIError as e:
        return {"error": str(e)}



def list_honeypots():
    containers = client.containers.list(all=True, filters={"name": "honeypot_"})
    return [{"name": c.name, "status": c.status} for c in containers]


def remove_honeypot(ip: str, protocol: str):
    name = _name(ip, protocol)
    try:
        c = client.containers.get(name)
        try:
            c.remove(force=True)
        except Exception as e:
            return {"error": f"Failed to remove container: {str(e)}"}
        return {"status": "removed", "name": name}
    except NotFound:
        return {"error": "not found"}