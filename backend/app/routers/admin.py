from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_roles
from app.models.models import (
    AuditLog,
    Application,
    ApplicationStatus,
    NGO,
    NGOStatus,
    Opportunity,
    OpportunityStatus,
    RequestStatus,
    ServiceRequest,
    User,
    UserRole,
    VolunteerProfile,
    Notification,
)


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


# ============================================================
# ADMIN DASHBOARD
# ============================================================

@router.get("/dashboard")
def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN)
    )
):
    total_users = (
        db.query(User)
        .filter(User.role == UserRole.USER)
        .count()
    )

    total_ngos = db.query(NGO).count()

    pending_ngos = (
        db.query(NGO)
        .filter(NGO.status == NGOStatus.PENDING)
        .count()
    )

    approved_ngos = (
        db.query(NGO)
        .filter(NGO.status == NGOStatus.APPROVED)
        .count()
    )

    rejected_ngos = (
        db.query(NGO)
        .filter(NGO.status == NGOStatus.REJECTED)
        .count()
    )

    total_volunteers = db.query(VolunteerProfile).count()

    total_opportunities = db.query(Opportunity).count()

    published_opportunities = (
        db.query(Opportunity)
        .filter(
            Opportunity.status == OpportunityStatus.PUBLISHED
        )
        .count()
    )

    total_applications = db.query(Application).count()

    pending_applications = (
        db.query(Application)
        .filter(
            Application.status == ApplicationStatus.PENDING
        )
        .count()
    )

    total_service_requests = db.query(ServiceRequest).count()

    pending_service_requests = (
        db.query(ServiceRequest)
        .filter(
            ServiceRequest.status == RequestStatus.PENDING
        )
        .count()
    )

    return {
        "users": {
            "total": total_users,
        },
        "ngos": {
            "total": total_ngos,
            "pending": pending_ngos,
            "approved": approved_ngos,
            "rejected": rejected_ngos,
        },
        "volunteers": {
            "total": total_volunteers,
        },
        "opportunities": {
            "total": total_opportunities,
            "published": published_opportunities,
        },
        "applications": {
            "total": total_applications,
            "pending": pending_applications,
        },
        "service_requests": {
            "total": total_service_requests,
            "pending": pending_service_requests,
        },
    }


# ============================================================
# VIEW ALL NGOs
# ============================================================

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


# ============================================================
# VIEW PENDING NGOs
# ============================================================

@router.get("/ngos/pending")
def get_pending_ngos(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN)
    )
):
    ngos = (
        db.query(NGO)
        .filter(
            NGO.status == NGOStatus.PENDING
        )
        .order_by(NGO.created_at.asc())
        .all()
    )

    return ngos


# ============================================================
# VIEW SINGLE NGO
# ============================================================

@router.get("/ngos/{ngo_id}")
def get_ngo(
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

    return ngo


# ============================================================
# APPROVE NGO
# ============================================================

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

    # Notify NGO user
    if ngo.user:
        notification = Notification(
            user_id=ngo.user_id,
            title="NGO Approved",
            message=(
                f"Your NGO '{ngo.organization_name}' "
                "has been approved by the administrator."
            ),
            is_read=False,
        )
        db.add(notification)

    db.commit()
    db.refresh(ngo)

    return {
        "message": "NGO approved successfully",
        "ngo_id": ngo.id,
        "status": ngo.status,
        "approved_at": ngo.approved_at,
    }


# ============================================================
# REJECT NGO
# ============================================================

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

    if ngo.status == NGOStatus.REJECTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="NGO is already rejected"
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

    # Notify NGO user
    if ngo.user:
        notification = Notification(
            user_id=ngo.user_id,
            title="NGO Application Rejected",
            message=(
                f"Your NGO '{ngo.organization_name}' "
                "application has been rejected."
            ),
            is_read=False,
        )
        db.add(notification)

    db.commit()
    db.refresh(ngo)

    return {
        "message": "NGO rejected successfully",
        "ngo_id": ngo.id,
        "status": ngo.status,
    }


# ============================================================
# VIEW ALL USERS
# ============================================================

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


# ============================================================
# VIEW SINGLE USER
# ============================================================

@router.get("/users/{user_id}")
def get_user(
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

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "is_active": user.is_active,
        "created_at": user.created_at,
    }


# ============================================================
# DEACTIVATE USER
# ============================================================

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

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already deactivated"
        )

    user.is_active = False

    audit_log = AuditLog(
        user_id=current_user.id,
        action="deactivate",
        entity="user",
        entity_id=user.id,
    )

    db.add(audit_log)

    notification = Notification(
        user_id=user.id,
        title="Account Deactivated",
        message="Your VolunteerGrid account has been deactivated by an administrator.",
        is_read=False,
    )

    db.add(notification)

    db.commit()
    db.refresh(user)

    return {
        "message": "User deactivated successfully",
        "user_id": user.id,
        "is_active": user.is_active,
    }


# ============================================================
# ACTIVATE USER
# ============================================================

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

    if user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already active"
        )

    user.is_active = True

    audit_log = AuditLog(
        user_id=current_user.id,
        action="activate",
        entity="user",
        entity_id=user.id,
    )

    db.add(audit_log)

    notification = Notification(
        user_id=user.id,
        title="Account Activated",
        message="Your VolunteerGrid account has been activated.",
        is_read=False,
    )

    db.add(notification)

    db.commit()
    db.refresh(user)

    return {
        "message": "User activated successfully",
        "user_id": user.id,
        "is_active": user.is_active,
    }


# ============================================================
# VIEW ALL VOLUNTEERS
# ============================================================

@router.get("/volunteers")
def get_all_volunteers(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN)
    )
):
    volunteers = (
        db.query(VolunteerProfile)
        .join(
            User,
            VolunteerProfile.user_id == User.id
        )
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


# ============================================================
# VIEW ALL OPPORTUNITIES
# ============================================================

@router.get("/opportunities")
def get_all_opportunities(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN)
    )
):
    opportunities = (
        db.query(Opportunity)
        .order_by(Opportunity.created_at.desc())
        .all()
    )

    return opportunities


# ============================================================
# VIEW SINGLE OPPORTUNITY
# ============================================================

@router.get("/opportunities/{opportunity_id}")
def get_opportunity(
    opportunity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN)
    )
):
    opportunity = (
        db.query(Opportunity)
        .filter(Opportunity.id == opportunity_id)
        .first()
    )

    if not opportunity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found"
        )

    return opportunity


# ============================================================
# UPDATE OPPORTUNITY STATUS
# ============================================================

@router.patch("/opportunities/{opportunity_id}/status")
def update_opportunity_status(
    opportunity_id: int,
    new_status: OpportunityStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN)
    )
):
    opportunity = (
        db.query(Opportunity)
        .filter(Opportunity.id == opportunity_id)
        .first()
    )

    if not opportunity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found"
        )

    old_status = opportunity.status
    opportunity.status = new_status

    audit_log = AuditLog(
        user_id=current_user.id,
        action=f"opportunity_status_{new_status.value}",
        entity="opportunity",
        entity_id=opportunity.id,
    )

    db.add(audit_log)

    # Notify NGO
    if opportunity.ngo:
        notification = Notification(
            user_id=opportunity.ngo.user_id,
            title="Opportunity Status Updated",
            message=(
                f"Opportunity '{opportunity.title}' status changed "
                f"from {old_status.value} to {new_status.value}."
            ),
            is_read=False,
        )
        db.add(notification)

    db.commit()
    db.refresh(opportunity)

    return {
        "message": "Opportunity status updated successfully",
        "opportunity_id": opportunity.id,
        "old_status": old_status,
        "new_status": opportunity.status,
    }


# ============================================================
# VIEW ALL APPLICATIONS
# ============================================================

@router.get("/applications")
def get_all_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN)
    )
):
    applications = (
        db.query(Application)
        .order_by(Application.applied_at.desc())
        .all()
    )

    return [
        {
            "application_id": application.id,
            "opportunity_id": application.opportunity_id,
            "opportunity_title": (
                application.opportunity.title
                if application.opportunity
                else None
            ),
            "volunteer_id": application.volunteer_id,
            "volunteer_user_id": (
                application.volunteer.user_id
                if application.volunteer
                else None
            ),
            "volunteer_name": (
                application.volunteer.user.name
                if application.volunteer
                and application.volunteer.user
                else None
            ),
            "volunteer_email": (
                application.volunteer.user.email
                if application.volunteer
                and application.volunteer.user
                else None
            ),
            "status": application.status,
            "applied_at": application.applied_at,
        }
        for application in applications
    ]


# ============================================================
# VIEW ALL SERVICE REQUESTS
# ============================================================

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
            "user_name": (
                request.user.name
                if request.user
                else None
            ),
            "user_email": (
                request.user.email
                if request.user
                else None
            ),
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


# ============================================================
# UPDATE SERVICE REQUEST STATUS
# ============================================================

@router.patch("/service-requests/{request_id}/status")
def update_service_request_status(
    request_id: int,
    new_status: RequestStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN)
    )
):
    service_request = (
        db.query(ServiceRequest)
        .filter(ServiceRequest.id == request_id)
        .first()
    )

    if not service_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service request not found"
        )

    old_status = service_request.status
    service_request.status = new_status

    audit_log = AuditLog(
        user_id=current_user.id,
        action=f"service_request_status_{new_status.value}",
        entity="service_request",
        entity_id=service_request.id,
    )

    db.add(audit_log)

    # Notify user
    notification = Notification(
        user_id=service_request.user_id,
        title="Service Request Updated",
        message=(
            f"Your service request status changed "
            f"from {old_status.value} to {new_status.value}."
        ),
        is_read=False,
    )

    db.add(notification)

    db.commit()
    db.refresh(service_request)

    return {
        "message": "Service request status updated successfully",
        "request_id": service_request.id,
        "old_status": old_status,
        "new_status": service_request.status,
    }


# ============================================================
# VIEW AUDIT LOGS
# ============================================================

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