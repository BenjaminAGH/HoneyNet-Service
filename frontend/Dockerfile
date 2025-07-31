FROM node:20 as builder

WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

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
