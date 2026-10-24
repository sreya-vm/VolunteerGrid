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
    ServiceRequest,
    RequestStatus,
    Notification,
)
from app.schemas.service_request import (
    ServiceRequestCreate,
    ServiceRequestResponse,
)


router = APIRouter(
    prefix="/service-requests",
    tags=["Service Requests"]
)


# ============================================================
# CREATE SERVICE REQUEST
# USER
# ============================================================

@router.post(
    "/",
    response_model=ServiceRequestResponse,
    status_code=status.HTTP_201_CREATED
)
def create_service_request(
    request_data: ServiceRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.USER)
    )
):
    # --------------------------------------------------------
    # Check NGO
    # --------------------------------------------------------

    
    ngo = (
    db.query(NGO)
    .join(User, NGO.user_id == User.id)
    .filter(
        NGO.id == request_data.ngo_id,
        NGO.status == NGOStatus.APPROVED,
        User.is_active.is_(True),
    )
    .first()
)


    if not ngo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Approved NGO not found"
        )

    # --------------------------------------------------------
    # Check service belongs to NGO
    # --------------------------------------------------------

    service = (
        db.query(Service)
        .filter(
            Service.id == request_data.service_id,
            Service.ngo_id == request_data.ngo_id
        )
        .first()
    )

    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found for this NGO"
        )

    # --------------------------------------------------------
    # Create request
    # --------------------------------------------------------

    service_request = ServiceRequest(
        user_id=current_user.id,
        ngo_id=ngo.id,
        service_type=service.name,
        description=request_data.description,
        location=request_data.location,
        status=RequestStatus.PENDING,
    )

    db.add(service_request)

    # --------------------------------------------------------
    # Notify NGO
    # --------------------------------------------------------

    notification = Notification(
        user_id=ngo.user_id,
        title="New Service Request",
        message=(
            f"You received a new service request "
            f"for '{service.name}'."
        ),
        is_read=False,
    )

    db.add(notification)

    db.commit()
    db.refresh(service_request)

    return service_request


# ============================================================
# VIEW MY SERVICE REQUESTS
# USER
# ============================================================

@router.get(
    "/my",
    response_model=list[ServiceRequestResponse]
)
def get_my_service_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.USER)
    )
):
    requests = (
        db.query(ServiceRequest)
        .filter(
            ServiceRequest.user_id == current_user.id
        )
        .order_by(
            ServiceRequest.created_at.desc()
        )
        .all()
    )

    return requests


# ============================================================
# VIEW SINGLE SERVICE REQUEST
# USER
# ============================================================

@router.get(
    "/my/{request_id}",
    response_model=ServiceRequestResponse
)
def get_my_service_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.USER)
    )
):
    service_request = (
        db.query(ServiceRequest)
        .filter(
            ServiceRequest.id == request_id,
            ServiceRequest.user_id == current_user.id
        )
        .first()
    )

    if not service_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service request not found"
        )

    return service_request


# ============================================================
# CANCEL SERVICE REQUEST
# USER
# ============================================================

@router.patch(
    "/my/{request_id}/cancel"
)
def cancel_service_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.USER)
    )
):
    service_request = (
        db.query(ServiceRequest)
        .filter(
            ServiceRequest.id == request_id,
            ServiceRequest.user_id == current_user.id
        )
        .first()
    )

    if not service_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service request not found"
        )

    if service_request.status != RequestStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Only pending service requests "
                "can be cancelled"
            )
        )

    service_request.status = RequestStatus.REJECTED

    # Notify NGO
    if service_request.ngo:
        notification = Notification(
            user_id=service_request.ngo.user_id,
            title="Service Request Cancelled",
            message=(
                f"A user cancelled their service request "
                f"for '{service_request.service_type}'."
            ),
            is_read=False,
        )

        db.add(notification)

    db.commit()
    db.refresh(service_request)

    return {
        "message": "Service request cancelled successfully",
        "request_id": service_request.id,
        "status": service_request.status,
    }


# ============================================================
# VIEW NGO SERVICE REQUESTS
# NGO
# ============================================================

@router.get("/ngo")
def get_ngo_service_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.NGO)
    )
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

    requests = (
        db.query(ServiceRequest)
        .filter(
            ServiceRequest.ngo_id == ngo.id
        )
        .order_by(
            ServiceRequest.created_at.desc()
        )
        .all()
    )

    return [
        {
            "id": request.id,
            "user_id": request.user_id,
            "user_name": (
                request.user.name
                if request.user
                else None
            ),
            "user_email": (
                request.user.email
                if request.user
                else None
            ),
            "service_type": request.service_type,
            "description": request.description,
            "location": request.location,
            "status": request.status,
            "created_at": request.created_at,
        }
        for request in requests
    ]


# ============================================================
# ACCEPT SERVICE REQUEST
# NGO
# ============================================================

@router.patch(
    "/ngo/{request_id}/accept"
)
def accept_service_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.NGO)
    )
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

    service_request = (
        db.query(ServiceRequest)
        .filter(
            ServiceRequest.id == request_id,
            ServiceRequest.ngo_id == ngo.id
        )
        .first()
    )

    if not service_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service request not found"
        )

    if service_request.status != RequestStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Only pending requests "
                "can be accepted"
            )
        )

    service_request.status = RequestStatus.ACCEPTED

    notification = Notification(
        user_id=service_request.user_id,
        title="Service Request Accepted",
        message=(
            f"Your request for "
            f"'{service_request.service_type}' "
            "has been accepted by the NGO."
        ),
        is_read=False,
    )

    db.add(notification)

    db.commit()
    db.refresh(service_request)

    return {
        "message": "Service request accepted successfully",
        "request_id": service_request.id,
        "status": service_request.status,
    }


# ============================================================
# REJECT SERVICE REQUEST
# NGO
# ============================================================

@router.patch(
    "/ngo/{request_id}/reject"
)
def reject_service_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.NGO)
    )
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

    service_request = (
        db.query(ServiceRequest)
        .filter(
            ServiceRequest.id == request_id,
            ServiceRequest.ngo_id == ngo.id
        )
        .first()
    )

    if not service_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service request not found"
        )

    if service_request.status != RequestStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Only pending requests "
                "can be rejected"
            )
        )

    service_request.status = RequestStatus.REJECTED

    notification = Notification(
        user_id=service_request.user_id,
        title="Service Request Rejected",
        message=(
            f"Your request for "
            f"'{service_request.service_type}' "
            "has been rejected by the NGO."
        ),
        is_read=False,
    )

    db.add(notification)

    db.commit()
    db.refresh(service_request)

    return {
        "message": "Service request rejected successfully",
        "request_id": service_request.id,
        "status": service_request.status,
    }


# ============================================================
# COMPLETE SERVICE REQUEST
# NGO
# ============================================================

@router.patch(
    "/ngo/{request_id}/complete"
)
def complete_service_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.NGO)
    )
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

    service_request = (
        db.query(ServiceRequest)
        .filter(
            ServiceRequest.id == request_id,
            ServiceRequest.ngo_id == ngo.id
        )
        .first()
    )

    if not service_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service request not found"
        )

    if service_request.status != RequestStatus.ACCEPTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Only accepted requests "
                "can be completed"
            )
        )

    service_request.status = RequestStatus.COMPLETED

    notification = Notification(
        user_id=service_request.user_id,
        title="Service Request Completed",
        message=(
            f"Your request for "
            f"'{service_request.service_type}' "
            "has been completed."
        ),
        is_read=False,
    )

    db.add(notification)

    db.commit()
    db.refresh(service_request)

    return {
        "message": "Service request completed successfully",
        "request_id": service_request.id,
        "status": service_request.status,
    }