"""Loads the trained U-Net oil-spill segmentation model once and keeps it in memory."""

import os
import threading
from typing import Any, Dict

# Models folder path as specified by user
MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
MODEL_FILENAME = "best_model.h5"
MODEL_PATH = os.path.join(MODELS_DIR, MODEL_FILENAME)
INPUT_SIZE = 256
INPUT_CHANNELS = 3

_model = None
_lock = threading.Lock()
_load_error = None
_model_meta: Dict[str, Any] = {
    "model_name": MODEL_FILENAME,
    "model_path": os.path.abspath(MODEL_PATH),
    "loaded": False,
    "input_shape": [None, INPUT_SIZE, INPUT_SIZE, INPUT_CHANNELS],
    "output_shape": [None, INPUT_SIZE, INPUT_SIZE, 1],
    "input_dtype": "float32",
    "output_dtype": "float32",
    "keras_version": None,
    "layers_count": 0,
    "error": None,
}


def load_model_on_startup():
    """Explicitly loads the model into memory at server startup."""
    global _model, _load_error, _model_meta
    with _lock:
        if _model is not None:
            return _model

        try:
            import keras

            _model_meta["keras_version"] = getattr(keras, "__version__", "unknown")
            if not os.path.exists(MODEL_PATH):
                raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")

            _model = keras.models.load_model(MODEL_PATH, compile=False)
            _model_meta["loaded"] = True
            _model_meta["input_shape"] = list(_model.input_shape)
            _model_meta["output_shape"] = list(_model.output_shape)
            _model_meta["input_dtype"] = str(_model.inputs[0].dtype)
            _model_meta["output_dtype"] = str(_model.outputs[0].dtype)
            _model_meta["layers_count"] = len(_model.layers)
            _model_meta["error"] = None
            return _model
        except Exception as exc:
            _load_error = str(exc)
            _model_meta["loaded"] = False
            _model_meta["error"] = str(exc)
            raise exc


def get_model():
    """Returns the globally loaded model singleton."""
    global _model
    if _model is None:
        return load_model_on_startup()
    return _model


def get_model_status() -> Dict[str, Any]:
    """Returns the real model status, shapes, and load state."""
    return dict(_model_meta)

