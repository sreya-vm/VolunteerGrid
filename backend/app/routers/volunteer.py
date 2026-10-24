from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_roles

from app.models.models import (
    User,
    UserRole,
    VolunteerProfile,
    Opportunity,
    OpportunityType,
    OpportunityStatus,
    NGO,
    NGOStatus,
    Application,
    ApplicationStatus,
    Notification,
)

from app.schemas.volunteer import (
    VolunteerProfileCreate,
    VolunteerProfileUpdate,
    VolunteerProfileResponse,
)


router = APIRouter(
    prefix="/volunteer",
    tags=["Volunteer"],
)


# ============================================================
# HELPER - GET VOLUNTEER PROFILE
# ============================================================

def get_volunteer(
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

    return volunteer


# ============================================================
# CREATE VOLUNTEER PROFILE
# ============================================================

@router.post(
    "/profile",
    response_model=VolunteerProfileResponse,
    status_code=status.HTTP_201_CREATED
)
def create_volunteer_profile(
    profile_data: VolunteerProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.USER)
    ),
):
    existing_profile = get_volunteer(
        db,
        current_user
    )

    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Volunteer profile already exists"
        )

    profile = VolunteerProfile(
        user_id=current_user.id,
        skills=profile_data.skills,
        interests=profile_data.interests,
        availability=profile_data.availability,
        location=profile_data.location,
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


# ============================================================
# GET MY VOLUNTEER PROFILE
# ============================================================

@router.get("/profile")
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.USER)
    ),
):
    profile = get_volunteer(
        db,
        current_user
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Volunteer profile not found"
        )

    return {
        "volunteer_profile_id": profile.id,
        "user_id": profile.user_id,
        "name": current_user.name,
        "email": current_user.email,
        "phone": current_user.phone,
        "skills": profile.skills,
        "interests": profile.interests,
        "availability": profile.availability,
        "location": profile.location,
    }


# ============================================================
# UPDATE VOLUNTEER PROFILE
# ============================================================

@router.put(
    "/profile",
    response_model=VolunteerProfileResponse
)
def update_volunteer_profile(
    profile_data: VolunteerProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.USER)
    ),
):
    profile = get_volunteer(
        db,
        current_user
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Volunteer profile not found"
        )

    if profile_data.skills is not None:
        profile.skills = profile_data.skills

    if profile_data.interests is not None:
        profile.interests = profile_data.interests

    if profile_data.availability is not None:
        profile.availability = profile_data.availability

    if profile_data.location is not None:
        profile.location = profile_data.location

    db.commit()
    db.refresh(profile)

    return profile


# ============================================================
# VIEW AVAILABLE EVENTS
# ============================================================


@router.get("/events")
def get_available_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.USER)
    ),
):
    now = datetime.utcnow()
    today = date.today()

    opportunities = (
    db.query(Opportunity)
    .join(NGO, Opportunity.ngo_id == NGO.id)
    .join(User, NGO.user_id == User.id)
    .filter(
        Opportunity.opportunity_type == OpportunityType.EVENT,
        NGO.status == NGOStatus.APPROVED,
        User.is_active.is_(True),
        Opportunity.status.in_([
            OpportunityStatus.PUBLISHED,
            OpportunityStatus.ONGOING,
        ]),
        (
            Opportunity.application_deadline.is_(None)
            | (Opportunity.application_deadline > now)
        ),
        Opportunity.date >= today,
    )
    .order_by(Opportunity.date.asc())
    .all()
)

    return [
        {
            "id": opportunity.id,
            "title": opportunity.title,
            "description": opportunity.description,
            "location": opportunity.location,
            "date": opportunity.date,
            "start_time": opportunity.start_time,
            "end_time": opportunity.end_time,
            "capacity": opportunity.capacity,
            "requirements": opportunity.requirements,
            "application_deadline": opportunity.application_deadline,
            "status": opportunity.status,
            "ngo_id": opportunity.ngo_id,
            "ngo_name": (
                opportunity.ngo.organization_name
                if opportunity.ngo else None
            ),
            "opportunity_type": opportunity.opportunity_type,
        }
        for opportunity in opportunities
    ]



# ============================================================
# VIEW SINGLE EVENT
# ============================================================


@router.get("/events/{event_id}")
def get_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.USER)
    ),
):
    now = datetime.utcnow()
    today = date.today()

    event = (
    db.query(Opportunity)
    .join(NGO, Opportunity.ngo_id == NGO.id)
    .join(User, NGO.user_id == User.id)
    .filter(
        Opportunity.id == event_id,
        Opportunity.opportunity_type == OpportunityType.EVENT,
        NGO.status == NGOStatus.APPROVED,
        User.is_active.is_(True),
        Opportunity.status.in_([
            OpportunityStatus.PUBLISHED,
            OpportunityStatus.ONGOING,
        ]),
        (
            Opportunity.application_deadline.is_(None)
            | (Opportunity.application_deadline > now)
        ),
        Opportunity.date >= today,
    )
    .first()
)

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    return {
        "id": event.id,
        "title": event.title,
        "description": event.description,
        "location": event.location,
        "date": event.date,
        "start_time": event.start_time,
        "end_time": event.end_time,
        "capacity": event.capacity,
        "requirements": event.requirements,
        "application_deadline": event.application_deadline,
        "status": event.status,
        "ngo_id": event.ngo_id,
        "ngo_name": (
            event.ngo.organization_name
            if event.ngo else None
        ),
    }



# ============================================================
# REGISTER FOR EVENT
# ============================================================

@router.post("/events/{event_id}/register")
def register_for_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.USER)
    ),
):
    volunteer = get_volunteer(
        db,
        current_user
    )

    if not volunteer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                "Volunteer profile not found. "
                "Create a volunteer profile first."
            ),
        )

    
    event = (
    db.query(Opportunity)
    .join(NGO, Opportunity.ngo_id == NGO.id)
    .join(User, NGO.user_id == User.id)
    .filter(
        Opportunity.id == event_id,
        Opportunity.opportunity_type == OpportunityType.EVENT,
        NGO.status == NGOStatus.APPROVED,
        User.is_active.is_(True),
    )
    .first()
)


    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found"
        )

    if event.status != OpportunityStatus.PUBLISHED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "This opportunity is not currently "
                "open for registration"
            ),
        )

    # --------------------------------------------------------
    # EVENT DATE CHECK
    # --------------------------------------------------------

    if event.date and event.date < date.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This event has already started or ended"
        )

    # --------------------------------------------------------
    # APPLICATION DEADLINE CHECK
    # --------------------------------------------------------

    now = datetime.utcnow()

    if (
        event.application_deadline
        and now > event.application_deadline
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The registration deadline has passed"
        )

    # --------------------------------------------------------
    # CHECK EXISTING APPLICATION
    # --------------------------------------------------------

    existing = (
        db.query(Application)
        .filter(
            Application.opportunity_id == event_id,
            Application.volunteer_id == volunteer.id,
        )
        .first()
    )

    if existing:

        # Allow re-registration after withdrawal
        if existing.status == ApplicationStatus.WITHDRAWN:

            existing.status = ApplicationStatus.PENDING
            existing.applied_at = datetime.utcnow()

            notification = Notification(
                user_id=current_user.id,
                title="Event Registration Resubmitted",
                message=(
                    f"Your registration for "
                    f"'{event.title}' has been submitted again."
                ),
                is_read=False,
            )

            db.add(notification)

            if event.ngo:
                ngo_notification = Notification(
                    user_id=event.ngo.user_id,
                    title="New Event Registration",
                    message=(
                        f"A volunteer has registered again "
                        f"for '{event.title}'."
                    ),
                    is_read=False,
                )

                db.add(ngo_notification)

            db.commit()
            db.refresh(existing)

            return {
                "message": "Successfully registered again",
                "application_id": existing.id,
                "event_id": event.id,
                "status": existing.status,
            }

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already registered for this event"
        )

    # --------------------------------------------------------
    # CAPACITY CHECK
    # --------------------------------------------------------

    if event.capacity is not None:

        active_count = (
            db.query(Application)
            .filter(
                Application.opportunity_id == event.id,
                Application.status.in_([
                    ApplicationStatus.PENDING,
                    ApplicationStatus.ACCEPTED,
                ]),
            )
            .count()
        )

        if active_count >= event.capacity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This event is full"
            )

    # --------------------------------------------------------
    # CREATE APPLICATION
    # --------------------------------------------------------

    application = Application(
        opportunity_id=event.id,
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
        title="Event Registration Successful",
        message=(
            f"You have successfully registered for "
            f"'{event.title}'."
        ),
        is_read=False,
    )

    db.add(notification)

    # --------------------------------------------------------
    # NOTIFY NGO
    # --------------------------------------------------------

    if event.ngo:
        ngo_notification = Notification(
            user_id=event.ngo.user_id,
            title="New Event Registration",
            message=(
                f"A volunteer has registered for "
                f"'{event.title}'."
            ),
            is_read=False,
        )

        db.add(ngo_notification)

    db.commit()
    db.refresh(application)

    return {
        "message": "Successfully registered for event",
        "application_id": application.id,
        "event_id": event.id,
        "status": application.status,
    }


# ============================================================
# CANCEL EVENT REGISTRATION
# ============================================================

@router.delete("/events/{event_id}/register")
def cancel_registration(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.USER)
    ),
):
    volunteer = get_volunteer(
        db,
        current_user
    )

    if not volunteer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Volunteer profile not found"
        )

    application = (
        db.query(Application)
        .filter(
            Application.opportunity_id == event_id,
            Application.volunteer_id == volunteer.id,
        )
        .first()
    )

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )

    if application.status == ApplicationStatus.WITHDRAWN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration has already been cancelled"
        )

    if application.status == ApplicationStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Completed registrations cannot be cancelled"
        )

    application.status = ApplicationStatus.WITHDRAWN

    event = application.opportunity

    # --------------------------------------------------------
    # NOTIFY NGO
    # --------------------------------------------------------

    if event and event.ngo:
        notification = Notification(
            user_id=event.ngo.user_id,
            title="Event Registration Cancelled",
            message=(
                f"A volunteer cancelled their registration "
                f"for '{event.title}'."
            ),
            is_read=False,
        )

        db.add(notification)

    db.commit()

    return {
        "message": "Event registration cancelled successfully",
        "event_id": event_id,
        "application_id": application.id,
        "status": application.status,
    }


# ============================================================
# VIEW MY ACTIVITIES
# ============================================================

@router.get("/activities")
def get_my_activities(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.USER)
    ),
):
    volunteer = get_volunteer(
        db,
        current_user
    )

    if not volunteer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Volunteer profile not found"
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

    result = []

    for application in applications:

        opportunity = application.opportunity

        if not opportunity:
            continue

        result.append({
            "application_id": application.id,
            "opportunity_id": opportunity.id,
            "title": opportunity.title,
            "description": opportunity.description,
            "opportunity_type": opportunity.opportunity_type,
            "location": opportunity.location,
            "date": opportunity.date,
            "start_time": opportunity.start_time,
            "end_time": opportunity.end_time,
            "application_status": application.status,
            "opportunity_status": opportunity.status,
            "applied_at": application.applied_at,
            "ngo_id": opportunity.ngo_id,
            "ngo_name": (
                opportunity.ngo.organization_name
                if opportunity.ngo
                else None
            ),
        })

    return result


# ============================================================
# VIEW ACTIVITY HISTORY
# ============================================================

@router.get("/activities/history")
def get_activity_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.USER)
    ),
):
    volunteer = get_volunteer(
        db,
        current_user
    )

    if not volunteer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Volunteer profile not found"
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

    now = datetime.utcnow()
    result = []

    for application in applications:

        opportunity = application.opportunity

        if not opportunity:
            continue

        is_past = False

        if opportunity.date:
            is_past = opportunity.date < date.today()

        is_completed = (
            application.status
            == ApplicationStatus.COMPLETED
            or opportunity.status
            == OpportunityStatus.COMPLETED
            or is_past
        )

        is_withdrawn = (
            application.status
            == ApplicationStatus.WITHDRAWN
        )

        if is_completed or is_withdrawn:

            result.append({
                "application_id": application.id,
                "opportunity_id": opportunity.id,
                "title": opportunity.title,
                "description": opportunity.description,
                "opportunity_type": opportunity.opportunity_type,
                "location": opportunity.location,
                "date": opportunity.date,
                "start_time": opportunity.start_time,
                "end_time": opportunity.end_time,
                "application_status": application.status,
                "opportunity_status": opportunity.status,
                "applied_at": application.applied_at,
                "ngo_id": opportunity.ngo_id,
                "ngo_name": (
                    opportunity.ngo.organization_name
                    if opportunity.ngo
                    else None
                ),
            })

    return result


# ============================================================
# VIEW MY EVENT REGISTRATIONS
# ============================================================

@router.get("/events/my")
def get_my_event_registrations(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.USER)
    ),
):
    volunteer = get_volunteer(
        db,
        current_user
    )

    if not volunteer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Volunteer profile not found"
        )

    applications = (
        db.query(Application)
        .join(
            Opportunity,
            Application.opportunity_id == Opportunity.id
        )
        .filter(
            Application.volunteer_id == volunteer.id,
            Opportunity.opportunity_type
            == OpportunityType.EVENT,
        )
        .order_by(
            Opportunity.date.asc()
        )
        .all()
    )

    return [
        {
            "application_id": application.id,
            "event_id": application.opportunity_id,
            "title": application.opportunity.title,
            "date": application.opportunity.date,
            "location": application.opportunity.location,
            "status": application.status,
        }
        for application in applications
    ]