from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_roles
from app.models.models import (
    User,
    UserRole,
    Notification,
)


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# ============================================================
# GET MY NOTIFICATIONS
# ALL AUTHENTICATED USERS
# ============================================================

@router.get("/")
def get_my_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.USER,
            UserRole.NGO,
            UserRole.ADMIN
        )
    )
):
    notifications = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id
        )
        .order_by(
            Notification.created_at.desc()
        )
        .all()
    )

    return [
        {
            "id": notification.id,
            "title": notification.title,
            "message": notification.message,
            "is_read": notification.is_read,
            "created_at": notification.created_at,
        }
        for notification in notifications
    ]


# ============================================================
# GET UNREAD NOTIFICATIONS
# ALL AUTHENTICATED USERS
# ============================================================

@router.get("/unread")
def get_unread_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.USER,
            UserRole.NGO,
            UserRole.ADMIN
        )
    )
):
    notifications = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        )
        .order_by(
            Notification.created_at.desc()
        )
        .all()
    )

    return [
        {
            "id": notification.id,
            "title": notification.title,
            "message": notification.message,
            "is_read": notification.is_read,
            "created_at": notification.created_at,
        }
        for notification in notifications
    ]


# ============================================================
# GET SINGLE NOTIFICATION
# ============================================================

@router.get("/{notification_id}")
def get_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.USER,
            UserRole.NGO,
            UserRole.ADMIN
        )
    )
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    return {
        "id": notification.id,
        "title": notification.title,
        "message": notification.message,
        "is_read": notification.is_read,
        "created_at": notification.created_at,
    }


# ============================================================
# MARK ONE NOTIFICATION AS READ
# ============================================================

@router.patch("/{notification_id}/read")
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.USER,
            UserRole.NGO,
            UserRole.ADMIN
        )
    )
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    notification.is_read = True

    db.commit()
    db.refresh(notification)

    return {
        "message": "Notification marked as read",
        "notification_id": notification.id,
        "is_read": notification.is_read,
    }


# ============================================================
# MARK ALL NOTIFICATIONS AS READ
# ============================================================

@router.patch("/read-all")
def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.USER,
            UserRole.NGO,
            UserRole.ADMIN
        )
    )
):
    notifications = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        )
        .all()
    )

    for notification in notifications:
        notification.is_read = True

    db.commit()

    return {
        "message": "All notifications marked as read",
        "updated_count": len(notifications),
    }