from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_roles
from app.models.models import NGO, UserRole, User, Service
from app.schemas.user import NGOResponse


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/ngos", response_model=list[NGOResponse])
def get_ngos(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(UserRole.USER)
    )
):
    ngos = (
        db.query(NGO)
        .filter(NGO.status == "approved")
        .all()
    )

    return ngos


@router.get("/ngos/{ngo_id}", response_model=NGOResponse)
def get_ngo(
    ngo_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(UserRole.USER)
    )
):
    ngo = (
        db.query(NGO)
        .filter(
            NGO.id == ngo_id,
            NGO.status == "approved"
        )
        .first()
    )

    if not ngo:
        raise HTTPException(
            status_code=404,
            detail="NGO not found"
        )

    return ngo

@router.get("/ngos/{ngo_id}/services")
def get_ngo_services(
    ngo_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(UserRole.USER)
    )
):
    # Check whether NGO exists and is approved
    ngo = (
        db.query(NGO)
        .filter(
            NGO.id == ngo_id,
            NGO.status == "approved"
        )
        .first()
    )

    if not ngo:
        raise HTTPException(
            status_code=404,
            detail="NGO not found"
        )

    # Get services offered by this NGO
    services = (
        db.query(Service)
        .filter(
            Service.ngo_id == ngo_id
        )
        .all()
    )

    return services