from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_roles
from app.models.models import (
    NGO,
    NGOStatus,
    User,
    UserRole,
    Opportunity,
    OpportunityStatus,
    Application,
    ApplicationStatus,
    Service,
    Notification,
    AuditLog,
)
from app.schemas.ngo import NGOCreate
from app.schemas.opportunity import OpportunityCreate
from app.schemas.service import (
    ServiceCreate,
    ServiceUpdate,
    ServiceResponse,
)

from datetime import datetime
import os

from fastapi import APIRouter, Depends, HTTPException, status
from app.notifications.email import send_email
router = APIRouter(
    prefix="/ngo",
    tags=["NGO"]
)


# ============================================================
# HELPER - GET CURRENT NGO
# ============================================================

def get_current_ngo(
    db: Session,
    current_user: User
):
    ngo = (
        db.query(NGO)
        .filter(
            NGO.user_id == current_user.id
        )
        .first()
    )

    if not ngo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="NGO profile not found"
        )

    return ngo


# ============================================================
# CREATE NGO DETAILS
# ============================================================

@router.post(
    "/details",
    status_code=status.HTTP_201_CREATED
)
def create_ngo_details(
    ngo_data: NGOCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.NGO)
    )
):
    existing_ngo = (
        db.query(NGO)
        .filter(
            NGO.user_id == current_user.id
        )
        .first()
    )

    if existing_ngo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="NGO details have already been submitted"
        )

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

    # --------------------------------------------------------
    # EMAIL ADMIN ABOUT NGO APPROVAL REQUEST
    # --------------------------------------------------------

    admin_email = os.getenv("ADMIN_EMAIL")

    email_sent = False

    if admin_email:
        try:
            send_email(
                recipient=admin_email,
                subject="VolunteerGrid - NGO Approval Request",
                body=(
                    "A new NGO has requested approval on VolunteerGrid.\n\n"
                    f"NGO Name: {ngo.organization_name}\n"
                    f"NGO Email: {current_user.email}\n"
                    f"NGO ID: {ngo.id}\n\n"
                    "Please review the NGO from the VolunteerGrid "
                    "admin dashboard."
                ),
            )

            email_sent = True

        except Exception as exc:
            print(
                f"Failed to send NGO approval request email: {exc}"
            )

    return {
        "message": (
            "NGO details submitted successfully "
            "and are pending approval"
        ),
        "ngo_id": ngo.id,
        "status": ngo.status,
        "email_sent": email_sent,
    }
# ============================================================
# GET MY NGO DETAILS
# ============================================================

@router.get("/details")
def get_my_ngo_details(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.NGO)
    )
):
    ngo = get_current_ngo(
        db,
        current_user
    )

    return {
        "id": ngo.id,
        "user_id": ngo.user_id,
        "organization_name": ngo.organization_name,
        "description": ngo.description,
        "address": ngo.address,
        "website": ngo.website,
        "status": ngo.status,
        "approved_at": ngo.approved_at,
        "created_at": ngo.created_at,
    }


# ============================================================
# UPDATE NGO DETAILS
# ============================================================

@router.put("/details")
def update_ngo_details(
    ngo_data: NGOCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.NGO)
    )
):
    ngo = get_current_ngo(
        db,
        current_user
    )

    was_rejected = ngo.status == NGOStatus.REJECTED

    ngo.organization_name = ngo_data.organization_name
    ngo.description = ngo_data.description
    ngo.address = ngo_data.address
    ngo.website = ngo_data.website

    # If NGO changes its details after rejection,
    # allow it to go through approval again.
    if was_rejected:
        ngo.status = NGOStatus.PENDING
        ngo.approved_at = None

    db.commit()
    db.refresh(ngo)

    email_sent = False

    # --------------------------------------------------------
    # EMAIL ADMIN WHEN REJECTED NGO RESUBMITS
    # --------------------------------------------------------

    if was_rejected:
        admin_email = os.getenv("ADMIN_EMAIL")

        if admin_email:
            try:
                send_email(
                    recipient=admin_email,
                    subject="VolunteerGrid - NGO Resubmitted for Approval",
                    body=(
                        "An NGO has updated its previously rejected "
                        "application and resubmitted it for approval.\n\n"
                        f"NGO Name: {ngo.organization_name}\n"
                        f"NGO Email: {current_user.email}\n"
                        f"NGO ID: {ngo.id}\n\n"
                        "Please review the updated NGO details "
                        "from the VolunteerGrid admin dashboard."
                    ),
                )

                email_sent = True

            except Exception as exc:
                print(
                    f"Failed to send NGO resubmission email: {exc}"
                )

    return {
        "message": "NGO details updated successfully",
        "ngo_id": ngo.id,
        "status": ngo.status,
        "email_sent": email_sent,
    }


# ============================================================
# CREATE OPPORTUNITY
# ============================================================

@router.post(
    "/opportunities",
    status_code=status.HTTP_201_CREATED
)
def create_opportunity(
    opportunity_data: OpportunityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.NGO)
    )
):
    ngo = get_current_ngo(
        db,
        current_user
    )

    if ngo.status != NGOStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Only approved NGOs can create "
                "opportunities"
            )
        )

    if (
        opportunity_data.capacity is not None
        and opportunity_data.capacity <= 0
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Capacity must be greater than zero"
        )

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
        application_deadline=(
            opportunity_data.application_deadline
        ),
        status=OpportunityStatus.PUBLISHED,
    )

    db.add(opportunity)
    db.commit()
    db.refresh(opportunity)

    return {
        "message": "Opportunity created successfully",
        "opportunity_id": opportunity.id,
        "status": opportunity.status,
    }


# ============================================================
# VIEW MY OPPORTUNITIES
# ============================================================

@router.get("/opportunities")
def get_my_opportunities(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.NGO)
    )
):
    ngo = get_current_ngo(
        db,
        current_user
    )

    opportunities = (
        db.query(Opportunity)
        .filter(
            Opportunity.ngo_id == ngo.id
        )
        .order_by(
            Opportunity.created_at.desc()
        )
        .all()
    )

    return opportunities


# ============================================================
# VIEW SINGLE OPPORTUNITY
# ============================================================

@router.get("/opportunities/{opportunity_id}")
def get_my_opportunity(
    opportunity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.NGO)
    )
):
    ngo = get_current_ngo(
        db,
        current_user
    )

    opportunity = (
        db.query(Opportunity)
        .filter(
            Opportunity.id == opportunity_id,
            Opportunity.ngo_id == ngo.id
        )
        .first()
    )

    if not opportunity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found"
        )

    return opportunity


# ============================================================
# UPDATE OPPORTUNITY
# ============================================================

@router.put("/opportunities/{opportunity_id}")
def update_opportunity(
    opportunity_id: int,
    opportunity_data: OpportunityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.NGO)
    )
):
    ngo = get_current_ngo(
        db,
        current_user
    )

    opportunity = (
        db.query(Opportunity)
        .filter(
            Opportunity.id == opportunity_id,
            Opportunity.ngo_id == ngo.id
        )
        .first()
    )

    if not opportunity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found"
        )

    if opportunity.status == OpportunityStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Completed opportunities cannot be edited"
        )

    if opportunity.status == OpportunityStatus.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cancelled opportunities cannot be edited"
        )

    if (
        opportunity_data.capacity is not None
        and opportunity_data.capacity <= 0
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Capacity must be greater than zero"
        )

    opportunity.title = opportunity_data.title
    opportunity.description = opportunity_data.description
    opportunity.opportunity_type = (
        opportunity_data.opportunity_type
    )
    opportunity.payment_type = (
        opportunity_data.payment_type
    )
    opportunity.location = opportunity_data.location
    opportunity.date = opportunity_data.date
    opportunity.start_time = opportunity_data.start_time
    opportunity.end_time = opportunity_data.end_time
    opportunity.requirements = opportunity_data.requirements
    opportunity.capacity = opportunity_data.capacity
    opportunity.application_deadline = (
        opportunity_data.application_deadline
    )

    db.commit()
    db.refresh(opportunity)

    return {
        "message": "Opportunity updated successfully",
        "opportunity_id": opportunity.id,
    }


# ============================================================
# UPDATE OPPORTUNITY STATUS
# ============================================================

@router.patch(
    "/opportunities/{opportunity_id}/status"
)
def update_opportunity_status(
    opportunity_id: int,
    new_status: OpportunityStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.NGO)
    )
):
    ngo = get_current_ngo(
        db,
        current_user
    )

    opportunity = (
        db.query(Opportunity)
        .filter(
            Opportunity.id == opportunity_id,
            Opportunity.ngo_id == ngo.id
        )
        .first()
    )

    if not opportunity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found"
        )

    old_status = opportunity.status

    # Prevent reopening completed opportunities
    if (
        old_status == OpportunityStatus.COMPLETED
        and new_status != OpportunityStatus.COMPLETED
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Completed opportunities cannot "
                "be reopened"
            )
        )

    # Prevent reopening cancelled opportunities
    if (
        old_status == OpportunityStatus.CANCELLED
        and new_status != OpportunityStatus.CANCELLED
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Cancelled opportunities cannot "
                "be reopened"
            )
        )

    opportunity.status = new_status

    audit_log = AuditLog(
        user_id=current_user.id,
        action=(
            f"opportunity_status_{new_status.value}"
        ),
        entity="opportunity",
        entity_id=opportunity.id,
    )

    db.add(audit_log)

    db.commit()
    db.refresh(opportunity)

    return {
        "message": "Opportunity status updated successfully",
        "opportunity_id": opportunity.id,
        "old_status": old_status,
        "new_status": opportunity.status,
    }


# ============================================================
# REPOST OPPORTUNITY
# ============================================================

@router.post(
    "/opportunities/{opportunity_id}/repost",
    status_code=status.HTTP_201_CREATED
)
def repost_opportunity(
    opportunity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.NGO)
    )
):
    ngo = get_current_ngo(
        db,
        current_user
    )

    if ngo.status != NGOStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only approved NGOs can repost opportunities"
        )

    original = (
        db.query(Opportunity)
        .filter(
            Opportunity.id == opportunity_id,
            Opportunity.ngo_id == ngo.id
        )
        .first()
    )

    if not original:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found"
        )

    repost = Opportunity(
        ngo_id=ngo.id,
        title=original.title,
        description=original.description,
        opportunity_type=original.opportunity_type,
        payment_type=original.payment_type,
        location=original.location,
        date=original.date,
        start_time=original.start_time,
        end_time=original.end_time,
        requirements=original.requirements,
        capacity=original.capacity,
        application_deadline=original.application_deadline,
        status=OpportunityStatus.PUBLISHED,
        original_opportunity_id=original.id,
    )

    db.add(repost)
    db.commit()
    db.refresh(repost)

    return {
        "message": "Opportunity reposted successfully",
        "original_opportunity_id": original.id,
        "new_opportunity_id": repost.id,
    }


# ============================================================
# CREATE SERVICE
# ============================================================

@router.post(
    "/services",
    response_model=ServiceResponse,
    status_code=status.HTTP_201_CREATED
)
def create_service(
    service_data: ServiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.NGO)
    )
):
    ngo = get_current_ngo(
        db,
        current_user
    )

    if ngo.status != NGOStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only approved NGOs can create services"
        )

    if not service_data.name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Service name cannot be empty"
        )

    service = Service(
        ngo_id=ngo.id,
        name=service_data.name.strip(),
        description=service_data.description,
    )

    db.add(service)
    db.commit()
    db.refresh(service)

    return service


# ============================================================
# VIEW MY SERVICES
# ============================================================

@router.get("/services")
def get_my_services(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.NGO)
    )
):
    ngo = get_current_ngo(
        db,
        current_user
    )

    services = (
        db.query(Service)
        .filter(
            Service.ngo_id == ngo.id
        )
        .order_by(Service.id.desc())
        .all()
    )

    return services


# ============================================================
# UPDATE SERVICE
# ============================================================

@router.put(
    "/services/{service_id}",
    response_model=ServiceResponse
)
def update_service(
    service_id: int,
    service_data: ServiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.NGO)
    )
):
    ngo = get_current_ngo(
        db,
        current_user
    )

    service = (
        db.query(Service)
        .filter(
            Service.id == service_id,
            Service.ngo_id == ngo.id
        )
        .first()
    )

    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )

    if service_data.name is not None:
        if not service_data.name.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Service name cannot be empty"
            )

        service.name = service_data.name.strip()

    if service_data.description is not None:
        service.description = service_data.description

    db.commit()
    db.refresh(service)

    return service

# ============================================================
# DELETE SERVICE
# ============================================================

@router.delete("/services/{service_id}")
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.NGO)
    )
):
    ngo = get_current_ngo(
        db,
        current_user
    )

    service = (
        db.query(Service)
        .filter(
            Service.id == service_id,
            Service.ngo_id == ngo.id
        )
        .first()
    )

    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )

    db.delete(service)
    db.commit()

    return {
        "message": "Service deleted successfully",
        "service_id": service_id,
    }


# ============================================================
# VIEW APPLICATIONS FOR NGO OPPORTUNITIES
# ============================================================

@router.get("/applications")
def get_ngo_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.NGO)
    )
):
    ngo = get_current_ngo(
        db,
        current_user
    )

    applications = (
        db.query(Application)
        .join(
            Opportunity,
            Application.opportunity_id == Opportunity.id
        )
        .filter(
            Opportunity.ngo_id == ngo.id
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
            "opportunity_title": (
                application.opportunity.title
                if application.opportunity
                else None
            ),
            "volunteer_profile_id": application.volunteer_id,
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
            "skills": (
                application.volunteer.skills
                if application.volunteer
                else None
            ),
            "interests": (
                application.volunteer.interests
                if application.volunteer
                else None
            ),
            "availability": (
                application.volunteer.availability
                if application.volunteer
                else None
            ),
            "location": (
                application.volunteer.location
                if application.volunteer
                else None
            ),
            "status": application.status,
            "applied_at": application.applied_at,
        }
        for application in applications
    ]


# ============================================================
# ACCEPT APPLICATION
# ============================================================

@router.patch(
    "/applications/{application_id}/accept"
)
def accept_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.NGO)
    )
):
    ngo = get_current_ngo(
        db,
        current_user
    )

    application = (
        db.query(Application)
        .join(
            Opportunity,
            Application.opportunity_id == Opportunity.id
        )
        .filter(
            Application.id == application_id,
            Opportunity.ngo_id == ngo.id
        )
        .first()
    )

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    if application.status != ApplicationStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Only pending applications "
                "can be accepted"
            )
        )

    opportunity = application.opportunity

    # Check capacity
    if opportunity.capacity is not None:
        accepted_count = (
            db.query(Application)
            .filter(
                Application.opportunity_id == opportunity.id,
                Application.status == ApplicationStatus.ACCEPTED
            )
            .count()
        )

        if accepted_count >= opportunity.capacity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Opportunity capacity is full"
            )

    application.status = ApplicationStatus.ACCEPTED

    notification = Notification(
        user_id=application.volunteer.user_id,
        title="Application Accepted",
        message=(
            f"Your application for "
            f"'{opportunity.title}' has been accepted."
        ),
        is_read=False,
    )

    db.add(notification)
    db.commit()
    db.refresh(application)

    return {
        "message": "Application accepted successfully",
        "application_id": application.id,
        "status": application.status,
    }


# ============================================================
# REJECT APPLICATION
# ============================================================

@router.patch(
    "/applications/{application_id}/reject"
)
def reject_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.NGO)
    )
):
    ngo = get_current_ngo(
        db,
        current_user
    )

    application = (
        db.query(Application)
        .join(
            Opportunity,
            Application.opportunity_id == Opportunity.id
        )
        .filter(
            Application.id == application_id,
            Opportunity.ngo_id == ngo.id
        )
        .first()
    )

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    if application.status != ApplicationStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Only pending applications "
                "can be rejected"
            )
        )

    application.status = ApplicationStatus.REJECTED

    notification = Notification(
        user_id=application.volunteer.user_id,
        title="Application Rejected",
        message=(
            f"Your application for "
            f"'{application.opportunity.title}' "
            "has been rejected."
        ),
        is_read=False,
    )

    db.add(notification)
    db.commit()
    db.refresh(application)

    return {
        "message": "Application rejected successfully",
        "application_id": application.id,
        "status": application.status,
    }


# ============================================================
# MARK APPLICATION AS COMPLETED
# ============================================================

@router.patch(
    "/applications/{application_id}/complete"
)
def complete_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.NGO)
    )
):
    ngo = get_current_ngo(
        db,
        current_user
    )

    application = (
        db.query(Application)
        .join(
            Opportunity,
            Application.opportunity_id == Opportunity.id
        )
        .filter(
            Application.id == application_id,
            Opportunity.ngo_id == ngo.id
        )
        .first()
    )

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    if application.status != ApplicationStatus.ACCEPTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Only accepted applications "
                "can be completed"
            )
        )

    application.status = ApplicationStatus.COMPLETED

    notification = Notification(
        user_id=application.volunteer.user_id,
        title="Opportunity Completed",
        message=(
            f"Your participation in "
            f"'{application.opportunity.title}' "
            "has been marked as completed."
        ),
        is_read=False,
    )

    db.add(notification)
    db.commit()
    db.refresh(application)

    return {
        "message": "Application marked as completed",
        "application_id": application.id,
        "status": application.status,
    }