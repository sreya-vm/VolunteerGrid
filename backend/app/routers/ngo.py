from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.models import NGO, NGOStatus, Opportunity,User, UserRole
from app.schemas.ngo import NGOCreate
from app.schemas.opportunity import OpportunityCreate

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

@router.post(
    "/opportunities",
    status_code=status.HTTP_201_CREATED
)
def create_opportunity(
    opportunity_data: OpportunityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Only NGO users can create opportunities
    if current_user.role != UserRole.NGO:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only NGO users can create opportunities"
        )

    # Get NGO profile
    ngo = (
        db.query(NGO)
        .filter(NGO.user_id == current_user.id)
        .first()
    )

    if not ngo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="NGO profile not found"
        )

    # NGO must be approved
    if ngo.status != NGOStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only approved NGOs can create opportunities"
        )

    # Create opportunity
    opportunity = Opportunity(
        ngo_id=ngo.id,
        title=opportunity_data.title,
        description=opportunity_data.description,
        opportunity_type=opportunity_data.opportunity_type,
        payment_type=opportunity_data.payment_type,
        location=opportunity_data.location,
        date=opportunity_data.date,
        start_time=opportunity_data.start_time,
        end_time=opportunity_data.end_time,
        requirements=opportunity_data.requirements,
        capacity=opportunity_data.capacity,
        application_deadline=opportunity_data.application_deadline,
    )

    db.add(opportunity)
    db.commit()
    db.refresh(opportunity)

    return {
        "message": "Opportunity created successfully",
        "opportunity_id": opportunity.id
    }