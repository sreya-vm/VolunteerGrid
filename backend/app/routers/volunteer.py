from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_roles
from app.models.models import (
    User,
    UserRole,
    VolunteerProfile,
)
from app.schemas.volunteer import (
    VolunteerRegistrationRequest,
    VolunteerProfileResponse,
)


router = APIRouter(
    prefix="/volunteers",
    tags=["Volunteers"]
)


# --------------------------------------------------
# REGISTER AS VOLUNTEER
# --------------------------------------------------

@router.post(
    "/profile",
    response_model=VolunteerProfileResponse
)
def register_as_volunteer(
    volunteer_data: VolunteerRegistrationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.USER)
    )
):
    # Check if the user already has a volunteer profile
    existing_profile = (
        db.query(VolunteerProfile)
        .filter(
            VolunteerProfile.user_id == current_user.id
        )
        .first()
    )

    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already registered as a volunteer"
        )

    # Create volunteer profile
    volunteer_profile = VolunteerProfile(
        user_id=current_user.id,
        skills=volunteer_data.skills,
        interests=volunteer_data.interests,
        availability=volunteer_data.availability,
        location=volunteer_data.location,
    )

    db.add(volunteer_profile)
    db.commit()
    db.refresh(volunteer_profile)

    return volunteer_profile


# --------------------------------------------------
# VIEW MY VOLUNTEER PROFILE
# --------------------------------------------------

@router.get(
    "/profile",
    response_model=VolunteerProfileResponse
)
def get_my_volunteer_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.USER)
    )
):
    profile = (
        db.query(VolunteerProfile)
        .filter(
            VolunteerProfile.user_id == current_user.id
        )
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Volunteer profile not found. Please register as a volunteer first."
        )

    return profile