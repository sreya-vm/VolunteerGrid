from fastapi import FastAPI

from app.routers.auth import router as auth_router
from app.routers.user import router as user_router
from app.routers.volunteer import router as volunteer_router
from app.routers.opportunity import router as opportunity_router
from app.routers.service_request import router as service_request_router
from app.routers.admin import router as admin_router

app = FastAPI(
    title="VolunteerGrid API"
)


app.include_router(auth_router)
app.include_router(user_router)
app.include_router(volunteer_router)
app.include_router(opportunity_router)
app.include_router(service_request_router)
app.include_router(admin_router)


@app.get("/")
def root():
    return {
        "message": "VolunteerGrid API is running"
    }