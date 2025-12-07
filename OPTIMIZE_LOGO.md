# Optimize Logo File - Quick Guide

## Problem
Your logo file is 798x313 pixels but displayed at 428x168 pixels, wasting 32.6 KiB.

## Solution: Resize the Logo

### Option 1: Online Tool (Easiest - 2 minutes)

1. **Go to**: https://squoosh.app
2. **Upload**: `/public/logos/logo_light.png`
3. **Resize**:
   - Width: 428
   - Height: 168
   - Method: Lanczos3
4. **Compress**:
   - Format: PNG
   - Quality: 85
5. **Download** and replace the file

### Option 2: Using ImageMagick (Command Line)

```bash
# Install ImageMagick first
# Then run:
magick /public/logos/logo_light.png -resize 428x168 /public/logos/logo_light_optimized.png
```

### Option 3: Photoshop/GIMP

1. Open `/public/logos/logo_light.png`
2. Image → Image Size
3. Set to 428x168 pixels
4. Export as PNG with 85% quality
5. Replace original file

## Expected Results

- **Before**: 214.9 KiB (798x313)
- **After**: ~15-20 KiB (428x168)
- **Savings**: ~195 KiB (90% reduction)

## After Optimization

1. Replace the file in `/public/logos/logo_light.png`
2. Clear browser cache (Ctrl+Shift+R)
3. Rebuild: `npm run build`
4. Redeploy to Vercel

## Verify

Run Lighthouse again - image size should drop from 45.8 KiB to ~15 KiB!
