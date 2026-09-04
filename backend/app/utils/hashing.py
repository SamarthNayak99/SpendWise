"""
Password hashing using bcrypt directly.
We use bcrypt 5.x directly instead of passlib because passlib 1.7.4's
bcrypt backend is incompatible with bcrypt >= 4.1 (internal API changes).
"""
import bcrypt


def hash_password(plain_password: str) -> str:
    """Hash a plain-text password using bcrypt and return the hash as a string."""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(plain_password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against a bcrypt hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False
