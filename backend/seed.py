from datetime import datetime, timedelta

from app.database import SessionLocal
from app.models.models import (
    User,
    UserRole,
    NGO,
    NGOStatus,
    VolunteerProfile,
    Service,
    Opportunity,
)
from app.services.auth import hash_password


def seed_database():
    db = SessionLocal()

    try:
        # Prevent duplicate seed data
        existing_user = (
            db.query(User)
            .filter(User.email == "admin@volunteergrid.com")
            .first()
        )

        if existing_user:
            print("Seed data already exists.")
            return

        # -------------------------
        # USERS
        # -------------------------

        admin = User(
            name="VolunteerGrid Admin",
            email="admin@volunteergrid.com",
            password_hash=hash_password("Admin@123"),
            role=UserRole.ADMIN,
            phone="9000000001",
        )

        user = User(
            name="Test User",
            email="user@volunteergrid.com",
            password_hash=hash_password("User@123"),
            role=UserRole.USER,
            phone="9000000002",
        )

        # This is NOT a separate volunteer role.
        # It is a normal USER who has a volunteer profile.
        volunteer_user = User(
            name="Test Volunteer",
            email="volunteer@volunteergrid.com",
            password_hash=hash_password("Volunteer@123"),
            role=UserRole.USER,
            phone="9000000003",
        )

        ngo_user_1 = User(
            name="Helping Hands Admin",
            email="ngo1@volunteergrid.com",
            password_hash=hash_password("Ngo@123"),
            role=UserRole.NGO,
            phone="9000000004",
        )

        ngo_user_2 = User(
            name="Green Earth Admin",
            email="ngo2@volunteergrid.com",
            password_hash=hash_password("Ngo@123"),
            role=UserRole.NGO,
            phone="9000000005",
        )

        db.add_all([
            admin,
            user,
            volunteer_user,
            ngo_user_1,
            ngo_user_2,
        ])

        db.flush()

        # -------------------------
        # VOLUNTEER PROFILE
        # -------------------------

        volunteer_profile = VolunteerProfile(
            user_id=volunteer_user.id,
            skills="Teaching, Event Management",
            interests="Education, Environment",
            availability="Weekends",
            location="Chennai",
        )

        db.add(volunteer_profile)

        # -------------------------
        # NGOs
        # -------------------------

        ngo1 = NGO(
            user_id=ngo_user_1.id,
            organization_name="Helping Hands Foundation",
            description=(
                "Supporting communities through food, education "
                "and essential services."
            ),
            address="Chennai",
            website="https://example.com/helping-hands",
            status=NGOStatus.APPROVED,
            approved_at=datetime.utcnow(),
        )

        ngo2 = NGO(
            user_id=ngo_user_2.id,
            organization_name="Green Earth Foundation",
            description=(
                "Working towards environmental awareness "
                "and community participation."
            ),
            address="Chennai",
            website="https://example.com/green-earth",
            status=NGOStatus.APPROVED,
            approved_at=datetime.utcnow(),
        )

        db.add_all([ngo1, ngo2])

        db.flush()

        # -------------------------
        # SERVICES
        # -------------------------

        services = [
            Service(
                ngo_id=ngo1.id,
                name="Food Assistance",
                description=(
                    "Food support for individuals and families in need."
                ),
            ),
            Service(
                ngo_id=ngo1.id,
                name="Educational Support",
                description=(
                    "Educational assistance and learning support for children."
                ),
            ),
            Service(
                ngo_id=ngo2.id,
                name="Environmental Awareness",
                description=(
                    "Community programs focused on environmental awareness."
                ),
            ),
        ]

        db.add_all(services)

        # -------------------------
        # OPPORTUNITIES
        # -------------------------

        opportunities = [
            Opportunity(
                ngo_id=ngo1.id,
                title="Weekend Food Distribution",
                description=(
                    "Help distribute food packages to families in need."
                ),
                location="Chennai",
                date=datetime.utcnow() + timedelta(days=7),
                capacity=20,
            ),
            Opportunity(
                ngo_id=ngo1.id,
                title="Community Teaching Program",
                description=(
                    "Volunteer to teach basic subjects to children."
                ),
                location="Chennai",
                date=datetime.utcnow() + timedelta(days=14),
                capacity=10,
            ),
            Opportunity(
                ngo_id=ngo2.id,
                title="Beach Cleanup Drive",
                description=(
                    "Join our community beach cleanup initiative."
                ),
                location="Chennai",
                date=datetime.utcnow() + timedelta(days=10),
                capacity=30,
            ),
        ]

        db.add_all(opportunities)

        db.commit()

        print("Seed data created successfully!")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()