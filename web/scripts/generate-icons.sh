#!/bin/bash

# Script to generate PNG icons from SVG placeholders
# Requires ImageMagick or similar tool

echo "🎨 Generating PNG icons from SVG placeholders..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found. Please install it:"
    echo "   macOS: brew install imagemagick"
    echo "   Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "   Or use an online SVG to PNG converter"
    exit 1
fi

cd "$(dirname "$0")/../public" || exit

# Generate icons
echo "Generating icon-192.png..."
convert -background none -density 300 icon-192.png -resize 192x192 icon-192-temp.png
mv icon-192-temp.png icon-192.png

echo "Generating icon-512.png..."
convert -background none -density 300 icon-512.png -resize 512x512 icon-512-temp.png
mv icon-512-temp.png icon-512.png

echo "Generating apple-touch-icon.png..."
convert -background none -density 300 apple-touch-icon.png -resize 180x180 apple-touch-icon-temp.png
mv apple-touch-icon-temp.png apple-touch-icon.png

echo "Generating og-image.png..."
convert -background none -density 300 og-image.png -resize 1200x630 og-image-temp.png
mv og-image-temp.png og-image.png

echo "Generating twitter-card.png..."
convert -background none -density 300 twitter-card.png -resize 1200x600 twitter-card-temp.png
mv twitter-card-temp.png twitter-card.png

echo "✅ All icons generated successfully!"
echo ""
echo "📝 Note: These are basic conversions. For production, consider:"
echo "   - Using a professional design tool (Figma, Adobe XD)"
echo "   - Optimizing with tools like pngquant or oxipng"
echo "   - Creating high-quality source files"

