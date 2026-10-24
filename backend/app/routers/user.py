from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_roles
from app.models.models import (
    User,
    UserRole,
    NGO,
    NGOStatus,
    Service,
)


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


# ============================================================
# VIEW ALL APPROVED NGOS
# USER
# ============================================================

@router.get("/ngos")
def get_approved_ngos(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.USER)
    )
):
    
    ngos = (
    db.query(NGO)
    .join(User, NGO.user_id == User.id)
    .filter(
        NGO.status == NGOStatus.APPROVED,
        User.is_active == True,
    )
    .order_by(
        NGO.organization_name.asc()
    )
    .all()
)


    return [
        {
            "id": ngo.id,
            "organization_name": ngo.organization_name,
            "description": ngo.description,
            "address": ngo.address,
            "website": ngo.website,
            "status": ngo.status,
            "approved_at": ngo.approved_at,
        }
        for ngo in ngos
    ]


# ============================================================
# VIEW SINGLE APPROVED NGO
# USER
# ============================================================

@router.get("/ngos/{ngo_id}")
def get_ngo_details(
    ngo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.USER)
    )
):
    ngo = (
    db.query(NGO)
    .join(User, NGO.user_id == User.id)
    .filter(
        NGO.id == ngo_id,
        NGO.status == NGOStatus.APPROVED,
        User.is_active.is_(True),
    )
    .first()
)

    if not ngo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="NGO not found"
        )

    return {
        "id": ngo.id,
        "organization_name": ngo.organization_name,
        "description": ngo.description,
        "address": ngo.address,
        "website": ngo.website,
        "status": ngo.status,
        "approved_at": ngo.approved_at,
        "created_at": ngo.created_at,
    }


# ============================================================
# VIEW NGO SERVICES
# USER
# ============================================================

@router.get("/ngos/{ngo_id}/services")
def get_ngo_services(
    ngo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.USER)
    )
):
    ngo = (
    db.query(NGO)
    .join(User, NGO.user_id == User.id)
    .filter(
        NGO.id == ngo_id,
        NGO.status == NGOStatus.APPROVED,
        User.is_active.is_(True),
    )
    .first()
)

    if not ngo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="NGO not found"
        )

    services = (
        db.query(Service)
        .filter(
            Service.ngo_id == ngo.id
        )
        .order_by(
            Service.name.asc()
        )
        .all()
    )

    return [
        {
            "id": service.id,
            "ngo_id": service.ngo_id,
            "name": service.name,
            "description": service.description,
        }
        for service in services
    ]


# ============================================================
# VIEW SINGLE SERVICE
# USER
# ============================================================

@router.get("/ngos/{ngo_id}/services/{service_id}")
def get_ngo_service(
    ngo_id: int,
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.USER)
    )
):
    ngo = (
    db.query(NGO)
    .join(User, NGO.user_id == User.id)
    .filter(
        NGO.id == ngo_id,
        NGO.status == NGOStatus.APPROVED,
        User.is_active.is_(True),
    )
    .first()
)

    if not ngo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="NGO not found"
        )

    service = (
        db.query(Service)
        .filter(
            Service.id == service_id,
            Service.ngo_id == ngo_id
        )
        .first()
    )

    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )

    return {
        "id": service.id,
        "ngo_id": service.ngo_id,
        "name": service.name,
        "description": service.description,
    }