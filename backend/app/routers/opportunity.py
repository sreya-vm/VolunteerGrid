from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_roles
from app.models.models import (
    User,
    UserRole,
    VolunteerProfile,
    Opportunity,
    OpportunityStatus,
    Application,
    ApplicationStatus,
    Notification,
)


router = APIRouter(
    prefix="/opportunities",
    tags=["Opportunities"]
)


# ============================================================
# HELPER - GET VOLUNTEER PROFILE
# ============================================================

def get_volunteer_profile(
    db: Session,
    current_user: User
):
    volunteer = (
        db.query(VolunteerProfile)
        .filter(
            VolunteerProfile.user_id == current_user.id
        )
        .first()
    )

    if not volunteer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You must create a volunteer profile "
                "before applying for opportunities"
            )
        )

    return volunteer


# ============================================================
# VIEW AVAILABLE OPPORTUNITIES
# ============================================================

@router.get("/")
def get_opportunities(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.USER)
    )
):
    opportunities = (
        db.query(Opportunity)
        .filter(
            Opportunity.status.in_([
                OpportunityStatus.PUBLISHED,
                OpportunityStatus.ONGOING,
            ])
        )
        .order_by(
            Opportunity.date.asc()
        )
        .all()
    )

    return opportunities


# ============================================================
# VIEW SINGLE OPPORTUNITY
# ============================================================

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
            Opportunity.id == opportunity_id,
            Opportunity.status.in_([
                OpportunityStatus.PUBLISHED,
                OpportunityStatus.ONGOING,
            ])
        )
        .first()
    )

    if not opportunity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found or unavailable"
        )

    return opportunity


# ============================================================
# APPLY FOR OPPORTUNITY
# ============================================================

@router.post("/{opportunity_id}/apply")
def apply_for_opportunity(
    opportunity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.USER)
    )
):
    volunteer = get_volunteer_profile(
        db,
        current_user
    )

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

    # Only published opportunities can receive applications
    if opportunity.status != OpportunityStatus.PUBLISHED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Applications are only allowed for "
                "published opportunities"
            )
        )

    # Check application deadline
    now = datetime.utcnow()

    if (
        opportunity.application_deadline
        and now > opportunity.application_deadline
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The application deadline has passed"
        )

    # Check whether opportunity date has already passed
    if (
        opportunity.date
        and opportunity.date < now
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This opportunity has already started or ended"
        )

    # Check previous application
    existing_application = (
        db.query(Application)
        .filter(
            Application.opportunity_id == opportunity_id,
            Application.volunteer_id == volunteer.id
        )
        .first()
    )

    if existing_application:

        # Allow a withdrawn application to be submitted again
        if (
            existing_application.status
            == ApplicationStatus.WITHDRAWN
        ):
            existing_application.status = (
                ApplicationStatus.PENDING
            )
            existing_application.applied_at = datetime.utcnow()

            notification = Notification(
                user_id=current_user.id,
                title="Application Resubmitted",
                message=(
                    f"Your application for "
                    f"'{opportunity.title}' "
                    "has been resubmitted."
                ),
                is_read=False,
            )

            db.add(notification)
            db.commit()
            db.refresh(existing_application)

            return {
                "message": "Application resubmitted successfully",
                "application_id": existing_application.id,
                "opportunity_id": opportunity.id,
                "status": existing_application.status,
            }

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "You have already applied for "
                "this opportunity"
            )
        )

    # ========================================================
    # CAPACITY CHECK
    # ========================================================

    if opportunity.capacity is not None:

        active_application_count = (
            db.query(Application)
            .filter(
                Application.opportunity_id == opportunity.id,
                Application.status.in_([
                    ApplicationStatus.PENDING,
                    ApplicationStatus.ACCEPTED,
                ])
            )
            .count()
        )

        if active_application_count >= opportunity.capacity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This opportunity is already full"
            )

    # ========================================================
    # CREATE APPLICATION
    # ========================================================

    application = Application(
        opportunity_id=opportunity.id,
        volunteer_id=volunteer.id,
        status=ApplicationStatus.PENDING,
        applied_at=datetime.utcnow(),
    )

    db.add(application)

    # Notify volunteer
    notification = Notification(
        user_id=current_user.id,
        title="Application Submitted",
        message=(
            f"Your application for "
            f"'{opportunity.title}' "
            "has been submitted successfully."
        ),
        is_read=False,
    )

    db.add(notification)

    # Notify NGO
    if opportunity.ngo:
        ngo_notification = Notification(
            user_id=opportunity.ngo.user_id,
            title="New Volunteer Application",
            message=(
                f"A volunteer has applied for "
                f"'{opportunity.title}'."
            ),
            is_read=False,
        )

        db.add(ngo_notification)

    db.commit()
    db.refresh(application)

    return {
        "message": "Application submitted successfully",
        "application_id": application.id,
        "opportunity_id": opportunity.id,
        "status": application.status,
    }


# ============================================================
# WITHDRAW APPLICATION
# ============================================================

@router.delete("/{opportunity_id}/apply")
def withdraw_application(
    opportunity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.USER)
    )
):
    volunteer = get_volunteer_profile(
        db,
        current_user
    )

    application = (
        db.query(Application)
        .filter(
            Application.opportunity_id == opportunity_id,
            Application.volunteer_id == volunteer.id
        )
        .first()
    )

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    if application.status == ApplicationStatus.WITHDRAWN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application has already been withdrawn"
        )

    if application.status == ApplicationStatus.REJECTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rejected applications cannot be withdrawn"
        )

    if application.status == ApplicationStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Completed applications cannot be withdrawn"
        )

    application.status = ApplicationStatus.WITHDRAWN

    opportunity = application.opportunity

    # Notify NGO
    if opportunity and opportunity.ngo:
        notification = Notification(
            user_id=opportunity.ngo.user_id,
            title="Application Withdrawn",
            message=(
                f"A volunteer has withdrawn their "
                f"application for '{opportunity.title}'."
            ),
            is_read=False,
        )

        db.add(notification)

    db.commit()
    db.refresh(application)

    return {
        "message": "Application withdrawn successfully",
        "application_id": application.id,
        "status": application.status,
    }


# ============================================================
# VIEW MY APPLICATIONS
# ============================================================

@router.get("/my/applications")
def get_my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.USER)
    )
):
    volunteer = get_volunteer_profile(
        db,
        current_user
    )

    applications = (
        db.query(Application)
        .filter(
            Application.volunteer_id == volunteer.id
        )
        .order_by(
            Application.applied_at.desc()
        )
        .all()
    )

    return [
        {
            "application_id": application.id,
            "opportunity_id": application.opportunity_id,
            "title": (
                application.opportunity.title
                if application.opportunity
                else None
            ),
            "description": (
                application.opportunity.description
                if application.opportunity
                else None
            ),
            "location": (
                application.opportunity.location
                if application.opportunity
                else None
            ),
            "date": (
                application.opportunity.date
                if application.opportunity
                else None
            ),
            "start_time": (
                application.opportunity.start_time
                if application.opportunity
                else None
            ),
            "end_time": (
                application.opportunity.end_time
                if application.opportunity
                else None
            ),
            "opportunity_status": (
                application.opportunity.status
                if application.opportunity
                else None
            ),
            "application_status": application.status,
            "applied_at": application.applied_at,
        }
        for application in applications
    ]


# ============================================================
# VIEW MY APPLICATION FOR ONE OPPORTUNITY
# ============================================================

@router.get("/{opportunity_id}/my-application")
def get_my_application(
    opportunity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.USER)
    )
):
    volunteer = get_volunteer_profile(
        db,
        current_user
    )

    application = (
        db.query(Application)
        .filter(
            Application.opportunity_id == opportunity_id,
            Application.volunteer_id == volunteer.id
        )
        .first()
    )

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You have not applied for this opportunity"
        )

    return {
        "application_id": application.id,
        "opportunity_id": application.opportunity_id,
        "status": application.status,
        "applied_at": application.applied_at,
    }