from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from ml.model_loader import load_model_on_startup
from routers import detect, incidents, vessels


import threading

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load model in background thread so server starts and binds port immediately
    def _bg_load():
        try:
            load_model_on_startup()
            print("Background model loading completed successfully.")
        except Exception as exc:
            print(f"Warning: Startup model loading encountered: {exc}")

    threading.Thread(target=_bg_load, daemon=True).start()
    yield


app = FastAPI(title="AeroMarine AI Backend", version="0.1.0", lifespan=lifespan)

# CORS stays permissive for local dev (running frontend and backend as two
# separate processes on different ports). It's a no-op once the frontend is
# served from this same origin below.
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):\d+",
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(incidents.router)
app.include_router(detect.router)
app.include_router(vessels.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "aeromarine-ai-backend"}


# Serve the built frontend (npm run build -> ../dist) from this same server,
# so the whole app is reachable from a single host:port. API routes above are
# registered first and always take priority over this catch-all.
DIST_DIR = Path(__file__).resolve().parent.parent / "dist"
if DIST_DIR.exists():
    app.mount("/", StaticFiles(directory=str(DIST_DIR), html=True), name="frontend")
