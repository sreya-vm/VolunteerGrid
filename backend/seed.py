from datetime import datetime, timedelta, time

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
    OpportunityStatus,
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
            .filter(User.email == "volunteergrid.team@gmail.com")
            .first()
        )

        if existing_user:
            print("Seed data already exists.")
            return

        # ---------------------------------
        # USERS
        # ---------------------------------

        # Admin account
        admin = User(
            name="VolunteerGrid Admin",
            email="volunteergrid.team@gmail.com",
            password_hash=hash_password("admin@12345"),
            role=UserRole.ADMIN,
            phone="9000000001",
            is_active=True,
        )

        # Normal user
        user = User(
            name="Test User",
            email="user@volunteergrid.com",
            password_hash=hash_password("User@123"),
            role=UserRole.USER,
            phone="9000000002",
            is_active=True,
        )

        # Volunteer is still a USER.
        # Having a VolunteerProfile makes this user a volunteer.
        volunteer_user = User(
            name="Test Volunteer",
            email="volunteer@volunteergrid.com",
            password_hash=hash_password("Volunteer@123"),
            role=UserRole.USER,
            phone="9000000003",
            is_active=True,
        )

        # NGO user 1
        ngo_user_1 = User(
            name="Helping Hands Admin",
            email="ngo1@volunteergrid.com",
            password_hash=hash_password("Ngo@123"),
            role=UserRole.NGO,
            phone="9000000004",
            is_active=True,
        )

        # NGO user 2
        ngo_user_2 = User(
            name="Green Earth Admin",
            email="ngo2@volunteergrid.com",
            password_hash=hash_password("Ngo@123"),
            role=UserRole.NGO,
            phone="9000000005",
            is_active=True,
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

        db.add_all([
            ngo1,
            ngo2,
        ])

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
            # EVENT 1
            Opportunity(
                ngo_id=ngo1.id,
                title="Weekend Food Distribution",
                description=(
                    "Help distribute food packages to families in need."
                ),
                opportunity_type=OpportunityType.EVENT,
                payment_type=PaymentType.UNPAID,
                location="Chennai",
                date=(now + timedelta(days=7)).date(),
                start_time=time(10, 0),
                end_time=time(14, 0),
                requirements=(
                    "Must be available for the full event. "
                    "Comfortable clothing recommended."
                ),
                capacity=20,
                application_deadline=now + timedelta(days=5),
                status=OpportunityStatus.PUBLISHED,
            ),

            # POSITION 1
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
                status=OpportunityStatus.PUBLISHED,
            ),

            # EVENT 2
            Opportunity(
                ngo_id=ngo2.id,
                title="Beach Cleanup Drive",
                description=(
                    "Join our community beach cleanup initiative."
                ),
                opportunity_type=OpportunityType.EVENT,
                payment_type=PaymentType.UNPAID,
                location="Chennai",
                date=(now + timedelta(days=10)).date(),
                start_time=time(9, 0),
                end_time=time(13, 0),
                requirements=(
                    "Bring a water bottle and wear comfortable clothes."
                ),
                capacity=30,
                application_deadline=now + timedelta(days=8),
                status=OpportunityStatus.PUBLISHED,
            ),

            # POSITION 2
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
                status=OpportunityStatus.PUBLISHED,
            ),
        ]

        db.add_all(opportunities)

        # ---------------------------------
        # SAVE EVERYTHING
        # ---------------------------------

        db.commit()

        print("========================================")
        print("Seed data created successfully!")
        print("========================================")

        print("\nTest accounts:")
        print("----------------------------------------")

        print("Admin:")
        print("Email: volunteergrid.team@gmail.com")
        print("Password: admin@12345")

        print("\nNormal User:")
        print("Email: user@volunteergrid.com")
        print("Password: User@123")

        print("\nVolunteer User:")
        print("Email: volunteer@volunteergrid.com")
        print("Password: Volunteer@123")
        print("Role: USER + VolunteerProfile")

        print("\nHelping Hands NGO:")
        print("Email: ngo1@volunteergrid.com")
        print("Password: Ngo@123")

        print("\nGreen Earth NGO:")
        print("Email: ngo2@volunteergrid.com")
        print("Password: Ngo@123")

        print("----------------------------------------")

    except Exception as e:
        db.rollback()
        print(f"Error while seeding database: {e}")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()