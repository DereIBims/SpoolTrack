from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
import uuid

class ProductBase(SQLModel):
    name: str
    manufacturer: str
    material: Optional[str] = None  # PLA, PETG, ... (frei als Text)
    color_name: str
    color_hex: str
    nominal_net_g: int = 1000
    stock_unopened: int = 0  # Lagerbestand ungeöffnete Rollen

class Product(ProductBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    spools: List["Spool"] = Relationship(back_populates="product")

class ProductRead(ProductBase):
    id: int

class SpoolBase(SQLModel):
    product_id: int = Field(foreign_key="product.id")
    label_note: Optional[str] = None

class Spool(SpoolBase, table=True):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex[:12], primary_key=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Startgewichte
    net_start_g: int = 1000  # konfigurierbar bei Neuanlage (default 1000)
    gross_start_g: int  # brutto bei Neuanlage (Waage inkl. Spule)
    tare_g: int  # Leergewicht Spule = gross_start_g - net_start_g

    # aktueller Nettorest (bequem für UI)
    net_current_g: int = 1000

    product: Product = Relationship(back_populates="spools")
    readings: List["WeightReading"] = Relationship(back_populates="spool")

class SpoolRead(SQLModel):
    id: str
    product_id: int
    created_at: datetime
    net_start_g: int
    gross_start_g: int
    tare_g: int
    net_current_g: int

class WeightReading(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    spool_id: str = Field(foreign_key="spool.id")
    measured_g: int  # aktuelles Bruttogewicht (Waage inkl. Spule)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    spool: Spool = Relationship(back_populates="readings")

class CreateProduct(ProductBase):
    pass

class CreateSpool(SQLModel):
    product_id: int
    gross_start_g: int
    net_start_g: Optional[int] = 1000  # konfigurierbar
    label_note: Optional[str] = None

class UpdateWeight(SQLModel):
    measured_g: int
