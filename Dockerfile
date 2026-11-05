FROM node:26-bookworm-slim AS dashboard
WORKDIR /build
COPY package.json package-lock.json .npmrc ./
RUN npm ci --ignore-scripts
COPY dashboard ./dashboard
ARG SUPABASE_URL
ARG SUPABASE_PUBLISHABLE
RUN VITE_SUPABASE_URL="$SUPABASE_URL" VITE_SUPABASE_PUBLISHABLE_KEY="$SUPABASE_PUBLISHABLE" npm run build

FROM ghcr.io/astral-sh/uv:0.13.5 AS uv
FROM python:3.12-slim-bookworm AS application
COPY --from=uv /uv /usr/local/bin/uv
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv export --frozen --only-group server --only-group runtime --only-group context --no-emit-project -o requirements.txt \
    && uv pip install --system --no-cache -r requirements.txt
COPY backend ./backend
COPY agent ./agent
COPY context ./context
COPY runtime ./runtime
COPY data ./data
COPY --from=dashboard /build/dashboard/dist ./dashboard/dist
RUN useradd --create-home --uid 10001 app && chown -R app:app /app
USER app
EXPOSE 8000
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
