# Build stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# ARGS for build time variables
ARG GEMINI_API_KEY=""
ENV GEMINI_API_KEY=$GEMINI_API_KEY
ARG VITE_API_KEY
ENV VITE_API_KEY=$GEMINI_API_KEY
# Note: vite.config.ts maps process.env.GEMINI_API_KEY to defines, 
# but checking vite.config.ts again:
# define: { 'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY), ... }
# So we need GEMINI_API_KEY env var available when `npm run build` runs (which runs vite build).
# Vite loadEnv reads from .env files, but arguments passed to the build command or env vars
# in the shell also work if we use them in vite.config.ts correctly.
# The current vite.config.ts uses `loadEnv(mode, '.', '')` which reads .env files.
# It does NOT automatically pick up process.env unless we explicitly use it.
# Line 6: `const env = loadEnv(mode, '.', '');`
# This reads .env files. If we want to support process.env we might need to merge it or ensure loadEnv sees it.
# Actually loadEnv uses dotenv which doesn't automatically look at process.env by default unless configured? 
# Wait, loadEnv docs say: "By default, Vite does not load .env files... `loadEnv` loads..."
# Use `process.env` in the config to read system env vars if loadEnv doesn't pick them up?
# Let's check vite.config.ts again.
# It reads lines from .env.
# If I export GEMINI_API_KEY in the docker build step, it is an environment variable.
# loadEnv 3rd arg is 'prefixes'. An empty string '' means load all env vars.
# But does loadEnv merge process.env?
# "loadEnv will load the environment variables... and return the ONE matching the prefix."
# It reads from FILES. It doesn't inherently read from process.env.
# HOWEVER, `define` using `env.GEMINI_API_KEY` implies it relies on that object.
# I should ensure the vite build picks up the system env var if it's not in a file.
# The common pattern is `const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') };`
# I might need to patch vite.config.ts or assume it works. 
# actually loadEnv DOES NOT read process.env.
# So I should probably patch vite.config.ts to prefer process.env if present, or write a temporary .env file in the build stage.

RUN echo "GEMINI_API_KEY=$GEMINI_API_KEY" > .env.local
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run sets PORT env var. Nginx must listen on it.
# We replace 8080 with $PORT in the config.
CMD sh -c "sed -i 's/listen       8080;/listen       $PORT;/' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
