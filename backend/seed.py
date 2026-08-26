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
    OpportunityType,
    PaymentType,
)
from app.services.auth import hash_password


def seed_database():
    db = SessionLocal()

    try:
        # ---------------------------------
        # PREVENT DUPLICATE SEED DATA
        # ---------------------------------

        existing_user = (
            db.query(User)
            .filter(User.email == "admin@volunteergrid.com")
            .first()
        )

        if existing_user:
            print("Seed data already exists.")
            return

        # ---------------------------------
        # USERS
        # ---------------------------------

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

        # ---------------------------------
        # VOLUNTEER PROFILE
        # ---------------------------------

        volunteer_profile = VolunteerProfile(
            user_id=volunteer_user.id,
            skills="Teaching, Event Management",
            interests="Education, Environment",
            availability="Weekends",
            location="Chennai",
        )

        db.add(volunteer_profile)

        # ---------------------------------
        # NGOs
        # ---------------------------------

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

        # ---------------------------------
        # SERVICES
        # ---------------------------------

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

        # ---------------------------------
        # OPPORTUNITIES
        # ---------------------------------

        now = datetime.utcnow()

        opportunities = [
            Opportunity(
                ngo_id=ngo1.id,
                title="Weekend Food Distribution",
                description=(
                    "Help distribute food packages to families in need."
                ),
                opportunity_type=OpportunityType.EVENT,
                payment_type=PaymentType.UNPAID,
                location="Chennai",
                date=now + timedelta(days=7),
                start_time=now + timedelta(days=7, hours=2),
                end_time=now + timedelta(days=7, hours=6),
                requirements=(
                    "Must be available for the full event. "
                    "Comfortable clothing recommended."
                ),
                capacity=20,
                application_deadline=now + timedelta(days=5),
            ),

            Opportunity(
                ngo_id=ngo1.id,
                title="Community Teaching Volunteer",
                description=(
                    "Volunteer to teach basic subjects to children."
                ),
                opportunity_type=OpportunityType.POSITION,
                payment_type=PaymentType.UNPAID,
                location="Chennai",
                date=None,
                start_time=None,
                end_time=None,
                requirements=(
                    "Basic teaching skills and good communication skills."
                ),
                capacity=10,
                application_deadline=now + timedelta(days=12),
            ),

            Opportunity(
                ngo_id=ngo2.id,
                title="Beach Cleanup Drive",
                description=(
                    "Join our community beach cleanup initiative."
                ),
                opportunity_type=OpportunityType.EVENT,
                payment_type=PaymentType.UNPAID,
                location="Chennai",
                date=now + timedelta(days=10),
                start_time=now + timedelta(days=10, hours=1),
                end_time=now + timedelta(days=10, hours=5),
                requirements=(
                    "Bring a water bottle and wear comfortable clothes."
                ),
                capacity=30,
                application_deadline=now + timedelta(days=8),
            ),

            Opportunity(
                ngo_id=ngo2.id,
                title="Environmental Program Coordinator",
                description=(
                    "Assist with planning and coordinating environmental "
                    "awareness programs."
                ),
                opportunity_type=OpportunityType.POSITION,
                payment_type=PaymentType.PAID,
                location="Chennai",
                date=None,
                start_time=None,
                end_time=None,
                requirements=(
                    "Event management experience and good communication skills."
                ),
                capacity=2,
                application_deadline=now + timedelta(days=20),
            ),
        ]

        db.add_all(opportunities)

        # ---------------------------------
        # SAVE EVERYTHING
        # ---------------------------------

        db.commit()

        print("Seed data created successfully!")

        print("\nTest accounts:")
        print("Admin: admin@volunteergrid.com / Admin@123")
        print("User: user@volunteergrid.com / User@123")
        print("Volunteer: volunteer@volunteergrid.com / Volunteer@123")
        print("Helping Hands NGO: ngo1@volunteergrid.com / Ngo@123")
        print("Green Earth NGO: ngo2@volunteergrid.com / Ngo@123")

    except Exception as e:
        db.rollback()
        print(f"Error while seeding database: {e}")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()