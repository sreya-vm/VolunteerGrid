from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.models import NGO, NGOStatus, User, UserRole
from app.schemas.ngo import NGOCreate


router = APIRouter(
    prefix="/ngo",
    tags=["NGO"]
)


@router.post(
    "/details",
    status_code=status.HTTP_201_CREATED
)
def create_ngo_details(
    ngo_data: NGOCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Only NGO users can submit NGO details
    if current_user.role != UserRole.NGO:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only NGO users can submit NGO details"
        )

    # Check if NGO details already exist
    existing_ngo = (
        db.query(NGO)
        .filter(NGO.user_id == current_user.id)
        .first()
    )

    if existing_ngo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="NGO details have already been submitted"
        )

    # Create NGO record
    ngo = NGO(
        user_id=current_user.id,
        organization_name=ngo_data.organization_name,
        description=ngo_data.description,
        address=ngo_data.address,
        website=ngo_data.website,
        status=NGOStatus.PENDING
    )

    db.add(ngo)
    db.commit()
    db.refresh(ngo)

    return {
        "message": "NGO details submitted successfully and are pending approval",
        "ngo_id": ngo.id,
        "status": ngo.status.value
    }