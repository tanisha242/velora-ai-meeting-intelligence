def test_action_item_flow(client):
    # Create meeting first
    create_m = client.post("/api/meetings", json={"title": "Action Item Test"})
    meeting_id = create_m.json()["data"]["id"]

    # Add Action Item
    ai_payload = {
        "title": "Complete unit test suite",
        "description": "Ensure pytest runs without errors",
        "assignee": "Alex Mercer",
        "due_date": "Tomorrow",
        "status": "pending"
    }
    res_ai = client.post(f"/api/meetings/{meeting_id}/action-items", json=ai_payload)
    assert res_ai.status_code == 201
    ai_data = res_ai.json()["data"]
    ai_id = ai_data["id"]
    assert ai_data["title"] == "Complete unit test suite"

    # Toggle status to completed
    patch_res = client.patch(f"/api/action-items/{ai_id}/status", json={"status": "completed"})
    assert patch_res.status_code == 200
    assert patch_res.json()["data"]["status"] == "completed"

    # Delete Action Item
    del_res = client.delete(f"/api/action-items/{ai_id}")
    assert del_res.status_code == 200
