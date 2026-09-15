from datetime import date, datetime

from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.models import Opportunity, OpportunityStatus


def update_opportunity_statuses():
    """
    Automatically update opportunity lifecycle statuses.

    PUBLISHED
        -> ONGOING when start time is reached

    ONGOING
        -> COMPLETED when end time is reached

    PUBLISHED
        -> COMPLETED if today's event has already ended

    PUBLISHED
        -> EXPIRED if its date has passed before it started
    """

    db: Session = SessionLocal()

    try:
        opportunities = (
            db.query(Opportunity)
            .filter(
                Opportunity.status.in_([
                    OpportunityStatus.PUBLISHED,
                    OpportunityStatus.ONGOING,
                ])
            )
            .all()
        )

        today = date.today()
        now = datetime.utcnow()

        changed = False

        for opportunity in opportunities:

            if not opportunity.date:
                continue

            # ----------------------------------------------
            # PUBLISHED
            # ----------------------------------------------

            if opportunity.status == OpportunityStatus.PUBLISHED:

                # Event date has completely passed
                if opportunity.date < today:
                    opportunity.status = OpportunityStatus.EXPIRED
                    changed = True
                    continue

                # Event is today
                if opportunity.date == today:

                    # Event has already ended
                    if (
                        opportunity.end_time
                        and now.time() >= opportunity.end_time
                    ):
                        opportunity.status = (
                            OpportunityStatus.COMPLETED
                        )
                        changed = True
                        continue

                    # Event has started
                    if (
                        opportunity.start_time
                        and now.time() >= opportunity.start_time
                    ):
                        opportunity.status = (
                            OpportunityStatus.ONGOING
                        )
                        changed = True
                        continue

            # ----------------------------------------------
            # ONGOING
            # ----------------------------------------------

            elif opportunity.status == OpportunityStatus.ONGOING:

                # Event date has passed
                if opportunity.date < today:
                    opportunity.status = (
                        OpportunityStatus.COMPLETED
                    )
                    changed = True
                    continue

                # Event ends today
                if (
                    opportunity.date == today
                    and opportunity.end_time
                    and now.time() >= opportunity.end_time
                ):
                    opportunity.status = (
                        OpportunityStatus.COMPLETED
                    )
                    changed = True
                    continue

        if changed:
            db.commit()

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


# ============================================================
# SCHEDULER
# ============================================================

scheduler = BackgroundScheduler()


def start_scheduler():
    """
    Start the background scheduler.

    The opportunity status check runs once every minute.
    """

    if not scheduler.running:
        scheduler.add_job(
            update_opportunity_statuses,
            "interval",
            minutes=1,
            id="opportunity_lifecycle",
            replace_existing=True,
        )

        scheduler.start()

        print("Opportunity lifecycle scheduler started")


def stop_scheduler():
    """
    Stop the background scheduler.
    """

    if scheduler.running:
        scheduler.shutdown()

        print("Opportunity lifecycle scheduler stopped")