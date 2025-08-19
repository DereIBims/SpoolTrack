from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from .models import (
    Product, ProductRead, CreateProduct,
    Spool, SpoolRead, CreateSpool,
    WeightReading, UpdateWeight,
)
from .db import init_db, get_session
from .utils import clamp_nonnegative

app = FastAPI(
    title="Spool Manager API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

# === Products ===
@app.post("/api/products", response_model=ProductRead)
def create_product(data: CreateProduct, session: Session = Depends(get_session)):
    prod = Product.model_validate(data)
    session.add(prod)
    session.commit()
    session.refresh(prod)
    return prod

@app.get("/api/products", response_model=list[ProductRead])
def list_products(session: Session = Depends(get_session)):
    return session.exec(select(Product)).all()

# === Spools ===
@app.post("/api/spools", response_model=SpoolRead)
def create_spool(data: CreateSpool, session: Session = Depends(get_session)):
    prod = session.get(Product, data.product_id)
    if not prod:
        raise HTTPException(404, "Product not found")
    net = data.net_start_g or prod.nominal_net_g
    tare = data.gross_start_g - net
    spool = Spool(
        product_id=prod.id,
        gross_start_g=data.gross_start_g,
        net_start_g=net,
        tare_g=tare,
        net_current_g=net,
        label_note=data.label_note,
    )
    session.add(spool)
    session.commit()
    session.refresh(spool)
    return SpoolRead.model_validate(spool)

@app.get("/api/spools", response_model=list[SpoolRead])
def list_spools(session: Session = Depends(get_session)):
    spools = session.exec(select(Spool)).all()
    return [SpoolRead.model_validate(s) for s in spools]

@app.get("/api/spools/{spool_id}", response_model=SpoolRead)
def get_spool(spool_id: str, session: Session = Depends(get_session)):
    s = session.get(Spool, spool_id)
    if not s:
        raise HTTPException(404, "Spool not found")
    return SpoolRead.model_validate(s)

# === Weight update (Smart-Scale) ===
@app.post("/api/spools/{spool_id}/weight", response_model=SpoolRead)
def update_weight(spool_id: str, body: UpdateWeight, session: Session = Depends(get_session)):
    s = session.get(Spool, spool_id)
    if not s:
        raise HTTPException(404, "Spool not found")

    previously_positive = s.net_current_g > 0

    reading = WeightReading(spool_id=spool_id, measured_g=body.measured_g)
    session.add(reading)

    s.net_current_g = clamp_nonnegative(body.measured_g - s.tare_g)

    # Wenn leer geworden -> Lagerstand (unopened) beim zugehörigen Produkt -1
    if previously_positive and s.net_current_g == 0:
        prod = session.get(Product, s.product_id)
        if prod and prod.stock_unopened > 0:
            prod.stock_unopened -= 1
            session.add(prod)

    session.add(s)
    session.commit()
    session.refresh(s)
    return SpoolRead.model_validate(s)

# === Labeldaten (Frontend rendert QR) ===
@app.get("/api/spools/{spool_id}/label")
def label_data(spool_id: str, session: Session = Depends(get_session)):
    s = session.get(Spool, spool_id)
    if not s:
        raise HTTPException(404, "Spool not found")
    p = session.get(Product, s.product_id)
    return {
        "spool_id": s.id,
        "manufacturer": p.manufacturer,
        "name": p.name,
        "material": p.material,
        "color_name": p.color_name,
        "color_hex": p.color_hex,
        "net_current_g": s.net_current_g,
        "note": s.label_note,
    }
