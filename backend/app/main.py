from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

from app.scheduler import start_scheduler, stop_scheduler


app = FastAPI(
    title="VolunteerGrid API",
    description="Backend API for the VolunteerGrid platform",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://your-project.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# START BACKGROUND SCHEDULER
# ============================================================

@app.on_event("startup")
def startup_event():
    start_scheduler()


# ============================================================
# STOP BACKGROUND SCHEDULER
# ============================================================

@app.on_event("shutdown")
def shutdown_event():
    stop_scheduler()


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
    return {"status": "healthy"}