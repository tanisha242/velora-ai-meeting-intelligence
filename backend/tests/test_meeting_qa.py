from app.db.seed import seed_database

def test_ask_ai_grounded_qa(client, db_session):
    # 1. Create a specific meeting with unique content
    create_payload = {
        "title": "Quantum Encryption Strategy Sync",
        "description": "Discussing post-quantum cryptography implementation",
        "participants": ["Sarah Connor", "John Doe"],
        "transcript_text": "[00:00 - 00:10] Sarah Connor: We decided to implement Kyber lattice encryption.\n[00:10 - 00:20] John Doe: Great, I will update the security protocol docs.",
        "transcript_format": "txt"
    }
    res = client.post("/api/meetings", json=create_payload)
    assert res.status_code == 201
    meeting_id = res.json()["data"]["id"]

    # 2. Ask about main topics
    q1 = client.post(f"/api/meetings/{meeting_id}/ask-ai", json={"question": "What were the main topics discussed?"})
    assert q1.status_code == 200
    ans1 = q1.json()["data"]["answer"]
    assert "Quantum Encryption Strategy Sync" in ans1 or "Introduction" in ans1

    # 3. Ask about major decisions
    q2 = client.post(f"/api/meetings/{meeting_id}/ask-ai", json={"question": "What were the major decisions made?"})
    assert q2.status_code == 200
    ans2 = q2.json()["data"]["answer"]
    assert "decisions" in ans2.lower()

    # 4. Ask about action items
    q3 = client.post(f"/api/meetings/{meeting_id}/ask-ai", json={"question": "List all action items and assignees."})
    assert q3.status_code == 200
    ans3 = q3.json()["data"]["answer"]
    assert "action items" in ans3.lower()

    # 5. Hallucination test: Ask about unmentioned topic
    q4 = client.post(f"/api/meetings/{meeting_id}/ask-ai", json={"question": "What did the team decide about launching a mobile application?"})
    assert q4.status_code == 200
    ans4 = q4.json()["data"]["answer"]
    assert "do not mention" in ans4.lower() or "not mention" in ans4.lower()


def test_ask_ai_seeded_meeting_questions(client, db_session):
    # Seed db first
    seed_database(db_session)

    # Fetch meetings to get Weekly Product Team Sync ID
    res = client.get("/api/meetings")
    assert res.status_code == 200
    meetings = res.json()["data"]
    sync_meeting = next((m for m in meetings if m["title"] == "Weekly Product Team Sync"), None)
    assert sync_meeting is not None
    m_id = sync_meeting["id"]

    # Test A: "What frontend work did Alex mention?"
    qa = client.post(f"/api/meetings/{m_id}/ask-ai", json={"question": "What frontend work did Alex mention?"})
    assert qa.status_code == 200
    ans_a = qa.json()["data"]["answer"]
    assert "Alex" in ans_a and "frontend" in ans_a.lower()

    # Test B: "What did John say about the backend?"
    qb = client.post(f"/api/meetings/{m_id}/ask-ai", json={"question": "What did John say about the backend?"})
    assert qb.status_code == 200
    ans_b = qb.json()["data"]["answer"]
    assert "John" in ans_b and ("backend" in ans_b.lower() or "pytest" in ans_b.lower())

    # Test C: "What did Priya say about transcript search?"
    qc = client.post(f"/api/meetings/{m_id}/ask-ai", json={"question": "What did Priya say about transcript search?"})
    assert qc.status_code == 200
    ans_c = qc.json()["data"]["answer"]
    assert "Priya" in ans_c and ("search" in ans_c.lower() or "50 milliseconds" in ans_c.lower())

    # Test D: "What were the major decisions made?"
    qd = client.post(f"/api/meetings/{m_id}/ask-ai", json={"question": "What were the major decisions made?"})
    assert qd.status_code == 200
    ans_d = qd.json()["data"]["answer"]
    assert "decisions" in ans_d.lower()

    # Test E: "List all action items and their assignees."
    qe = client.post(f"/api/meetings/{m_id}/ask-ai", json={"question": "List all action items and their assignees."})
    assert qe.status_code == 200
    ans_e = qe.json()["data"]["answer"]
    assert "action items" in ans_e.lower() and "Alex Mercer" in ans_e

    # Test F: "Were there any release blockers mentioned?"
    qf = client.post(f"/api/meetings/{m_id}/ask-ai", json={"question": "Were there any release blockers mentioned?"})
    assert qf.status_code == 200
    ans_f = qf.json()["data"]["answer"]
    assert "blocker" in ans_f.lower() or "issue" in ans_f.lower()

    # Test G (Hallucination Test): "What did the team decide about launching a mobile application?"
    qg = client.post(f"/api/meetings/{m_id}/ask-ai", json={"question": "What did the team decide about launching a mobile application?"})
    assert qg.status_code == 200
    ans_g = qg.json()["data"]["answer"]
    assert "do not mention" in ans_g.lower() or "not mention" in ans_g.lower()

    # Test H (Cross-Meeting Test):
    eng_meeting = next((m for m in meetings if m["title"] == "Engineering Sprint Planning"), None)
    assert eng_meeting is not None
    qh1 = client.post(f"/api/meetings/{eng_meeting['id']}/ask-ai", json={"question": "What were the main topics discussed in this meeting?"})
    assert qh1.status_code == 200
    ans_h1 = qh1.json()["data"]["answer"]
    assert "Engineering Sprint Planning" in ans_h1
    assert ans_h1 != ans_a


