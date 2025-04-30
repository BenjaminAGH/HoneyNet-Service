FROM ubuntu:22.04

LABEL maintainer="alumno@alumnos.ubb.cl"

ENV DEBIAN_FRONTEND=noninteractive

RUN apt update && \
    apt install -y postgresql curl && \
    apt clean && \
    rm -rf /var/lib/apt/lists/*

CMD ["/bin/bash"]

