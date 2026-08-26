from datetime import datetime
from enum import Enum

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum as SQLEnum,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class UserRole(str, Enum):
    ADMIN = "admin"
    NGO = "ngo"
    USER = "user"



class NGOStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class RequestStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    COMPLETED = "completed"


class ApplicationStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"

class OpportunityType(str, Enum):
    EVENT = "event"
    POSITION = "position"

class PaymentType(str, Enum):
    PAID = "paid"
    UNPAID = "unpaid"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole))
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    ngo: Mapped["NGO | None"] = relationship(back_populates="user")
    volunteer_profile: Mapped["VolunteerProfile | None"] = relationship(
        back_populates="user"
    )
    service_requests: Mapped[list["ServiceRequest"]] = relationship(
        back_populates="user"
    )
    notifications: Mapped[list["Notification"]] = relationship(
        back_populates="user"
    )


class NGO(Base):
    __tablename__ = "ngos"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)

    organization_name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    address: Mapped[str | None] = mapped_column(String(300), nullable=True)
    website: Mapped[str | None] = mapped_column(String(255), nullable=True)

    status: Mapped[NGOStatus] = mapped_column(
        SQLEnum(NGOStatus),
        default=NGOStatus.PENDING,
    )

    approved_at: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    user: Mapped["User"] = relationship(back_populates="ngo")
    opportunities: Mapped[list["Opportunity"]] = relationship(
        back_populates="ngo"
    )
    services: Mapped[list["Service"]] = relationship(
        back_populates="ngo"
    )
    service_requests: Mapped[list["ServiceRequest"]] = relationship(
        back_populates="ngo"
    )


class VolunteerProfile(Base):
    __tablename__ = "volunteer_profiles"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        unique=True
    )

    skills: Mapped[str | None] = mapped_column(Text, nullable=True)
    interests: Mapped[str | None] = mapped_column(Text, nullable=True)
    availability: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )
    location: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    user: Mapped["User"] = relationship(
        back_populates="volunteer_profile"
    )

    applications: Mapped[list["Application"]] = relationship(
        back_populates="volunteer"
    )



class Opportunity(Base):
    __tablename__ = "opportunities"

    id: Mapped[int] = mapped_column(primary_key=True)
    ngo_id: Mapped[int] = mapped_column(ForeignKey("ngos.id"))

    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)

    opportunity_type: Mapped[OpportunityType] = mapped_column(
        SQLEnum(OpportunityType)
    )

    payment_type: Mapped[PaymentType] = mapped_column(
        SQLEnum(PaymentType)
    )

    location: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    date: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )

    start_time: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )

    end_time: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )

    requirements: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    capacity: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    application_deadline: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    ngo: Mapped["NGO"] = relationship(
        back_populates="opportunities"
    )

    applications: Mapped[list["Application"]] = relationship(
        back_populates="opportunity"
    )


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(primary_key=True)
    opportunity_id: Mapped[int] = mapped_column(
        ForeignKey("opportunities.id")
    )
    volunteer_id: Mapped[int] = mapped_column(
        ForeignKey("volunteer_profiles.id")
    )

    status: Mapped[ApplicationStatus] = mapped_column(
        SQLEnum(ApplicationStatus),
        default=ApplicationStatus.PENDING,
    )

    applied_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    opportunity: Mapped["Opportunity"] = relationship(
        back_populates="applications"
    )
    volunteer: Mapped["VolunteerProfile"] = relationship(
        back_populates="applications"
    )


class Service(Base):
    __tablename__ = "services"

    id: Mapped[int] = mapped_column(primary_key=True)
    ngo_id: Mapped[int] = mapped_column(ForeignKey("ngos.id"))

    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)

    ngo: Mapped["NGO"] = relationship(back_populates="services")


class ServiceRequest(Base):
    __tablename__ = "service_requests"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    ngo_id: Mapped[int | None] = mapped_column(
        ForeignKey("ngos.id"),
        nullable=True,
    )

    service_type: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)

    status: Mapped[RequestStatus] = mapped_column(
        SQLEnum(RequestStatus),
        default=RequestStatus.PENDING,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    user: Mapped["User"] = relationship(back_populates="service_requests")
    ngo: Mapped["NGO | None"] = relationship(
        back_populates="service_requests"
    )


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    title: Mapped[str] = mapped_column(String(200))
    message: Mapped[str] = mapped_column(Text)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    user: Mapped["User"] = relationship(back_populates="notifications")


class EmailLog(Base):
    __tablename__ = "email_logs"

    id: Mapped[int] = mapped_column(primary_key=True)

    recipient: Mapped[str] = mapped_column(String(255))
    subject: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(50))
    event_type: Mapped[str] = mapped_column(String(100))

    sent_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )


class Feedback(Base):
    __tablename__ = "feedback"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    opportunity_id: Mapped[int | None] = mapped_column(
        ForeignKey("opportunities.id"),
        nullable=True,
    )

    rating: Mapped[int] = mapped_column(Integer)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
    )

    action: Mapped[str] = mapped_column(String(100))
    entity: Mapped[str] = mapped_column(String(100))
    entity_id: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )