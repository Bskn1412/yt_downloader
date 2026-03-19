# YT Downloader - Advanced Features

## Overview
An advanced YouTube video downloader with FFmpeg integration, audio mixing, MP3 conversion, and modern UI with glowing animations.

---

## Core Features

### 1. **Three Download Modes**

#### Video + Audio Tab
- Downloads videos with embedded audio
- Best quality combined formats
- Supports multiple resolutions (1080p, 720p, 480p, etc.)
- Direct download without additional processing

#### Video Only Tab
- Download video without audio
- Quality-based color badges (4K, 1440p, 1080p, 720p, 480p, Low)
- FFmpeg-powered audio mixing: Automatically combines best available audio
- Dropdown selector to choose specific audio track
- Audio and video merged seamlessly using FFmpeg

#### Audio Tab
- Extract audio from videos
- Sort by bitrate (highest first)
- **MP3 Conversion**: One-click conversion to MP3 format
- Original formats also available (M4A, OPUS, etc.)

---

## Advanced Technical Features

### FFmpeg Integration
- **Audio-Video Merging**: Uses FFmpeg to combine video-only formats with best audio
- **Audio Codec Handling**: Automatic codec conversion (AAC, MP3)
- **Format Conversion**: Real-time MP3 conversion from any audio source
- **Quality Preservation**: Maintains original quality while combining streams

### Backend Processing
- Temporary file management in system temp directory
- Automatic cleanup after download completion
- Graceful error handling and logging
- Process-based encoding (no blocking operations)

---

## API Endpoints

### `/api/formats` (POST)
Fetches all available formats for a YouTube video.

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=..."
}
```

**Response:**
```json
{
  "metadata": {
    "title": "Video Title",
    "thumbnail": "https://...",
    "duration": 300,
    "channel": "Channel Name",
    "views": 1000000
  },
  "formats": {
    "video": [...],      // Video + Audio formats
    "videoOnly": [...],  // Video only formats
    "audio": [...]       // Audio only formats
  }
}
```

### `/api/download` (POST)
Downloads video with optional FFmpeg processing.

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=...",
  "formatId": "18",
  "audioFormatId": "251",    // Optional for audio mixing
  "includeAudio": true,      // Optional
  "convertToMp3": false,     // Optional
  "title": "Video Title"
}
```

### `/api/convert-mp3` (POST)
Converts audio to MP3 format.

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=...",
  "audioFormatId": "251",
  "title": "Video Title"
}
```

---

## UI/UX Features

### Glowing Animations
- Animated background orbs with floating effects
- Gradient text animations on title
- Glowing pulse effects on buttons
- Smooth hover transitions
- Cyberpunk-inspired visual design

### Download Modal
- Video thumbnail and metadata display
- Real-time progress bar with glow effects
- Audio selection dropdown for video-only downloads
- MP3 conversion checkbox for audio downloads
- Completion state with animated checkmark
- Auto-close after download starts

### Format Organization
- Tab-based interface for different format types
- Format count badges on tabs
- Quality indicators with color coding
- File size display in MB
- Bitrate information for audio files

---

## Format Badges & Colors

| Badge | Color | Use Case |
|-------|-------|----------|
| 4K | Gold | 2160p+ video |
| 1440p | Pink | 1440p video |
| 1080p | Cyan | 1080p video |
| 720p | Green | 720p video |
| 480p | Orange | 480p video |
| Low | Purple | <480p video |
| Audio | Blue | Audio only |

---

## Browser Download Integration
- Automatic browser download on 100% progress
- File naming with timestamp
- Proper MIME types for each format
- Automatic cleanup of temporary files
- Error recovery and user notifications

---

## Technical Stack

### Frontend
- React 18+ with TypeScript
- CSS3 animations and gradients
- Real-time progress tracking
- Modal state management

### Backend
- Node.js with Express
- yt-dlp for video extraction
- FFmpeg for audio/video processing
- Temporary file management

### Dependencies
- yt-dlp binary (included)
- FFmpeg binary (included)
- FFprobe binary (included)

---

## Performance Optimizations

1. **Streaming Downloads**: Direct stream to browser, no RAM buffering
2. **Temp File Cleanup**: Automatic deletion of temporary files
3. **Parallel Processing**: Multiple format downloads possible
4. **Progress Estimation**: Realistic progress updates during encoding
5. **Error Handling**: Graceful fallbacks and user feedback

---

## Limitations & Notes

1. **FFmpeg Processing**: Audio mixing takes time proportional to video length
2. **File Size**: Large videos may take longer to process
3. **Format Availability**: Depends on YouTube source material
4. **Regional Restrictions**: Subject to YouTube's availability
5. **Rate Limiting**: Respect YouTube's terms of service

---

## Usage Examples

### Download 1080p Video with Best Audio
1. Paste YouTube URL
2. Click "Fetch"
3. Go to "Video Only" tab
4. Select 1080p format
5. Check "Add Best Audio" in modal
6. Click "Initialize Download"

### Extract Audio as MP3
1. Paste YouTube URL
2. Click "Fetch"
3. Go to "Audio" tab
4. Select highest bitrate audio
5. Check "Convert to MP3" in modal
6. Click "Initialize Download"

### Download Video + Audio Combined
1. Paste YouTube URL
2. Click "Fetch"
3. Go to "Video + Audio" tab
4. Select desired quality
5. Click download button
6. Confirm in modal

---

## Future Enhancements

- [ ] Batch download support
- [ ] Custom codec selection
- [ ] Video trimming/cutting
- [ ] Playlist download
- [ ] Download history
- [ ] Format presets
- [ ] Watermark removal (ethical use only)
- [ ] Subtitle extraction
