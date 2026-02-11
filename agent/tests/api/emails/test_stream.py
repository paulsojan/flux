import asyncio
from unittest.mock import MagicMock, patch

from fastapi import FastAPI
from fastapi.testclient import TestClient

from api.emails.stream import email_stream, router


class _StopStream(Exception):
    pass


def _make_sleep_mock(allowed_calls=1):
    """Create an async function replacing asyncio.sleep that stops after N calls."""
    call_count = 0

    async def mock_sleep(seconds):
        nonlocal call_count
        call_count += 1
        if call_count > allowed_calls:
            raise _StopStream

    return mock_sleep


async def _collect_stream(mock_gmail, allowed_sleep_calls=1):
    """Call email_stream and collect all yielded chunks before the mock stops."""
    with (
        patch(
            "api.emails.stream.GmailService.get_instance",
            return_value=mock_gmail,
        ),
        patch(
            "api.emails.stream.asyncio.sleep", new=_make_sleep_mock(allowed_sleep_calls)
        ),
    ):
        response = await email_stream()
        chunks = []
        try:
            async for chunk in response.body_iterator:
                chunks.append(chunk)
        except _StopStream:
            pass
        return "".join(chunks)


def test_stream_not_authenticated():
    app = FastAPI()
    app.include_router(router)
    client = TestClient(app)

    mock_gmail = MagicMock()
    mock_gmail.is_authenticated = False

    with patch(
        "api.emails.stream.GmailService.get_instance",
        return_value=mock_gmail,
    ):
        response = client.get("/api/emails/stream")

        assert response.status_code == 200
        assert response.headers["content-type"] == "text/event-stream; charset=utf-8"
        assert "Not authenticated" in response.text


def test_stream_emits_new_emails_event():
    mock_gmail = MagicMock()
    mock_gmail.is_authenticated = True
    mock_gmail.get_profile.return_value = {"historyId": "100"}
    mock_gmail.list_history.return_value = {
        "historyId": "101",
        "history": [{"messagesAdded": [{"message": {"id": "msg1"}}]}],
    }

    text = asyncio.run(_collect_stream(mock_gmail))

    assert "new_emails" in text
    mock_gmail.list_history.assert_called_once()


def test_stream_emits_deleted_emails_event():
    mock_gmail = MagicMock()
    mock_gmail.is_authenticated = True
    mock_gmail.get_profile.return_value = {"historyId": "100"}
    mock_gmail.list_history.return_value = {
        "historyId": "101",
        "history": [
            {"labelsAdded": [{"message": {"id": "msg1"}, "labelIds": ["TRASH"]}]}
        ],
    }

    text = asyncio.run(_collect_stream(mock_gmail))

    assert "deleted_emails" in text
    mock_gmail.list_history.assert_called_once()
