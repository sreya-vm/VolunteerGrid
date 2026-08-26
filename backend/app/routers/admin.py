from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_roles
from app.models.models import (
    AuditLog,
    ServiceRequest,
    User,
    UserRole,
    NGO,
    NGOStatus,
    VolunteerProfile,
)


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


# --------------------------------------------------
# VIEW ALL NGOs
# --------------------------------------------------

@router.get("/ngos")
def get_all_ngos(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN)
    )
):
    ngos = (
        db.query(NGO)
        .order_by(NGO.created_at.desc())
        .all()
    )

    return ngos


# --------------------------------------------------
# APPROVE NGO
# --------------------------------------------------

@router.patch("/ngos/{ngo_id}/approve")
def approve_ngo(
    ngo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN)
    )
):
    ngo = (
        db.query(NGO)
        .filter(NGO.id == ngo_id)
        .first()
    )

    if not ngo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="NGO not found"
        )

    if ngo.status == NGOStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="NGO is already approved"
        )

    ngo.status = NGOStatus.APPROVED
    ngo.approved_at = datetime.utcnow()

    audit_log = AuditLog(
        user_id=current_user.id,
        action="approve",
        entity="ngo",
        entity_id=ngo.id,
    )

    db.add(audit_log)
    db.commit()

    return {
        "message": "NGO approved successfully",
        "ngo_id": ngo.id,
        "status": ngo.status,
    }


# --------------------------------------------------
# REJECT NGO
# --------------------------------------------------

@router.patch("/ngos/{ngo_id}/reject")
def reject_ngo(
    ngo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN)
    )
):
    ngo = (
        db.query(NGO)
        .filter(NGO.id == ngo_id)
        .first()
    )

    if not ngo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="NGO not found"
        )

    ngo.status = NGOStatus.REJECTED
    ngo.approved_at = None

    audit_log = AuditLog(
    user_id=current_user.id,
    action="reject",
    entity="ngo",
    entity_id=ngo.id,
)

    db.add(audit_log)
    db.commit()

    db.refresh(ngo)

    return {
        "message": "NGO rejected successfully",
        "ngo_id": ngo.id,
        "status": ngo.status,
    }

# --------------------------------------------------
# VIEW ALL USERS
# --------------------------------------------------

@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN)
    )
):
    users = (
        db.query(User)
        .order_by(User.created_at.desc())
        .all()
    )

    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "phone": user.phone,
            "is_active": user.is_active,
            "created_at": user.created_at,
        }
        for user in users
    ]

# --------------------------------------------------
# DEACTIVATE USER
# --------------------------------------------------

@router.patch("/users/{user_id}/deactivate")
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN)
    )
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin cannot deactivate their own account"
        )

    user.is_active = False
    audit_log = AuditLog(
    user_id=current_user.id,
    action="deactivate",
    entity="user",
    entity_id=user.id,
)

    db.add(audit_log)

    db.commit()
    db.refresh(user)

    return {
        "message": "User deactivated successfully",
        "user_id": user.id,
        "is_active": user.is_active
    }
# --------------------------------------------------
# ACTIVATE USER
# --------------------------------------------------

@router.patch("/users/{user_id}/activate")
def activate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN)
    )
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    user.is_active = True

    audit_log = AuditLog(
        user_id=current_user.id,
        action="activate",
        entity="user",
        entity_id=user.id,
    )

    db.add(audit_log)
    db.commit()
    db.refresh(user)

    return {
        "message": "User activated successfully",
        "user_id": user.id,
        "is_active": user.is_active
    }

# --------------------------------------------------
# VIEW ALL VOLUNTEERS
# --------------------------------------------------

@router.get("/volunteers")
def get_all_volunteers(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN)
    )
):
    volunteers = (
        db.query(VolunteerProfile)
        .join(User, VolunteerProfile.user_id == User.id)
        .order_by(VolunteerProfile.id.desc())
        .all()
    )

    return [
        {
            "volunteer_profile_id": volunteer.id,
            "user_id": volunteer.user_id,
            "name": volunteer.user.name,
            "email": volunteer.user.email,
            "phone": volunteer.user.phone,
            "skills": volunteer.skills,
            "interests": volunteer.interests,
            "availability": volunteer.availability,
            "location": volunteer.location,
            "is_active": volunteer.user.is_active,
        }
        for volunteer in volunteers
    ]

# --------------------------------------------------
# VIEW ALL SERVICE REQUESTS
# --------------------------------------------------
@router.get("/service-requests")
def get_all_service_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN)
    )
):
    requests = (
        db.query(ServiceRequest)
        .order_by(ServiceRequest.created_at.desc())
        .all()
    )

    return [
        {
            "id": request.id,
            "user_id": request.user_id,
            "user_name": request.user.name,
            "user_email": request.user.email,
            "ngo_id": request.ngo_id,
            "ngo_name": (
                request.ngo.organization_name
                if request.ngo
                else None
            ),
            "service_type": request.service_type,
            "description": request.description,
            "location": request.location,
            "status": request.status,
            "created_at": request.created_at,
        }
        for request in requests
    ]

# --------------------------------------------------
# VIEW AUDIT LOGS
# --------------------------------------------------

@router.get("/audit-logs")
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN)
    )
):
    logs = (
        db.query(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .all()
    )

    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "entity": log.entity,
            "entity_id": log.entity_id,
            "created_at": log.created_at,
        }
        for log in logs
    ]