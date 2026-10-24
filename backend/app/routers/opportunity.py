from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.dependencies import require_roles
from app.models.models import (
    User,
    UserRole,
    VolunteerProfile,
    Opportunity,
    OpportunityStatus,
    NGO,
      NGOStatus,
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
# HELPER - UPDATE OPPORTUNITY LIFECYCLE
# ============================================================

def update_opportunity_lifecycle(
    opportunity: Opportunity
) -> bool:
    """
    Automatically update opportunity status based on
    its date and start/end times.

    Rules:

    PUBLISHED
        ↓
    Event starts
        ↓
    ONGOING
        ↓
    Event ends
        ↓
    COMPLETED

    If the event date has already passed without becoming
    ongoing, it becomes EXPIRED.

    Application deadline and capacity do NOT change the
    opportunity status. They only prevent new applications.
    """

    # Do not automatically modify terminal/manual statuses
    if opportunity.status in [
        OpportunityStatus.DRAFT,
        OpportunityStatus.COMPLETED,
        OpportunityStatus.CANCELLED,
        OpportunityStatus.EXPIRED,
    ]:
        return False

    if not opportunity.date:
        return False

    today = date.today()
    now = datetime.utcnow()

    # --------------------------------------------------------
    # PUBLISHED opportunity
    # --------------------------------------------------------

    if opportunity.status == OpportunityStatus.PUBLISHED:

        # Event date has completely passed
        if opportunity.date < today:
            opportunity.status = OpportunityStatus.EXPIRED
            return True

        # Event is today
        if opportunity.date == today:

            # If an end time exists and it has passed,
            # the event is completed.
            if (
                opportunity.end_time
                and now.time() >= opportunity.end_time
            ):
                opportunity.status = OpportunityStatus.COMPLETED
                return True

            # If start time exists and has arrived,
            # event becomes ongoing.
            if (
                opportunity.start_time
                and now.time() >= opportunity.start_time
            ):
                opportunity.status = OpportunityStatus.ONGOING
                return True

    # --------------------------------------------------------
    # ONGOING opportunity
    # --------------------------------------------------------

    elif opportunity.status == OpportunityStatus.ONGOING:

        # If the event date is before today,
        # it has definitely ended.
        if opportunity.date < today:
            opportunity.status = OpportunityStatus.COMPLETED
            return True

        # If the event is today and end time has passed,
        # mark it completed.
        if (
            opportunity.date == today
            and opportunity.end_time
            and now.time() >= opportunity.end_time
        ):
            opportunity.status = OpportunityStatus.COMPLETED
            return True

    return False


# ============================================================
# HELPER - CHECK WHETHER APPLICATIONS ARE OPEN
# ============================================================

def check_application_availability(
    db: Session,
    opportunity: Opportunity
):
    """
    Raises an HTTPException if volunteers can no longer apply.

    Applications are closed when:

    1. Opportunity is not PUBLISHED
    2. Application deadline has passed
    3. Opportunity date has passed
    4. Capacity has been reached
    """

    # Only published opportunities accept applications
    if opportunity.status != OpportunityStatus.PUBLISHED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Applications are only allowed for "
                "published opportunities"
            )
        )

    now = datetime.utcnow()

    # --------------------------------------------------------
    # APPLICATION DEADLINE
    # --------------------------------------------------------

    if (
        opportunity.application_deadline
        and now > opportunity.application_deadline
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The application deadline has passed"
        )

    # --------------------------------------------------------
    # OPPORTUNITY DATE
    # --------------------------------------------------------

    if (
        opportunity.date
        and opportunity.date < date.today()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This opportunity has already expired"
        )

    # --------------------------------------------------------
    # CAPACITY
    # --------------------------------------------------------

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
        .join(NGO, Opportunity.ngo_id == NGO.id)
        .filter(
            NGO.status == NGOStatus.APPROVED,
            Opportunity.status.in_([
                OpportunityStatus.PUBLISHED,
                OpportunityStatus.ONGOING,
            ]),
            or_(
                Opportunity.application_deadline.is_(None),
                Opportunity.application_deadline >= datetime.utcnow(),
            ),
        )
        .order_by(Opportunity.date.asc())
        .all()
    )

    # Automatically update lifecycle statuses
    status_changed = False

    for opportunity in opportunities:
        if update_opportunity_lifecycle(opportunity):
            status_changed = True

    if status_changed:
        db.commit()

        # Refresh objects after commit
        for opportunity in opportunities:
            db.refresh(opportunity)

    # Remove opportunities that became terminal statuses
    # during lifecycle update.
    opportunities = [
        opportunity
        for opportunity in opportunities
        if opportunity.status in [
            OpportunityStatus.PUBLISHED,
            OpportunityStatus.ONGOING,
        ]
    ]

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
    .join(NGO, Opportunity.ngo_id == NGO.id)
    .filter(
        Opportunity.id == opportunity_id,
        NGO.status == NGOStatus.APPROVED,
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

    # Automatically update lifecycle
    if update_opportunity_lifecycle(opportunity):
        db.commit()
        db.refresh(opportunity)

    # Do not expose expired/completed opportunities
    if opportunity.status not in [
        OpportunityStatus.PUBLISHED,
        OpportunityStatus.ONGOING,
    ]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity is no longer available"
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
    .join(NGO, Opportunity.ngo_id == NGO.id)
    .filter(
        Opportunity.id == opportunity_id,
        NGO.status == NGOStatus.APPROVED,
    )
    .first()
)


    if not opportunity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found"
        )

    # --------------------------------------------------------
    # UPDATE LIFECYCLE BEFORE ALLOWING APPLICATION
    # --------------------------------------------------------

    if update_opportunity_lifecycle(opportunity):
        db.commit()
        db.refresh(opportunity)

    # --------------------------------------------------------
    # CHECK APPLICATION AVAILABILITY
    # --------------------------------------------------------

    check_application_availability(
        db,
        opportunity
    )

    # --------------------------------------------------------
    # CHECK PREVIOUS APPLICATION
    # --------------------------------------------------------

    existing_application = (
        db.query(Application)
        .filter(
            Application.opportunity_id == opportunity_id,
            Application.volunteer_id == volunteer.id
        )
        .first()
    )

    if existing_application:

        # ----------------------------------------------------
        # ALLOW WITHDRAWN APPLICATION TO BE RESUBMITTED
        # ----------------------------------------------------

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

            # Notify NGO
            if opportunity.ngo:
                ngo_notification = Notification(
                    user_id=opportunity.ngo.user_id,
                    title="Volunteer Application Resubmitted",
                    message=(
                        f"A volunteer has resubmitted "
                        f"their application for "
                        f"'{opportunity.title}'."
                    ),
                    is_read=False,
                )

                db.add(ngo_notification)

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
    # CREATE APPLICATION
    # ========================================================

    application = Application(
        opportunity_id=opportunity.id,
        volunteer_id=volunteer.id,
        status=ApplicationStatus.PENDING,
        applied_at=datetime.utcnow(),
    )

    db.add(application)

    # --------------------------------------------------------
    # NOTIFY VOLUNTEER
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # NOTIFY NGO
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # NOTIFY NGO
    # --------------------------------------------------------

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