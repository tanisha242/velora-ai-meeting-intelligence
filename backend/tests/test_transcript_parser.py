from app.utils.transcript_parser import TranscriptParser

def test_parse_txt_timestamped():
    raw = """
[00:00 - 00:10] Sarah: Hello team.
[00:10 - 00:20] Alex: Hi Sarah!
"""
    segments = TranscriptParser.parse_txt(raw)
    assert len(segments) == 2
    assert segments[0]["speaker_name"] == "Sarah"
    assert segments[0]["start_time"] == 0.0
    assert segments[0]["end_time"] == 10.0
    assert segments[1]["speaker_name"] == "Alex"

def test_parse_vtt():
    vtt = """WEBVTT

00:00:00.000 --> 00:00:05.000
Sarah: Welcome everyone.

00:00:05.000 --> 00:00:12.000
John: Thanks Sarah.
"""
    segments = TranscriptParser.parse_vtt(vtt)
    assert len(segments) == 2
    assert segments[0]["speaker_name"] == "Sarah"
    assert segments[0]["text"] == "Welcome everyone."
    assert segments[1]["start_time"] == 5.0

def test_parse_json():
    json_str = """[
        {"speaker": "Sarah", "start": 0.0, "end": 4.0, "text": "Welcome"},
        {"speaker": "Alex", "start": 4.0, "end": 10.0, "text": "Hi"}
    ]"""
    segments = TranscriptParser.parse_json(json_str)
    assert len(segments) == 2
    assert segments[0]["speaker_name"] == "Sarah"
    assert segments[1]["speaker_name"] == "Alex"
