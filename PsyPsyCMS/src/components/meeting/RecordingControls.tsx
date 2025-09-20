'use client';

import { invoke } from '@tauri-apps/api/core';
import { appDataDir } from '@tauri-apps/api/path';
import { useCallback, useEffect, useState } from 'react';
import { Play, Pause, Square, Mic, RotateCcw } from 'lucide-react';
import { ProcessRequest, SummaryResponse } from '@/types/meeting';
import { listen } from '@tauri-apps/api/event';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface RecordingControlsProps {
  isRecording: boolean;
  barHeights: string[];
  onRecordingStop: (callApi?: boolean) => void;
  onRecordingStart: () => void;
  onTranscriptReceived: (summary: SummaryResponse) => void;
  onTranscriptionError?: (message: string) => void;
  isRecordingDisabled: boolean;
}

export const RecordingControls: React.FC<RecordingControlsProps> = ({
  isRecording,
  barHeights,
  onRecordingStop,
  onRecordingStart,
  onTranscriptReceived,
  onTranscriptionError,
  isRecordingDisabled,
}) => {
  const [showPlayback, setShowPlayback] = useState(false);
  const [recordingPath, setRecordingPath] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const MIN_RECORDING_DURATION = 2000; // 2 seconds minimum recording time
  const [transcriptionErrors, setTranscriptionErrors] = useState(0);

  // Playback state
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const checkTauri = async () => {
      try {
        const result = await invoke('is_recording');
        console.log('Tauri is initialized and ready, is_recording result:', result);
      } catch (error) {
        console.error('Tauri initialization error:', error);
        alert('Failed to initialize recording. Please check the console for details.');
      }
    };
    checkTauri();
  }, []);

  const handleStartRecording = useCallback(async () => {
    if (isStarting) return;
    console.log('Starting recording...');
    setIsStarting(true);
    setShowPlayback(false);
    setTranscript(''); // Clear any previous transcript
    setRecordingPath(null); // Clear previous recording path
    setTranscriptionErrors(0); // Reset error count

    try {
      await invoke('start_recording');
      setRecordingStartTime(Date.now()); // Track recording start time
      console.log('Recording started successfully');
      setIsProcessing(false);
      onRecordingStart();
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to start recording. Please check the console for details.');
    } finally {
      setIsStarting(false);
    }
  }, [onRecordingStart, isStarting]);

  const stopRecordingAction = useCallback(async () => {
    console.log('Executing stop recording...');
    try {
      setIsProcessing(true);
      const dataDir = await appDataDir();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const savePath = `${dataDir}/recording-${timestamp}.wav`;

      console.log('Saving recording to:', savePath);
      const result = await invoke('stop_recording', {
        args: {
          save_path: savePath
        }
      });

      setRecordingPath(savePath);
      setIsProcessing(false);

      // Initialize audio for playback
      if (savePath) {
        const audio = new Audio();
        audio.src = `file://${savePath}`;
        audio.addEventListener('loadedmetadata', () => {
          setDuration(audio.duration);
        });
        audio.addEventListener('timeupdate', () => {
          setCurrentTime(audio.currentTime);
          setProgress((audio.currentTime / audio.duration) * 100);
        });
        audio.addEventListener('ended', () => {
          setIsPlaying(false);
          setCurrentTime(0);
          setProgress(0);
        });
        setAudioElement(audio);
        setShowPlayback(true);
      }

      onRecordingStop(true);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
        if (error.message.includes('No recording in progress')) {
          return;
        }
      } else if (typeof error === 'string' && error.includes('No recording in progress')) {
        return;
      } else if (error && typeof error === 'object' && 'toString' in error) {
        if (error.toString().includes('No recording in progress')) {
          return;
        }
      }
      setIsProcessing(false);
      onRecordingStop(false);
    } finally {
      setIsStopping(false);
    }
  }, [onRecordingStop]);

  const handleStopRecording = useCallback(async () => {
    if (!isRecording || isStarting || isStopping) return;

    // Check minimum recording duration
    if (recordingStartTime) {
      const recordingDuration = Date.now() - recordingStartTime;
      if (recordingDuration < MIN_RECORDING_DURATION) {
        console.warn(`Recording too short: ${recordingDuration}ms (minimum: ${MIN_RECORDING_DURATION}ms)`);
        alert(`Recording must be at least ${MIN_RECORDING_DURATION / 1000} seconds long.`);
        return;
      }
    }

    console.log('Stopping recording...');
    setIsStopping(true);

    // Immediately trigger the stop action
    await stopRecordingAction();
  }, [isRecording, isStarting, isStopping, stopRecordingAction, recordingStartTime, MIN_RECORDING_DURATION]);

  const handlePlayPause = useCallback(() => {
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
    } else {
      audioElement.play().catch(console.error);
      setIsPlaying(true);
    }
  }, [audioElement, isPlaying]);

  const handleRestart = useCallback(() => {
    if (!audioElement) return;

    audioElement.currentTime = 0;
    setCurrentTime(0);
    setProgress(0);
    if (isPlaying) {
      audioElement.play().catch(console.error);
    }
  }, [audioElement, isPlaying]);

  const handleProgressClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!audioElement || !duration) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    audioElement.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(percentage * 100);
  }, [audioElement, duration]);

  // Audio element cleanup
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
        audioElement.load();
      }
    };
  }, [audioElement]);

  useEffect(() => {
    console.log('Setting up transcript-error event listener');
    let unsubscribe: (() => void) | undefined;

    const setupListener = async () => {
      try {
        unsubscribe = await listen('transcript-error', (event) => {
          console.log('transcript-error event received:', event);
          console.error('Transcription error received:', event.payload);
          const errorMessage = event.payload as string;

          setTranscriptionErrors(prev => {
            const newCount = prev + 1;
            console.log('Transcription error count incremented:', newCount);
            return newCount;
          });
          setIsProcessing(false);
          console.log('Calling onRecordingStop(false) due to transcript error');
          onRecordingStop(false);
          if (onTranscriptionError) {
            onTranscriptionError(errorMessage);
          }
        });
        console.log('transcript-error event listener set up successfully');
      } catch (error) {
        console.error('Failed to set up transcript-error event listener:', error);
      }
    };

    setupListener();

    return () => {
      console.log('Cleaning up transcript-error event listener');
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []); // Include dependencies

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2 bg-white rounded-full shadow-lg px-4 py-2">
        {isProcessing ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
            <span className="text-sm text-gray-600">Processing recording...</span>
          </div>
        ) : (
          <>
            {showPlayback ? (
              <>
                <button
                  onClick={handleStartRecording}
                  className="w-10 h-10 flex items-center justify-center bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                >
                  <Mic size={16} />
                </button>

                <div className="w-px h-6 bg-gray-200 mx-1" />

                <div className="flex items-center space-x-1 mx-2">
                  <div className="text-sm text-gray-600 min-w-[40px]">
                    {formatTime(currentTime)}
                  </div>
                  <div
                    className="relative w-24 h-1 bg-gray-200 rounded-full cursor-pointer"
                    onClick={handleProgressClick}
                  >
                    <div
                      className="absolute h-full bg-blue-500 rounded-full pointer-events-none"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 min-w-[40px]">
                    {formatTime(duration)}
                  </div>
                </div>

                <button
                  onClick={handlePlayPause}
                  className="w-10 h-10 flex items-center justify-center bg-blue-500 hover:bg-blue-600 rounded-full text-white transition-colors"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>

                <button
                  onClick={handleRestart}
                  className="w-8 h-8 flex items-center justify-center bg-gray-400 hover:bg-gray-500 rounded-full text-white transition-colors"
                >
                  <RotateCcw size={12} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    if (isRecording) {
                      handleStopRecording();
                    } else {
                      handleStartRecording();
                    }
                  }}
                  disabled={isStarting || isProcessing || isStopping || isRecordingDisabled}
                  className={`w-12 h-12 flex items-center justify-center ${
                    isStarting || isProcessing || isStopping ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'
                  } rounded-full text-white transition-colors relative`}

                >
                  {isRecording ? (
                    <>
                      <Square size={20} />
                      {isStopping && (
                        <div className="absolute -top-8 text-gray-600 font-medium text-sm">
                          Stopping...
                        </div>
                      )}
                    </>
                  ) : (
                    <Mic size={20} />
                  )}
                </button>

                {/* Transcription Error Counter */}
                {transcriptionErrors > 0 && (
                  <div className="flex items-center space-x-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                    <span>⚠️ {transcriptionErrors} error{transcriptionErrors > 1 ? 's' : ''}</span>
                  </div>
                )}

                <div className="flex items-center space-x-1 mx-4">
                  {barHeights.map((height, index) => (
                    <div
                      key={index}
                      className="w-1 bg-red-500 rounded-full transition-all duration-200"
                      style={{
                        height: isRecording ? height : '4px',
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};