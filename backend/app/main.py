from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"Api do desafio isi-dev-1-JoseRoberto": "Bem-vindo!"}