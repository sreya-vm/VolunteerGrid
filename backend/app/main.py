from fastapi import FastAPI

from app.routers import (
    auth,
    user,
    admin,
    ngo,
    volunteer,
    opportunity,
    service_request,
    notification,
)


app = FastAPI(
    title="VolunteerGrid API",
    description="Backend API for the VolunteerGrid platform",
    version="1.0.0",
)


# ============================================================
# ROUTERS
# ============================================================

app.include_router(auth.router)
app.include_router(user.router)
app.include_router(admin.router)
app.include_router(ngo.router)
app.include_router(volunteer.router)
app.include_router(opportunity.router)
app.include_router(service_request.router)
app.include_router(notification.router)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "Welcome to VolunteerGrid API",
        "version": "1.0.0",
        "docs": "/docs",
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }