from fastapi import FastAPI

from app.routers.auth import router as auth_router
from app.routers.ngo import router as ngo_router


app = FastAPI(
    title="VolunteerGrid API"
)


app.include_router(auth_router)
app.include_router(ngo_router)


@app.get("/")
def root():
    return {
        "message": "VolunteerGrid API is running"
    }