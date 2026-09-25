def test_create_get_update_delete_meeting(client):
    # 1. Create Meeting
    create_payload = {
        "title": "API Test Sync",
        "description": "Testing CRUD",
        "participants": ["Sarah Connor", "Alex Mercer"],
        "transcript_text": "[00:00 - 00:10] Sarah Connor: Testing transcript flow.",
        "transcript_format": "txt"
    }
    response = client.post("/api/meetings", json=create_payload)
    assert response.status_code == 201
    data = response.json()["data"]
    meeting_id = data["id"]
    assert data["title"] == "API Test Sync"
    assert len(data["participants"]) == 2

    # 2. Get Meeting
    get_res = client.get(f"/api/meetings/{meeting_id}")
    assert get_res.status_code == 200
    assert get_res.json()["data"]["id"] == meeting_id

    # 3. List Meetings
    list_res = client.get("/api/meetings")
    assert list_res.status_code == 200
    assert len(list_res.json()["data"]) == 1

    # 4. Update Meeting
    update_res = client.put(f"/api/meetings/{meeting_id}", json={"title": "Updated Title"})
    assert update_res.status_code == 200
    assert update_res.json()["data"]["title"] == "Updated Title"

    # 5. Delete Meeting
    del_res = client.delete(f"/api/meetings/{meeting_id}")
    assert del_res.status_code == 200

    # 6. Verify 404 after deletion
    get_404 = client.get(f"/api/meetings/{meeting_id}")
    assert get_404.status_code == 404
