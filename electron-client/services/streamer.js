const { desktopCapturer } = require('electron');

async function captureScreen() {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1920, height: 1080 }
    });

    if (sources.length === 0) return null;

    // Grab the primary screen (first source)
    const primarySource = sources[0];
    const image = primarySource.thumbnail; // NativeImage object

    return {
      highRes: image.toJPEG(90),           // Buffer
      lowRes: image.resize({ width: 800 }).toJPEG(50).toString('base64'), // Base64 String
      timestamp: new Date()
    };
  } catch (error) {
    console.error("Screen Capture Error:", error);
    return null;
  }
}

module.exports = { captureScreen };
