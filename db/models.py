from datetime import datetime
from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class SessionModel(Base):
    __tablename__ = "sessions"
    id = Column(String, primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    metadata_json = Column(JSON, default={})
    queries = relationship("QueryModel", back_populates="session")

class QueryModel(Base):
    __tablename__ = "queries"
    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, ForeignKey("sessions.id"))
    prompt = Column(String)
    graph_json = Column(JSON) # Execution DAG
    status = Column(String) # success, error
    created_at = Column(DateTime, default=datetime.utcnow)
    session = relationship("SessionModel", back_populates="queries")
    hypotheses = relationship("HypothesisModel", back_populates="query")

class HypothesisModel(Base):
    __tablename__ = "hypotheses"
    id = Column(String, primary_key=True)
    query_id = Column(Integer, ForeignKey("queries.id"))
    statement = Column(String)
    explanation = Column(String)
    confidence = Column(Float)
    status = Column(String) # proposed, validated, rejected
    query = relationship("QueryModel", back_populates="hypotheses")

class ArtifactModel(Base):
    __tablename__ = "artifacts"
    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, ForeignKey("sessions.id"))
    type = Column(String) # chart, csv, pdf
    path = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
