import { useMemo, useEffect, useState, useCallback } from 'react';
import {
  DefaultMeetingSession,
  // MeetingSessionStatus,
} from 'amazon-chime-sdk-js';
import { useChimeDevices } from '@chime/devices';
// import { toast } from 'react-toastify';

type useChimeAudioProps = {
  meetingSession: DefaultMeetingSession;
  audioRef: React.RefObject<HTMLAudioElement>;
};

export const useChimeAudio = ({
  meetingSession,
  audioRef,
}: useChimeAudioProps) => {
  const [isAudioInputInitialized, setIsAudioInputInitialized] = useState(false);
  const { currentAudioInputDeviceId } = useChimeDevices();
  const [isSharingAudio, setIsSharingAudio] = useState(true);

  const toggleAudio = useCallback(() => {
    const muted = meetingSession.audioVideo.realtimeIsLocalAudioMuted();
    if (muted) {
      meetingSession.audioVideo.realtimeUnmuteLocalAudio();
    } else {
      meetingSession.audioVideo.realtimeMuteLocalAudio();
    }
  }, [meetingSession.audioVideo]);

  // listen for local mute changes and update state
  useEffect(() => {
    const handler = (muted: boolean) => {
      setIsSharingAudio(!muted);
    };
    meetingSession.audioVideo.realtimeSubscribeToMuteAndUnmuteLocalAudio(
      handler
    );
    return () => {
      meetingSession.audioVideo.realtimeUnsubscribeToMuteAndUnmuteLocalAudio(
        handler
      );
    };
  }, [meetingSession.audioVideo]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) {
      return;
    }

    const observer = {
      // audioVideoDidStart: () => {
      //   // console.log('Started');
      // },
      // audioVideoDidStop: (sessionStatus: MeetingSessionStatus) => {
      //   // See the "Stopping a session" section for details.
      //   // console.log(
      //   //   'Stopped with a session status code: ',
      //   //   sessionStatus.statusCode()
      //   // );
      // },
      // audioVideoDidStartConnecting: (reconnecting: boolean) => {
      //   if (reconnecting) {
      //     // e.g. the WiFi connection is dropped.
      //     // console.log('Attempting to reconnect');
      //   }
      // },
    };

    const asyncFn = async () => {
      meetingSession.audioVideo.bindAudioElement(audioElement);
      meetingSession.audioVideo.addObserver(observer);
      try {
        await meetingSession.audioVideo.chooseAudioInputDevice(
          currentAudioInputDeviceId
        );
        setIsAudioInputInitialized(true);
        if (!isSharingAudio) {
          meetingSession.audioVideo.realtimeMuteLocalAudio();
        }
      } catch (err) {
        // handle error - unable to acquire audio device perhaps due to permissions blocking
        // toast('Unable to connect to microphone', { type: 'error' });
      }
    };

    asyncFn();

    return () => {
      setIsAudioInputInitialized(false);
      meetingSession.audioVideo.unbindAudioElement();
      meetingSession.audioVideo.removeObserver(observer);
    };
  }, [audioRef, currentAudioInputDeviceId, isSharingAudio, meetingSession]);

  const result = useMemo(
    () => ({
      isSharingAudio,
      toggleAudio,
      isAudioInputInitialized,
    }),
    [isSharingAudio, toggleAudio, isAudioInputInitialized]
  );

  return result;
};
