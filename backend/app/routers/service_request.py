from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_roles
from app.models.models import (
    User,
    UserRole,
    NGO,
    Service,
    ServiceRequest,
    RequestStatus,
)
from app.schemas.service_request import (
    ServiceRequestCreate,
    ServiceRequestResponse,
)


router = APIRouter(
    prefix="/service-requests",
    tags=["Service Requests"]
)


# --------------------------------------------------
# REQUEST A SERVICE
# --------------------------------------------------

@router.post(
    "/",
    response_model=ServiceRequestResponse
)
def create_service_request(
    request_data: ServiceRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.USER)
    )
):
    # Check whether NGO exists and is approved
    ngo = (
        db.query(NGO)
        .filter(
            NGO.id == request_data.ngo_id,
            NGO.status == "approved"
        )
        .first()
    )

    if not ngo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="NGO not found"
        )

    # Check whether the requested service exists
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

    # Create service request
    service_request = ServiceRequest(
        user_id=current_user.id,
        ngo_id=ngo.id,
        service_type=service.name,
        description=request_data.description,
        location=request_data.location,
        status=RequestStatus.PENDING,
    )

    db.add(service_request)
    db.commit()
    db.refresh(service_request)

    return service_request


# --------------------------------------------------
# VIEW MY SERVICE REQUESTS
# --------------------------------------------------

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
        .order_by(ServiceRequest.created_at.desc())
        .all()
    )

    return requests