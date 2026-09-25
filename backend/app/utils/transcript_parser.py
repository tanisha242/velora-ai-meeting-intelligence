import re
import json
from typing import List, Dict, Any

class TranscriptParser:
    @staticmethod
    def timestamp_to_seconds(ts_str: str) -> float:
        """Converts timestamp string like '00:12', '01:23.500' or '01:12:30' to float seconds."""
        ts_str = ts_str.strip()
        parts = ts_str.split(":")
        try:
            if len(parts) == 3:
                h, m, s = float(parts[0]), float(parts[1]), float(parts[2])
                return h * 3600 + m * 60 + s
            elif len(parts) == 2:
                m, s = float(parts[0]), float(parts[1])
                return m * 60 + s
            elif len(parts) == 1:
                return float(parts[0])
        except ValueError:
            return 0.0
        return 0.0

    @classmethod
    def parse_txt(cls, content: str) -> List[Dict[str, Any]]:
        """
        Parses text transcripts.
        Supports patterns:
        - [00:12] Speaker Name: Spoken text...
        - [00:00 - 00:15] Speaker Name: Spoken text...
        - Speaker Name: Spoken text...
        """
        lines = content.strip().split("\n")
        segments = []
        current_time = 0.0
        seq = 0

        # Pattern 1: [00:12 - 00:18] Speaker: Text
        pattern_range = re.compile(r"^\[(\d+:\d+(?:\.\d+)?)\s*-\s*(\d+:\d+(?:\.\d+)?)\]\s*([^:]+):\s*(.*)$")
        # Pattern 2: [00:12] Speaker: Text
        pattern_single = re.compile(r"^\[(\d+:\d+(?:\.\d+)?)\]\s*([^:]+):\s*(.*)$")
        # Pattern 3: Speaker: Text
        pattern_no_time = re.compile(r"^([^:]+):\s*(.*)$")

        for line in lines:
            line = line.strip()
            if not line:
                continue

            m_range = pattern_range.match(line)
            if m_range:
                start_str, end_str, speaker, text = m_range.groups()
                start_time = cls.timestamp_to_seconds(start_str)
                end_time = cls.timestamp_to_seconds(end_str)
                current_time = end_time
                segments.append({
                    "speaker_name": speaker.strip(),
                    "start_time": start_time,
                    "end_time": end_time,
                    "text": text.strip(),
                    "sequence": seq
                })
                seq += 1
                continue

            m_single = pattern_single.match(line)
            if m_single:
                time_str, speaker, text = m_single.groups()
                start_time = cls.timestamp_to_seconds(time_str)
                end_time = start_time + 5.0
                current_time = end_time
                segments.append({
                    "speaker_name": speaker.strip(),
                    "start_time": start_time,
                    "end_time": end_time,
                    "text": text.strip(),
                    "sequence": seq
                })
                seq += 1
                continue

            m_no_time = pattern_no_time.match(line)
            if m_no_time:
                speaker, text = m_no_time.groups()
                start_time = current_time
                end_time = start_time + 6.0
                current_time = end_time
                segments.append({
                    "speaker_name": speaker.strip(),
                    "start_time": start_time,
                    "end_time": end_time,
                    "text": text.strip(),
                    "sequence": seq
                })
                seq += 1

        return segments

    @classmethod
    def parse_vtt(cls, content: str) -> List[Dict[str, Any]]:
        """Parses WebVTT format content."""
        lines = content.strip().split("\n")
        segments = []
        seq = 0
        i = 0
        vtt_time_pattern = re.compile(r"(\d{2}:\d{2}:\d{2}\.\d{3}|\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3}|\d{2}:\d{2}\.\d{3})")

        while i < len(lines):
            line = lines[i].strip()
            time_match = vtt_time_pattern.search(line)
            if time_match:
                start_str, end_str = time_match.groups()
                start_time = cls.timestamp_to_seconds(start_str)
                end_time = cls.timestamp_to_seconds(end_str)

                i += 1
                text_lines = []
                while i < len(lines) and lines[i].strip() and not vtt_time_pattern.search(lines[i]):
                    text_lines.append(lines[i].strip())
                    i += 1
                
                full_text = " ".join(text_lines)
                speaker = "Speaker"
                if ":" in full_text:
                    parts = full_text.split(":", 1)
                    speaker = parts[0].strip()
                    full_text = parts[1].strip()

                segments.append({
                    "speaker_name": speaker,
                    "start_time": start_time,
                    "end_time": end_time,
                    "text": full_text,
                    "sequence": seq
                })
                seq += 1
            else:
                i += 1

        return segments

    @classmethod
    def parse_json(cls, content: str) -> List[Dict[str, Any]]:
        """Parses JSON array transcript."""
        data = json.loads(content)
        segments = []
        if isinstance(data, dict) and "segments" in data:
            data = data["segments"]
        
        for seq, item in enumerate(data):
            speaker = item.get("speaker_name") or item.get("speaker") or "Speaker"
            start = float(item.get("start_time") or item.get("start") or 0.0)
            end = float(item.get("end_time") or item.get("end") or start + 5.0)
            text = item.get("text", "").strip()
            segments.append({
                "speaker_name": speaker,
                "start_time": start,
                "end_time": end,
                "text": text,
                "sequence": seq
            })

        return segments

    @classmethod
    def parse(cls, content: str, format_type: str = "txt") -> List[Dict[str, Any]]:
        fmt = format_type.lower()
        if fmt == "json":
            return cls.parse_json(content)
        elif fmt == "vtt":
            return cls.parse_vtt(content)
        else:
            return cls.parse_txt(content)
