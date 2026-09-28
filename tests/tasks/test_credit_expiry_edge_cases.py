from datetime import datetime, timedelta, timezone
from decimal import Decimal
from unittest.mock import MagicMock, patch
from uuid import uuid4

from app.models.wallet_balance import WalletBalance
from app.models.wallet_credit import WalletCredit
from app.tasks.credit_expiry import expire_wallet_credits


def _expired_credit(
    *,
    user_id: str = "pushkar-expiry-user",
    remaining_amount: Decimal = Decimal("100.00"),
) -> WalletCredit:
    now = datetime.now(timezone.utc)

    return WalletCredit(
        id=uuid4(),
        user_id=user_id,
        currency="USD",
        amount=Decimal("100.00"),
        remaining_amount=remaining_amount,
        reference_id=f"pushkar-expiry-{uuid4()}",
        created_at=now - timedelta(days=91),
        expires_at=now - timedelta(days=1),
    )


@patch("app.tasks.credit_expiry.get_wallet_balance")
@patch("app.tasks.credit_expiry.get_expired_wallet_credits")
def test_expiry_skips_credit_when_wallet_does_not_exist(
    mock_get_expired_credits,
    mock_get_wallet_balance,
):
    db = MagicMock()
    credit = _expired_credit()

    mock_get_expired_credits.return_value = [credit]
    mock_get_wallet_balance.return_value = None

    result = expire_wallet_credits(db)

    assert result["processed_count"] == 0
    assert result["skipped_count"] == 1
    assert result["processed"] == []

    assert result["skipped"][0]["credit_id"] == str(credit.id)
    assert result["skipped"][0]["reason"] == "WALLET_NOT_FOUND"

    db.commit.assert_not_called()
    db.rollback.assert_not_called()


@patch("app.tasks.credit_expiry.get_wallet_balance")
@patch("app.tasks.credit_expiry.get_expired_wallet_credits")
def test_expiry_skips_credit_with_no_remaining_amount(
    mock_get_expired_credits,
    mock_get_wallet_balance,
):
    db = MagicMock()

    credit = _expired_credit(
        remaining_amount=Decimal("0.00"),
    )

    wallet = WalletBalance(
        user_id=credit.user_id,
        currency="USD",
        available_balance=Decimal("500.00"),
    )

    mock_get_expired_credits.return_value = [credit]
    mock_get_wallet_balance.return_value = wallet

    result = expire_wallet_credits(db)

    assert result["processed_count"] == 0
    assert result["skipped_count"] == 1

    assert result["skipped"][0]["credit_id"] == str(credit.id)
    assert result["skipped"][0]["reason"] == "NO_REMAINING_AMOUNT"

    assert wallet.available_balance == Decimal("500.00")

    db.commit.assert_not_called()
    db.rollback.assert_not_called()


@patch("app.tasks.credit_expiry.get_wallet_balance")
@patch("app.tasks.credit_expiry.get_expired_wallet_credits")
def test_expiry_skips_when_wallet_balance_is_less_than_expiring_credit(
    mock_get_expired_credits,
    mock_get_wallet_balance,
):
    db = MagicMock()

    credit = _expired_credit(
        remaining_amount=Decimal("100.00"),
    )

    wallet = WalletBalance(
        user_id=credit.user_id,
        currency="USD",
        available_balance=Decimal("50.00"),
    )

    mock_get_expired_credits.return_value = [credit]
    mock_get_wallet_balance.return_value = wallet

    result = expire_wallet_credits(db)

    assert result["processed_count"] == 0
    assert result["skipped_count"] == 1

    assert result["skipped"][0]["credit_id"] == str(credit.id)
    assert (
        result["skipped"][0]["reason"]
        == "INSUFFICIENT_WALLET_BALANCE"
    )

    assert wallet.available_balance == Decimal("50.00")

    db.commit.assert_not_called()
    db.rollback.assert_not_called()
