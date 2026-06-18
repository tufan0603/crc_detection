import os
import numpy as np
import pydicom
import cv2
import torch
import torch.nn as nn
from scipy.ndimage import zoom
from monai.networks.nets import DenseNet121

DEVICE       = "cuda" if torch.cuda.is_available() else "cpu"
TARGET_DEPTH = 64
TARGET_H     = 128
TARGET_W     = 128
THRESHOLD    = 0.5

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATHS = {
    "densenet":     os.path.join(BASE_DIR, "model", "densenet_121.pth"),
    "resnet":       os.path.join(BASE_DIR, "model", "best_resnet3d.pth"),
    "efficientnet": os.path.join(BASE_DIR, "model", "best_efficientnet3d.pth"),
}

# ============================================================
# ResNet3D
# ============================================================
class ResBlock3D(nn.Module):
    def __init__(self, in_ch, out_ch, stride=1):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv3d(in_ch, out_ch, 3, stride=stride, padding=1, bias=False),
            nn.BatchNorm3d(out_ch), nn.ReLU(inplace=True),
            nn.Conv3d(out_ch, out_ch, 3, padding=1, bias=False),
            nn.BatchNorm3d(out_ch),
        )
        self.shortcut = nn.Sequential()
        if stride != 1 or in_ch != out_ch:
            self.shortcut = nn.Sequential(
                nn.Conv3d(in_ch, out_ch, 1, stride=stride, bias=False),
                nn.BatchNorm3d(out_ch),
            )
        self.relu = nn.ReLU(inplace=True)

    def forward(self, x):
        return self.relu(self.conv(x) + self.shortcut(x))


class ResNet3D(nn.Module):
    def __init__(self, num_classes=2):
        super().__init__()
        self.stem = nn.Sequential(
            nn.Conv3d(1, 32, 7, stride=2, padding=3, bias=False),
            nn.BatchNorm3d(32), nn.ReLU(inplace=True),
            nn.MaxPool3d(3, stride=2, padding=1),
        )
        self.layer1 = nn.Sequential(ResBlock3D(32, 64),            ResBlock3D(64, 64))
        self.layer2 = nn.Sequential(ResBlock3D(64, 128, stride=2), ResBlock3D(128, 128))
        self.layer3 = nn.Sequential(ResBlock3D(128, 256, stride=2),ResBlock3D(256, 256))
        self.pool   = nn.AdaptiveAvgPool3d(1)
        self.drop   = nn.Dropout(0.4)
        self.fc     = nn.Linear(256, num_classes)

    def forward(self, x):
        x = self.stem(x)
        x = self.layer1(x); x = self.layer2(x); x = self.layer3(x)
        return self.fc(self.drop(self.pool(x).flatten(1)))


# ============================================================
# EfficientNet3D
# ============================================================
class Swish(nn.Module):
    def forward(self, x): return x * torch.sigmoid(x)

class SEBlock3D(nn.Module):
    def __init__(self, ch, ratio=4):
        super().__init__()
        self.se = nn.Sequential(
            nn.AdaptiveAvgPool3d(1), nn.Flatten(),
            nn.Linear(ch, ch // ratio), Swish(),
            nn.Linear(ch // ratio, ch), nn.Sigmoid(),
        )
    def forward(self, x):
        return x * self.se(x).view(x.size(0), x.size(1), 1, 1, 1)

class MBConv3D(nn.Module):
    def __init__(self, in_ch, out_ch, expand=4, stride=1):
        super().__init__()
        mid = in_ch * expand
        self.use_res = (stride == 1 and in_ch == out_ch)
        self.conv = nn.Sequential(
            nn.Conv3d(in_ch, mid, 1, bias=False), nn.BatchNorm3d(mid), Swish(),
            nn.Conv3d(mid, mid, 3, stride=stride, padding=1, groups=mid, bias=False),
            nn.BatchNorm3d(mid), Swish(), SEBlock3D(mid),
            nn.Conv3d(mid, out_ch, 1, bias=False), nn.BatchNorm3d(out_ch),
        )
    def forward(self, x):
        out = self.conv(x)
        return out + x if self.use_res else out

class EfficientNet3D(nn.Module):
    def __init__(self, num_classes=2):
        super().__init__()
        self.stem = nn.Sequential(nn.Conv3d(1, 32, 3, stride=2, padding=1, bias=False), nn.BatchNorm3d(32), Swish())
        self.blocks = nn.Sequential(
            MBConv3D(32, 16, expand=1),
            MBConv3D(16, 24, expand=6, stride=2), MBConv3D(24, 24, expand=6),
            MBConv3D(24, 40, expand=6, stride=2), MBConv3D(40, 40, expand=6),
            MBConv3D(40, 80, expand=6, stride=2), MBConv3D(80, 80, expand=6),
            MBConv3D(80, 112, expand=6),
            MBConv3D(112, 192, expand=6, stride=2), MBConv3D(192, 192, expand=6),
            MBConv3D(192, 320, expand=6),
        )
        self.head = nn.Sequential(
            nn.Conv3d(320, 512, 1, bias=False), nn.BatchNorm3d(512), Swish(),
            nn.AdaptiveAvgPool3d(1), nn.Flatten(), nn.Dropout(0.4), nn.Linear(512, num_classes),
        )
    def forward(self, x):
        return self.head(self.blocks(self.stem(x)))


# ============================================================
# Model registry
# ============================================================
_models = {}

def get_model(name):
    if name not in _models:
        if name == "densenet":
            m = DenseNet121(spatial_dims=3, in_channels=1, out_channels=2)
        elif name == "resnet":
            m = ResNet3D(num_classes=2)
        elif name == "efficientnet":
            m = EfficientNet3D(num_classes=2)
        else:
            raise ValueError(f"Unknown model: {name}")
        m.load_state_dict(torch.load(MODEL_PATHS[name], map_location=DEVICE))
        m.to(DEVICE)
        m.eval()
        _models[name] = m
    return _models[name]


# ============================================================
# Volume loading & preprocessing
# ============================================================
def load_volume(patient_dir):
    files = []
    for root, _, fs in os.walk(patient_dir):
        for f in fs:
            if f.lower().endswith(".dcm"):
                files.append(os.path.join(root, f))
    if not files:
        raise ValueError("No DICOM files found.")

    slices = [pydicom.dcmread(f) for f in files]
    slices.sort(key=lambda x: float(x.ImagePositionPatient[2])
        if "ImagePositionPatient" in x else int(getattr(x, "InstanceNumber", 0)))

    images = []
    for s in slices:
        img = s.pixel_array.astype(np.float32)
        img = img * getattr(s, "RescaleSlope", 1) + getattr(s, "RescaleIntercept", 0)
        img = np.clip(img, -1000, 1000)
        img = (img + 1000) / 2000
        images.append(img)

    return np.stack(images), len(images)


def preprocess_volume(volume):
    D = volume.shape[0]
    if D >= 32:
        start = (D - 32) // 2
        volume = volume[start:start + 32]
    else:
        pad = 32 - D
        volume = np.pad(volume, ((pad//2, pad - pad//2), (0,0), (0,0)), mode='edge')

    volume = zoom(volume, (TARGET_DEPTH / 32, 1.0, 1.0), order=1)

    out = np.zeros((TARGET_DEPTH, TARGET_H, TARGET_W), dtype=np.float32)
    for i in range(TARGET_DEPTH):
        out[i] = cv2.resize(volume[i], (TARGET_W, TARGET_H), interpolation=cv2.INTER_LINEAR)

    out = (out - out.mean()) / (out.std() + 1e-6)
    return out


# ============================================================
# Single model prediction
# ============================================================
def predict_single(x_tensor, model_name):
    model = get_model(model_name)
    with torch.no_grad():
        probs       = torch.softmax(model(x_tensor), dim=1)
        cancer_prob = probs[0, 1].item()
    return cancer_prob


# ============================================================
# Main detect function
# ============================================================
def detect_patient(patient_dir, model_names=None):
    if model_names is None:
        model_names = ["densenet"]

    volume, total_slices = load_volume(patient_dir)
    volume = preprocess_volume(volume)
    x = torch.tensor(volume).unsqueeze(0).unsqueeze(0).to(DEVICE)

    results = {}
    cancer_probs = []

    for name in model_names:
        cp = predict_single(x, name)
        cancer_probs.append(cp)
        pred = "Cancerous" if cp >= THRESHOLD else "Non-Cancerous"
        conf = cp if cp >= THRESHOLD else (1 - cp)
        results[name] = {
            "prediction": pred,
            "confidence": round(conf, 4),
            "cancer_prob": round(cp, 4),
        }

    # Ensemble — average probabilities
    avg_prob   = sum(cancer_probs) / len(cancer_probs)
    ensemble_pred = "Cancerous" if avg_prob >= THRESHOLD else "Non-Cancerous"
    ensemble_conf = avg_prob if avg_prob >= THRESHOLD else (1 - avg_prob)

    return {
        "models":          results,
        "ensemble":        len(model_names) > 1,
        "prediction":      ensemble_pred,
        "confidence":      round(ensemble_conf, 4),
        "top_probs":       [round(ensemble_conf, 4)],
        "total_slices":    total_slices,
        "cancer_slices":   1 if avg_prob >= THRESHOLD else 0,
        "threshold":       THRESHOLD,
        "models_used":     model_names,
    }
