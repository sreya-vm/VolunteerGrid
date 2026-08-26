from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_roles
from app.models.models import (
    User,
    UserRole,
    VolunteerProfile,
    Opportunity,
    Application,
    ApplicationStatus,
)


router = APIRouter(
    prefix="/opportunities",
    tags=["Opportunities"]
)


# --------------------------------------------------
# VIEW AVAILABLE OPPORTUNITIES
# --------------------------------------------------

@router.get("/")
def get_opportunities(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.USER)
    )
):
    opportunities = (
        db.query(Opportunity)
        .order_by(Opportunity.date.asc())
        .all()
    )

    return opportunities


# --------------------------------------------------
# VIEW SINGLE OPPORTUNITY
# --------------------------------------------------

@router.get("/{opportunity_id}")
def get_opportunity(
    opportunity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.USER)
    )
):
    opportunity = (
        db.query(Opportunity)
        .filter(
            Opportunity.id == opportunity_id
        )
        .first()
    )

    if not opportunity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found"
        )

    return opportunity


# --------------------------------------------------
# APPLY FOR OPPORTUNITY
# --------------------------------------------------

@router.post("/{opportunity_id}/apply")
def apply_for_opportunity(
    opportunity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.USER)
    )
):
    # Check volunteer profile
    volunteer_profile = (
        db.query(VolunteerProfile)
        .filter(
            VolunteerProfile.user_id == current_user.id
        )
        .first()
    )

    if not volunteer_profile:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must register as a volunteer before applying"
        )

    # Find opportunity
    opportunity = (
        db.query(Opportunity)
        .filter(
            Opportunity.id == opportunity_id
        )
        .first()
    )

    if not opportunity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found"
        )

    # Check if already applied
    existing_application = (
        db.query(Application)
        .filter(
            Application.opportunity_id == opportunity_id,
            Application.volunteer_id == volunteer_profile.id
        )
        .first()
    )

    if existing_application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied for this opportunity"
        )

    # Check opportunity capacity
    if opportunity.capacity is not None:

        accepted_count = (
            db.query(Application)
            .filter(
                Application.opportunity_id == opportunity_id,
                Application.status == ApplicationStatus.ACCEPTED
            )
            .count()
        )

        if accepted_count >= opportunity.capacity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This opportunity is already full"
            )

    # Create application
    application = Application(
        opportunity_id=opportunity_id,
        volunteer_id=volunteer_profile.id,
        status=ApplicationStatus.PENDING,
    )

    db.add(application)
    db.commit()
    db.refresh(application)

    return {
        "message": "Application submitted successfully",
        "application_id": application.id,
        "opportunity_id": opportunity.id,
        "status": application.status,
    }