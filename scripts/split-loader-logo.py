"""One-off lossless emblem split. Requires Pillow and numpy. Run from repo root."""
from pathlib import Path
import json
import numpy as np
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
source = Image.open(root / 'public/MHOMES-logo.png').convert('RGBA')
scale = 8 if max(source.size) < 256 else 1
if scale > 1:
    source = source.resize((source.width * scale, source.height * scale), Image.Resampling.LANCZOS)
pixels = np.array(source)
foreground = pixels[:, :, 3] > 0
seen = np.zeros(foreground.shape, dtype=bool)
components = []
# Eight-connected components on the original alpha channel, without thresholding colors.
for y, x in zip(*np.nonzero(foreground)):
    if seen[y, x]:
        continue
    stack = [(int(y), int(x))]
    seen[y, x] = True
    count, x0, y0, x1, y1 = 0, int(x), int(y), int(x), int(y)
    while stack:
        cy, cx = stack.pop()
        count += 1
        x0, y0, x1, y1 = min(x0, cx), min(y0, cy), max(x1, cx), max(y1, cy)
        for dy, dx in ((0,1),(0,-1),(1,0),(-1,0),(1,1),(1,-1),(-1,1),(-1,-1)):
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < source.height and 0 <= nx < source.width and foreground[ny,nx] and not seen[ny,nx]:
                seen[ny,nx] = True
                stack.append((ny,nx))
    if count > 100 * scale:
        components.append({'pixels': count, 'bbox': [x0,y0,x1+1,y1+1]})
components.sort(key=lambda c: (c['bbox'][1], c['bbox'][0]))
# This source's emblem is a single connected component; the lettering starts at y=432.
# Manual boundaries pass through the gaps between the three stacked gold sections.
box = (542,142,1000,424)
x0,y0,x1,y1 = [v * scale for v in box]
roi = np.zeros(foreground.shape, dtype=bool)
roi[y0:y1,x0:x1] = True

def polygon(points):
    mask = Image.new('1', source.size)
    ImageDraw.Draw(mask).polygon([(x*scale,y*scale) for x,y in points], fill=1)
    return np.array(mask, dtype=bool)

top = polygon([(530,130),(1010,130),(1010,268),(812,268),(770,310),(728,268),(530,268)]) & roi
left = polygon([(530,357),(665,357),(689,327),(763,424),(530,424)]) & roi & ~top
right = polygon([(779,424),(850,327),(875,357),(1010,357),(1010,430)]) & roi & ~top & ~left
middle = roi & ~top & ~left & ~right
out = root / 'public/loader'
out.mkdir(exist_ok=True)
composite = Image.new('RGBA', source.size)
for name, mask in [('m-top',top),('m-mid',middle),('m-left',left),('m-right',right)]:
    layer = np.zeros_like(pixels)
    layer[mask] = pixels[mask]
    image = Image.fromarray(layer)
    image.save(out / (name + '.png'))
    composite = Image.alpha_composite(composite, image)
# Transparent pixels' hidden RGB does not affect rendering; canonicalize both to zero.
reference = np.zeros_like(pixels)
reference[roi] = pixels[roi]
reference[reference[:,:,3] == 0] = 0
actual = np.array(composite)
actual[actual[:,:,3] == 0] = 0
diff = np.abs(actual.astype(np.int16) - reference.astype(np.int16))
full = pixels.copy()
full[full[:,:,3] == 0] = 0
report = {'source_size': list(source.size), 'emblem_bbox': [x0,y0,x1,y1], 'method': 'alpha connected components; manual regions because the emblem pieces touch', 'components': components, 'emblem_different_pixels': int(np.count_nonzero(np.any(diff,axis=2))), 'emblem_max_channel_difference': int(diff.max()), 'full_source_different_pixels': int(np.count_nonzero(np.any(actual != full,axis=2))), 'note': 'Full-source differences are the intentionally excluded lettering and stray pixels outside the emblem. Zero-alpha hidden RGB is ignored.'}
(out / 'verification.json').write_text(json.dumps(report, indent=2))
composite.save(out / 'emblem-composite.png')
assert report['emblem_different_pixels'] == 0
print(json.dumps({k:v for k,v in report.items() if k != 'components'},indent=2))
