// src/audio/mod.rs
pub mod core;
pub mod audio_processing;
pub mod encode;
pub mod ffmpeg;

// Only export actually used components to reduce warnings
pub use core::{
    default_input_device,
    AudioDevice, AudioStream,
};

// Unused exports commented out to reduce warnings:
// default_output_device, get_device_and_config, list_audio_devices,
// parse_audio_device, trigger_audio_permission,
// AudioTranscriptionEngine, DeviceControl, DeviceType,
// LAST_AUDIO_CAPTURE, encode_single_audio, AudioInput