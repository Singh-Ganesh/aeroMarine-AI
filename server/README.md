# AeroMarine AI — Backend

FastAPI service providing:

- **Real ML inference** — `POST /api/detect-spill`, backed by the trained U-Net oil-spill segmentation model (`models_store/oil_spill_unet.h5`, input: 256×256 grayscale SAR image, output: pixel-wise spill probability mask).
- Supporting data endpoints (`/api/vessels`, `/api/incidents`, `/api/notifications`, `/api/kpi`) mirroring the frontend's mock data, so they can be swapped for a real database later without touching the frontend contract.

## Setup

```bash
cd server
pip install -r requirements.txt
```

(A virtual environment is recommended: `python -m venv venv && venv\Scripts\activate` on Windows, then install into it.)

## Run

```bash
uvicorn main:app --reload --port 8000
```

Check it's alive: http://localhost:8000/api/health

Interactive API docs (Swagger UI): http://localhost:8000/docs

## The model

Trained on Keras 2 / TF 2.13. Modern TensorFlow ships **Keras 3**, which rejects some of that older model's layer configs (`Conv2DTranspose` with a stray `groups` kwarg). To load it without retraining or hand-editing the saved model, this backend loads it through the `tf-keras` package — the maintained standalone Keras 2 API — instead of `tensorflow.keras`. See `ml/model_loader.py`.

## `/api/detect-spill`

```
POST /api/detect-spill?coverage_area_km2=100
Content-Type: multipart/form-data
  file: <image>  (PNG/JPEG/BMP/TIFF)
```

`coverage_area_km2` is the real-world area the *whole uploaded image* is assumed to represent — used only to convert the model's predicted pixel fraction into a km² estimate for display. Adjust it to match your actual SAR image's ground coverage for a realistic number.

Response:
```json
{
  "spillDetected": true,
  "spillPixelFraction": 0.081,
  "areaKm2": 8.1,
  "confidence": 92.4,
  "polygons": [[[0.21, 0.33], [0.24, 0.30], ...]],
  "overlayPngBase64": "...",
  "originalSize": {"width": 512, "height": 512},
  "modelInputSize": 256
}
```

- `polygons` — detected-region contours, points normalized to `[0,1]` in image space (multiply by your display width/height to draw them).
- `overlayPngBase64` — a magenta, alpha-weighted-by-probability PNG the same size as the model input (256×256); overlay it on the source image (see `SpillAnalyzer.tsx` in the frontend, which blends it with `mix-blend-screen`).

## Next steps for a real deployment

- Swap `seed_data.py` for a real database (Postgres/SQLite) — router function bodies are the only thing that needs to change.
- Persist detection results (currently stateless — nothing is saved after a request).
- Add auth (JWT) if the dashboard needs real logins.
- Georeference: currently the model has no idea *where* a SAR image was taken. If you have lat/lon bounds for each image, you can map the normalized polygon points onto the live map instead of just previewing them over the source image.
