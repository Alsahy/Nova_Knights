#!/usr/bin/env python3
"""
Nova's tutorial voice (D-067): one small MP3 per tutorial step in public/audio/nova/.

Browser text-to-speech was silent on some PCs and poor on others, so the game plays these clips instead and
only falls back to the browser's voice when a clip is missing.

Made with Piper (open-source neural text-to-speech, MIT licence, github.com/OHF-Voice/piper1-gpl for 1.x) and the
voice "en_US-ljspeech-high", trained on the LJ Speech dataset, which is in the public domain. It is a computer
voice, not a recorded person. ffmpeg turns the result into MP3.

Run (Piper and the voice file live outside the repo; they are large):
    pip install --target /some/dir piper-tts
    curl -LO https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ljspeech/high/en_US-ljspeech-high.onnx
    curl -LO https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ljspeech/high/en_US-ljspeech-high.onnx.json
    PYTHONPATH=/some/dir python3 scripts/make-voice.py /path/to/en_US-ljspeech-high.onnx

To use a different voice (a person, another engine), save the same lines under the same file names: nothing
else in the game has to change. Keep the lines below in step with copy.coach.steps in src/content/copy.ts
(tests/ui/live.test.ts checks that every step has its file).
"""
import os
import subprocess
import sys
import wave

from piper import PiperVoice

# Written the way they should be SAID (numbers and signs spelled out).
LINES = {
    "welcome": "Hi, Mission Leader! I'm Nova. Our goal: send twenty stars to Earth in seven days.",
    "welcomeSurvival": "Hi, Mission Leader! I'm Nova. Survival: last as many days as you can. Alarms get faster!",
    "base": "Keep these up: oxygen, power, shield. We breathe oxygen every day, and storms wear the shield.",
    "badge": "Keep this low: radiation. If it turns red, at seven, you cannot win. Storms and trips outside raise it.",
    "crew": "Our energy, food and water. Jobs use energy. No food or water means no energy.",
    "tools": "Alarm! Each tool costs something, in red, and gives something, in green. Pick one!",
    "mini": "Win the mini-game, fast!",
    "jobs": "Pick a job for each of us. Lab work gives stars. Rest gives energy.",
    "start": "Now press: Start the day!",
    "night": "Night uses food and water. The next alarm has a timer. Good luck!",
}

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "audio", "nova")
voice = PiperVoice.load(sys.argv[1])
os.makedirs(OUT, exist_ok=True)
for key, text in LINES.items():
    wav_path = os.path.join(OUT, key + ".wav")
    with wave.open(wav_path, "wb") as w:
        voice.synthesize_wav(text, w)
    with wave.open(wav_path) as w:
        seconds = w.getnframes() / w.getframerate()
    mp3 = os.path.join(OUT, key + ".mp3")
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", wav_path, "-ac", "1", "-b:a", "48k", mp3], check=True
    )
    os.remove(wav_path)
    print(f"{key}: {seconds:.1f} s, {os.path.getsize(mp3) // 1024} KB")
