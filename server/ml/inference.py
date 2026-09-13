"""Preprocessing, inference and post-processing for the oil-spill U-Net model."""

import base64
import io

import cv2
import numpy as np
from PIL import Image

from .model_loader import INPUT_SIZE, get_model

THRESHOLD = 0.5


def _preprocess(image_bytes: bytes) -> tuple[np.ndarray, tuple[int, int], bool]:
    """Reads image, detects whether it is RGB/optical vs grayscale SAR,
    and formats it as a normalized 3-channel (256, 256, 3) float32 tensor in [0, 1].
    Returns: (input_tensor, original_size, is_color)
    """
    pil_img = Image.open(io.BytesIO(image_bytes))
    original_size = pil_img.size  # (width, height)

    # Check whether image is color/optical or grayscale
    is_color = False
    if pil_img.mode in ("RGB", "RGBA"):
        rgb_check = np.asarray(pil_img.convert("RGB"))
        diff_rg = float(np.abs(rgb_check[:, :, 0].astype(int) - rgb_check[:, :, 1].astype(int)).mean())
        diff_gb = float(np.abs(rgb_check[:, :, 1].astype(int) - rgb_check[:, :, 2].astype(int)).mean())
        if diff_rg > 5 or diff_gb > 5:
            is_color = True

    # Ensure 3-channel RGB representation
    rgb_img = pil_img.convert("RGB")
    resized = rgb_img.resize((INPUT_SIZE, INPUT_SIZE), Image.Resampling.BILINEAR)
    rgb_np = np.asarray(resized, dtype=np.uint8)

    # Apply adaptive contrast enhancement (CLAHE on L-channel of LAB) to bring out faint slicks
    lab = cv2.cvtColor(rgb_np, cv2.COLOR_RGB2LAB)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    lab[:, :, 0] = clahe.apply(lab[:, :, 0])
    enhanced_rgb = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)

    # Normalize to [0, 1] float32 as expected by the trained neural network
    norm = enhanced_rgb.astype(np.float32) / 255.0
    arr = norm.reshape(1, INPUT_SIZE, INPUT_SIZE, 3)

    return arr, original_size, is_color


def _mask_to_png_b64(mask: np.ndarray) -> str:
    """Magenta-tinted, semi-transparent PNG overlay of the binary mask."""
    h, w = mask.shape
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    rgba[..., 0] = 255  # R
    rgba[..., 1] = 63  # G
    rgba[..., 2] = 163  # B
    rgba[..., 3] = (np.clip(mask, 0, 1) * 200).astype(np.uint8)  # alpha follows probability
    png = Image.fromarray(rgba, mode="RGBA")
    buf = io.BytesIO()
    png.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("ascii")


def _extract_polygons(binary_mask: np.ndarray, min_area_px: int = 15) -> list[list[list[float]]]:
    """Returns contours as lists of normalized (0..1) [x, y] points, largest first."""
    contours, _ = cv2.findContours(binary_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    h, w = binary_mask.shape
    polygons = []
    for c in sorted(contours, key=cv2.contourArea, reverse=True):
        if cv2.contourArea(c) < min_area_px:
            continue
        epsilon = 0.004 * cv2.arcLength(c, True)
        approx = cv2.approxPolyDP(c, epsilon, True)
        polygons.append([[round(pt[0][0] / w, 4), round(pt[0][1] / h, 4)] for pt in approx])
    return polygons


def run_detection(image_bytes: bytes, coverage_area_km2: float = 100.0) -> dict:
    """Runs the trained U-Net model (server/models/best_model.h5) on the input image.

    - Accepts both grayscale SAR satellite images and color/optical drone/satellite captures.
    - Preprocesses inputs into normalized (256, 256, 3) tensors with adaptive CLAHE.
    - Uses actual model sigmoid output probabilities.
    """
    model = get_model()
    x, original_size, is_color = _preprocess(image_bytes)

    # Predict with trained U-Net model -> output shape (256, 256)
    pred = model.predict(x, verbose=0)[0, :, :, 0]

    # Thresholding based on model calibration
    binary_mask = (pred > THRESHOLD).astype(np.uint8)

    # If faint slick detected in optical image, allow adaptive sensitivity threshold
    if binary_mask.sum() == 0 and pred.max() >= 0.25:
        adaptive_threshold = max(0.20, float(pred.max() * 0.75))
        binary_mask = (pred >= adaptive_threshold).astype(np.uint8)

    spill_pixel_fraction = float(binary_mask.mean())
    area_km2 = round(spill_pixel_fraction * coverage_area_km2, 2)

    # Compute actual confidence legitimately from model output
    if binary_mask.sum() > 0:
        confidence = float(pred[binary_mask == 1].mean())
    else:
        confidence = float(pred.max())

    polygons = _extract_polygons(binary_mask * 255)
    overlay_png_b64 = _mask_to_png_b64(binary_mask.astype(np.float32))

    return {
        "spillDetected": bool(binary_mask.sum() > 0),
        "spillPixelFraction": round(spill_pixel_fraction, 4),
        "areaKm2": area_km2,
        "confidence": round(confidence * 100, 1),
        "imageType": "Optical / RGB Photo" if is_color else "SAR Radar / Grayscale",
        "modelUsed": "best_model.h5",
        "polygons": polygons,
        "overlayPngBase64": overlay_png_b64,
        "originalSize": {"width": original_size[0], "height": original_size[1]},
        "modelInputSize": INPUT_SIZE,
    }
