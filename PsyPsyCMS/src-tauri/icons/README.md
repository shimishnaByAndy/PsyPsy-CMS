# App Icons

Place your application icons in this directory with the following naming convention:

- `32x32.png` - 32x32 pixels icon
- `128x128.png` - 128x128 pixels icon
- `128x128@2x.png` - 256x256 pixels icon (for Retina displays)
- `icon.icns` - macOS icon file
- `icon.ico` - Windows icon file
- `icon.png` - Linux icon file (512x512 recommended)

You can generate these icons from a single high-resolution image using the Tauri CLI:

```bash
npm run tauri icon path/to/your/icon.png
```

This will automatically generate all required icon sizes and formats.