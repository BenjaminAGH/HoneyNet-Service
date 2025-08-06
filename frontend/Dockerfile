FROM node:20 as builder

WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_HOST_DEVICE_IP
ARG NEXT_PUBLIC_RED_IP

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_HOST_DEVICE_IP=${NEXT_PUBLIC_HOST_DEVICE_IP}
ENV NEXT_PUBLIC_RED_IP=${NEXT_PUBLIC_RED_IP}

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

FROM node:20

WORKDIR /app

RUN addgroup --system nextgroup && adduser --system --ingroup nextgroup nextuser

COPY --from=builder /app ./
RUN chown -R nextuser:nextgroup /app

USER nextuser

EXPOSE 3000

CMD ["npm", "run", "start"]
